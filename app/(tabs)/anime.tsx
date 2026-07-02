import { NetworkStatus } from "@apollo/client";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { fbs } from "fbtee";
import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  View,
  StyleSheet,
  Text,
  FlatList,
} from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { StatusChip } from "yep/components/StatusChip";
import {
  ANILIST_ACCESS_TOKEN_STORAGE,
  MediaListStatusWithLabel,
} from "yep/constants";
import { AnimeListItemContainer } from "yep/containers/AnimeListItemContainer";
import {
  ANIME_LIST_PER_CHUNK,
  mergeAnimeListChunks,
  nextChunkToRequest,
  titleSortForLocale,
} from "yep/graphql/animeListChunks";
import {
  useGetViewerQuery,
  useGetAnimeListQuery,
} from "yep/graphql/generated";
import type {
  AnimeListEntryFragmentFragment,
  MediaListStatus,
} from "yep/graphql/generated";
import { useAniListAuthRequest } from "yep/hooks/auth";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { AnimeSkeleton } from "yep/screens/AnimeScreen/AnimeSkeleton";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { useAccessToken } from "yep/useAccessToken";
import { getMediaListStatusLabel, notEmpty } from "yep/utils";

type StatusOption = {
  label: string;
  value: MediaListStatus;
  isSelected: boolean;
  onPress: () => void;
};
type AnimeListEntry = {
  id: number;
  progress?: number | null;
  media?: AnimeListEntryFragmentFragment | null;
};
type AnimeListRow = {
  entry: AnimeListEntry;
  first: boolean;
  last: boolean;
};

function keyExtractor({ entry }: AnimeListRow) {
  return `${entry.id}`;
}

function statusOptionKeyExtractor({ value }: StatusOption) {
  return `${value}`;
}

function renderStatusOption({
  item: { label, isSelected, onPress },
}: {
  item: StatusOption;
}) {
  return (
    <StatusChip label={label} onPress={onPress} isSelected={isSelected} />
  );
}

function renderAnimeItem({
  item: { entry, first, last },
}: {
  item: AnimeListRow;
}) {
  return (
    <AnimeListItemContainer
      seedData={{
        id: entry.id,
        progress: entry.media?.mediaListEntry?.progress ?? 0,
        media: entry.media ?? null,
      }}
      first={first}
      last={last}
    />
  );
}

function ListFooterSpinner() {
  return (
    <ActivityIndicator color={darkTheme.text} style={styles.footerSpinner} />
  );
}

