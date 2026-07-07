import { NetworkStatus } from "@apollo/client";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { fbs } from "fbtee";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  View,
  StyleSheet,
  Text,
  FlatList,
} from "react-native";

import { white } from "yep/colors";
import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { ListFooterSpinner } from "yep/components/ListFooterSpinner";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { StatusChip } from "yep/components/StatusChip";
import {
  ANILIST_ACCESS_TOKEN_STORAGE,
  MediaListStatusWithLabel,
} from "yep/constants";
import { AnimeListItemContainer } from "yep/containers/AnimeListItemContainer";
import {
  ANIME_LIST_PER_PAGE,
  titleSortForLocale,
} from "yep/graphql/animeListPagination";
import { primeAccessToken } from "yep/graphql/client";
import {
  useGetViewerQuery,
  useGetAnimeListQuery,
} from "yep/graphql/generated";
import type {
  AnimeListEntryFragmentFragment,
  MediaListStatus,
} from "yep/graphql/generated";
import { useAniListAuthRequest } from "yep/hooks/auth";
import {
  StorageKeys,
  useLoadNextPage,
  usePersistedState,
} from "yep/hooks/helpers";
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

export default function Anime() {
  const [status, setStatus] = useState<MediaListStatus>(
    MediaListStatusWithLabel[0].value,
  );

  const { accessToken, setAccessToken } = useAccessToken();
  const router = useRouter();
  const { locale } = useLocaleContext();

  const [, , promptAsync] = useAniListAuthRequest();
  const { data: viewerData } = useGetViewerQuery({
    skip: !accessToken,
  });
  const unreadCount = viewerData?.Viewer?.unreadNotificationCount ?? 0;

  // The viewer id is stable per account, so persist it: on a cold start the
  // list query below can fire immediately instead of serializing behind a full
  // GetViewer round-trip (AniList's degraded rate limit makes each request
  // slow, so the waterfall doubles time-to-first-row after a fresh login).
  const [persistedViewerId, setPersistedViewerId] = usePersistedState<
    number | null
  >(StorageKeys.ANILIST_VIEWER_ID);
  const viewerId = viewerData?.Viewer?.id ?? persistedViewerId ?? undefined;
  useEffect(() => {
    const id = viewerData?.Viewer?.id;
    if (id && id !== persistedViewerId) {
      setPersistedViewerId(id);
    }
  }, [viewerData?.Viewer?.id, persistedViewerId, setPersistedViewerId]);

  const {
    data: animeListData,
    refetch,
    fetchMore,
    networkStatus,
  } = useGetAnimeListQuery({
    skip: !viewerId || !accessToken,
    variables: {
      userId: viewerId,
      status,
      sort: [titleSortForLocale(locale)],
      perPage: ANIME_LIST_PER_PAGE,
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  // Server-side sort (title sort matching the locale) so pages appended by
  // fetchMore keep a stable order — a client re-sort would reshuffle rows
  // mid-scroll. Page.mediaList is flat: no list groups, no custom-list
  // duplicates.
  const list = (animeListData?.Page?.mediaList ?? []).filter(notEmpty);
  // Header count shows the category's full size, not the loaded-page count —
  // pagination caps `list` at the pages fetched so far.
  const totalCount = animeListData?.Page?.pageInfo?.total ?? list.length;

  const statusOptions = MediaListStatusWithLabel.map(({ value }) => ({
    label: getMediaListStatusLabel(value),
    value,
    isSelected: status === value,
    onPress: () => setStatus(value),
  }));

  // `refreshing` (initial-load state) drives the skeleton ListEmptyComponent.
  // Gated on "logged in but no data yet" rather than the loading flags: this
  // query's `loading` sticks at networkStatus 1 after the skip-flip on mount
  // (see loadNextPage's comment), so an empty list would shimmer forever
  // instead of showing the EmptyState. The RefreshControl is driven separately
  // by networkStatus === refetch(4), which Apollo sets ONLY for an explicit
  // refetch() (a user pull) and auto-resets to ready(7) when it settles.
  const refreshing = Boolean(accessToken) && !animeListData;
  const isRefetching = networkStatus === NetworkStatus.refetch;

  const isFetchingMore = networkStatus === NetworkStatus.fetchMore;

  const loadNextPage = useLoadNextPage({
    // Raw length (not the notEmpty-filtered list): the cache merge dedupes by
    // id over the raw array, so the page math must match it.
    loadedCount: (animeListData?.Page?.mediaList ?? []).length,
    hasNextPage: animeListData?.Page?.pageInfo?.hasNextPage,
    paused: isRefetching,
    perPage: ANIME_LIST_PER_PAGE,
    fetchMore,
  });
  const listRows = list.map((entry, index) => ({
    entry,
    first: index === 0,
    last: index === list.length - 1,
  }));

  return (
    <View
      style={[styles.outerContainer, { backgroundColor: darkTheme.background }]}
    >
      <Header
        label={String(fbs("Anime", "Anime tab header label"))}
        rightSlot={
          accessToken ? (
            <PressableOpacity
              onPress={() => router.push("/notifications")}
              accessibilityRole="button"
              accessibilityLabel={String(
                fbs(
                  "Notifications",
                  "Notifications button accessibility label",
                ),
              )}
            >
              <Image
                style={{
                  tintColor: white,
                  height: 24,
                  width: 24,
                  // Dim the bell when there's nothing new.
                  opacity: unreadCount > 0 ? 1 : 0.5,
                }}
                source={
                  unreadCount > 0
                    ? require("yep/assets/icons/navigation/bell.png")
                    : require("yep/assets/icons/navigation/bell-outline.png")
                }
              />
              {unreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              ) : null}
            </PressableOpacity>
          ) : undefined
        }
      />
      <FlatList
        // iOS native tabs float over content; automatic insets keep the last
        // rows scrollable clear of the glass bar (no-op on Android's JS tabs).
        contentInsetAdjustmentBehavior="automatic"
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
                      fbs.param("count", String(totalCount), {
                        number: totalCount,
                      }),
                      " ",
                      fbs.plural("title", totalCount, {
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
                        // Same order as auth.tsx: durable write, then the
                        // memory mirror, then the state flip — setAccessToken
                        // un-skips GetViewer/GetAnimeList immediately, so the
                        // token must be fully stored before it runs.
                        await SecureStore.setItemAsync(
                          ANILIST_ACCESS_TOKEN_STORAGE,
                          result.params.access_token,
                        );
                        primeAccessToken(result.params.access_token);
                        setAccessToken(result.params.access_token);
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
              // page: 1 explicitly — refetch merges partial variables over the
              // current ones, which include the last fetchMore's page.
              refetch({ userId: viewerId, status, page: 1 }).catch(
                () => {}, // error surfaces via the hook; unhandled it would redbox
              );
            }}
            tintColor={darkTheme.text}
            titleColor={darkTheme.text}
          />
        }
        keyExtractor={keyExtractor}
        renderItem={renderAnimeItem}
        onEndReached={loadNextPage}
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
  badge: {
    alignItems: "center",
    backgroundColor: darkTheme.accent,
    borderRadius: 9,
    height: 18,
    justifyContent: "center",
    minWidth: 18,
    paddingHorizontal: 4,
    position: "absolute",
    right: -8,
    top: -6,
  },
  badgeText: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 10,
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
});