export default function Anime() {
  const [status, setStatus] = useState<MediaListStatus>(
    MediaListStatusWithLabel[0].value,
  );

  const { accessToken, setAccessToken } = useAccessToken();
  const router = useRouter();
  const { locale } = useLocaleContext();

  const [, , promptAsync] = useAniListAuthRequest();
  const { loading: loadingViewer, data: viewerData } = useGetViewerQuery({
    skip: !accessToken,
  });

  const {
    loading: loadingAnimeList,
    data: animeListData,
    refetch,
    fetchMore,
    networkStatus,
  } = useGetAnimeListQuery({
    skip: !viewerData?.Viewer?.id || !accessToken,
    variables: {
      userId: viewerData?.Viewer?.id,
      status,
      sort: [titleSortForLocale(locale)],
      perChunk: ANIME_LIST_PER_CHUNK,
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  // A user with custom lists or "Split completed list by format" gets several
  // groups back; merge the non-custom ones (custom lists duplicate entries that
  // already live in a status group) instead of showing an arbitrary lists[0].
  // Sort is server-side (title sort matching the locale) so chunks appended by
  // fetchMore keep a stable order — a client re-sort would reshuffle rows
  // mid-scroll. ponytail: split-completed users see per-format groups
  // concatenated rather than one merged A–Z; client-merge after the last chunk
  // if anyone complains.
  const list = (animeListData?.MediaListCollection?.lists ?? []).flatMap(
    (group) =>
      group && !group.isCustomList
        ? (group.entries ?? []).filter(notEmpty)
        : [],
  );

  const statusOptions = MediaListStatusWithLabel.map(({ value }) => ({
    label: getMediaListStatusLabel(value),
    value,
    isSelected: status === value,
    onPress: () => setStatus(value),
  }));

  // `refreshing` (initial-load state) drives the skeleton ListEmptyComponent.
  // The RefreshControl is driven separately by networkStatus === refetch(4),
  // which Apollo sets ONLY for an explicit refetch() (a user pull) — never on
  // initial load (1), a status-chip variable change (2), or background fetches.
  // It auto-resets to ready(7) when the refetch settles, so the spinner clears
  // without any awaited promise or manual state.
  const refreshing = loadingViewer || loadingAnimeList;
  const isRefetching = networkStatus === NetworkStatus.refetch;

  const hasNextChunk = Boolean(
    animeListData?.MediaListCollection?.hasNextChunk,
  );
  const isFetchingMore = networkStatus === NetworkStatus.fetchMore;

  // Fire-and-forget, like onRefresh — never awaited.
  function loadNextChunk() {
    if (!hasNextChunk || isFetchingMore || refreshing) return;
    fetchMore({
      variables: { chunk: nextChunkToRequest(animeListData) },
      updateQuery: (prev, { fetchMoreResult }) =>
        fetchMoreResult ? mergeAnimeListChunks(prev, fetchMoreResult) : prev,
    });
  }
  const listRows = list.map((entry, index) => ({
    entry,
    first: index === 0,
    last: index === list.length - 1,
  }));

  return (
    <View
      style={[styles.outerContainer, { backgroundColor: darkTheme.background }]}
    >
      <Header label={String(fbs("Anime", "Anime tab header label"))} />
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        // An element (not an inline component) so FlatList doesn't remount the
        // header — and reset the chip row's scroll — on every data/status change.
        ListHeaderComponent={
          <View style={{ gap: 16, paddingBottom: 16 }}>
            <View>
              <FlatList
                alwaysBounceVertical={false}
                showsHorizontalScrollIndicator={false}
                horizontal
                contentContainerStyle={{ gap: 8 }}
                data={statusOptions}
                keyExtractor={statusOptionKeyExtractor}
                renderItem={renderStatusOption}
              />
            </View>
            <View style={styles.countAndSortRow}>
              <Text style={styles.count}>
                {String(
                  fbs(
                    [
                      fbs.param("count", String(list.length), {
                        number: list.length,
                      }),
                      " ",
                      fbs.plural("title", list.length, {
                        many: "titles",
                        name: "titleCount",
                      }),
                    ],
                    "Anime list title count",
                  ),
                )}
              </Text>
            </View>
          </View>
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.animeListDivider} />}
        data={listRows}
        ListEmptyComponent={() =>
          refreshing ? (
            <AnimeSkeleton />
          ) : (
            <EmptyState
              title={
                !accessToken
                  ? String(fbs("Log in", "Anime empty state login title"))
                  : String(fbs("Empty list", "Anime empty state title"))
              }
              description={
                !accessToken
                  ? String(
                      fbs(
                        "Start tracking your anime by using an AniList account!",
                        "Anime empty state login description",
                      ),
                    )
                  : String(
                      fbs(
                        "Explore the world of anime by adding some shows to your list!",
                        "Anime empty state list description",
                      ),
                    )
              }
              cta={{
                label: !accessToken
                  ? String(
                      fbs("Log in", "Anime empty state login call to action"),
                    )
                  : String(
                      fbs(
                        "Discover new anime",
                        "Anime empty state discover call to action",
                      ),
                    ),
                onPress: async () => {
                  if (!accessToken) {
                    const result = await promptAsync();

                    if (result.type === "error" || result.type === "success") {
                      if (result.params.access_token) {
                        setAccessToken(result.params.access_token);
                        await SecureStore.setItemAsync(
                          ANILIST_ACCESS_TOKEN_STORAGE,
                          result.params.access_token,
                        );
                      }
                    }
                  } else {
                    router.push("/(tabs)/discover");
                  }
                },
              }}
            />
          )
        }
        // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop -- RefreshControl must be a live element; React Compiler memoizes it
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch({ userId: viewerData?.Viewer?.id, status });
            }}
            tintColor={darkTheme.text}
            titleColor={darkTheme.text}
          />
        }
        keyExtractor={keyExtractor}
        renderItem={renderAnimeItem}
        onEndReached={loadNextChunk}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingMore ? ListFooterSpinner : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  animeListDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: darkTheme.listItemBorder,
  },
  countAndSortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  count: {
    fontFamily: Manrope.regular,
    fontSize: 12.8,
    color: darkTheme.listCount,
  },
  footerSpinner: {
    paddingVertical: 16,
  },
});
