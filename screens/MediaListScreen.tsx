import { NetworkStatus, useQuery } from "@apollo/client";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { fbs } from "fbtee";
import React, { useEffect, useState } from "react";
import { RefreshControl, View, StyleSheet, Text, FlatList } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { ListFooterSpinner } from "yep/components/ListFooterSpinner";
import { AnimeListEntryFragment } from "yep/components/MediaListItem";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { StatusChip } from "yep/components/StatusChip";
import {
  ANILIST_ACCESS_TOKEN_STORAGE,
  MediaListStatusWithLabel,
} from "yep/constants";
import type { MediaSortField, SortDirection } from "yep/constants";
import { MediaListItemContainer } from "yep/containers/MediaListItemContainer";
import {
  ANIME_LIST_PER_PAGE,
  mediaSortFields,
  mediaSortValue,
  naturalSortDirection,
} from "yep/graphql/animeListPagination";
import { primeAccessToken } from "yep/graphql/client";
import type { MediaListStatus, MediaType } from "yep/graphql/enums";
import { graphql, readFragment } from "yep/graphql/tada";
import type { FragmentOf } from "yep/graphql/tada";
import { GetViewer } from "yep/graphql/viewer";
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
import {
  getMediaListStatusLabel,
  getMediaSortFieldLabel,
  notEmpty,
} from "yep/utils";

// Page-based pagination (AniList flat paginator): Page.mediaList is a flat,
// ungrouped array; the cache typePolicy (graphql/client.ts) owns the page
// merge, deduping by id.
const GetMediaList = graphql(
  `
    query GetMediaList(
      $userId: Int
      $type: MediaType!
      $status: MediaListStatus
      $sort: [MediaListSort]
      $page: Int = 1
      $perPage: Int = 50
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          total
        }
        mediaList(userId: $userId, type: $type, status: $status, sort: $sort) {
          id
          media {
            ...AnimeListEntryFragment
          }
        }
      }
    }
  `,
  [AnimeListEntryFragment],
);

type StatusOption = {
  label: string;
  value: MediaListStatus;
  isSelected: boolean;
  onPress: () => void;
};
type MediaListEntry = {
  id: number;
  progress?: number | null;
  media?: FragmentOf<typeof AnimeListEntryFragment> | null;
};
type MediaListRow = {
  entry: MediaListEntry;
  first: boolean;
  last: boolean;
};

function keyExtractor({ entry }: MediaListRow) {
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
    <StatusChip
      label={label}
      onPress={onPress}
      isSelected={isSelected}
      disabled={isSelected}
    />
  );
}

function renderMediaItem({
  item: { entry, first, last },
}: {
  item: MediaListRow;
}) {
  const media = entry.media
    ? readFragment(AnimeListEntryFragment, entry.media)
    : null;
  return (
    <MediaListItemContainer
      seedData={{
        id: entry.id,
        progress: media?.mediaListEntry?.progress ?? 0,
        media: entry.media ?? null,
      }}
      first={first}
      last={last}
    />
  );
}

type Props = {
  mediaType: MediaType;
  headerLabel: string;
  loggedOutDescription: string;
  emptyListDescription: string;
  discoverCtaLabel: string;
};

export function MediaListScreen({
  mediaType,
  headerLabel,
  loggedOutDescription,
  emptyListDescription,
  discoverCtaLabel,
}: Props) {
  const [status, setStatus] = useState<MediaListStatus>(
    MediaListStatusWithLabel[0].value,
  );
  // Persisted per media type: anime and manga keep independent sorts, and an
  // anime screen never loads the manga-only VOLUME_PROGRESS field.
  const [sortField, setSortField] = usePersistedState<MediaSortField>(
    StorageKeys.MEDIA_LIST_SORT_FIELD,
    { id: mediaType },
  );
  const [direction, setDirection] = usePersistedState<SortDirection>(
    StorageKeys.MEDIA_LIST_SORT_DIRECTION,
    { id: mediaType },
  );

  const { accessToken, setAccessToken } = useAccessToken();
  const router = useRouter();
  const { locale } = useLocaleContext();
  const { showActionSheetWithOptions } = useActionSheet();

  const sortFields = mediaSortFields(mediaType);

  function openSortSheet() {
    const options = sortFields.map(
      (field) =>
        `${field === sortField ? "✔ " : ""}${getMediaSortFieldLabel(field)}`,
    );
    options.push(String(fbs("Cancel", "Media list sort cancel option")));
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      { options, cancelButtonIndex },
      (buttonIndex) => {
        if (buttonIndex === undefined || buttonIndex === cancelButtonIndex) {
          return;
        }
        const field = sortFields[buttonIndex];
        setSortField(field);
        // Reset to the field's natural direction; the toggle flips from there.
        setDirection(naturalSortDirection(field));
      },
    );
  }

  const [, , promptAsync] = useAniListAuthRequest();
  // Also keeps the viewer cache warm for the feed's notification bell badge.
  const { data: viewerData } = useQuery(GetViewer, {
    skip: !accessToken,
  });

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
    data: mediaListData,
    refetch,
    fetchMore,
    networkStatus,
  } = useQuery(GetMediaList, {
    skip: !viewerId || !accessToken,
    variables: {
      userId: viewerId,
      type: mediaType,
      status,
      sort: [
        mediaSortValue(
          sortField,
          direction,
          locale,
          viewerData?.Viewer?.options?.titleLanguage,
        ),
      ],
      perPage: ANIME_LIST_PER_PAGE,
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  // Server-side sort (the user-picked field + direction) so fetchMore pages keep
  // a stable order — a client re-sort would reshuffle rows mid-scroll (the bug
  // in the first attempt). `sort` is in the cache keyArgs, so switching sorts
  // reads a fresh page-1 container instead of merging differently-ordered
  // pages. Page.mediaList is flat: no list groups, no custom-list duplicates.
  const list = (mediaListData?.Page?.mediaList ?? []).filter(notEmpty);

  const statusOptions = MediaListStatusWithLabel.map(({ value }) => ({
    label: getMediaListStatusLabel(value, mediaType),
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
  const refreshing = Boolean(accessToken) && !mediaListData;
  const isRefetching = networkStatus === NetworkStatus.refetch;

  const isFetchingMore = networkStatus === NetworkStatus.fetchMore;

  const loadNextPage = useLoadNextPage({
    // Raw length (not the notEmpty-filtered list): the cache merge dedupes by
    // id over the raw array, so the page math must match it.
    loadedCount: (mediaListData?.Page?.mediaList ?? []).length,
    hasNextPage: mediaListData?.Page?.pageInfo?.hasNextPage,
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
        label={headerLabel}
        rightSlot={
          <View style={styles.sortPill}>
            <PressableOpacity
              style={styles.sortFieldButton}
              onPress={openSortSheet}
              accessibilityRole="button"
              accessibilityLabel={String(
                fbs("Change sort", "Media list sort button accessibility"),
              )}
            >
              <Image
                style={styles.sortGlyph}
                source={require("yep/assets/icons/sort.png")}
              />
              <Text style={styles.sortLabel} numberOfLines={1}>
                {getMediaSortFieldLabel(sortField)}
              </Text>
            </PressableOpacity>
            <View style={styles.sortDivider} />
            <PressableOpacity
              style={styles.directionButton}
              onPress={() => setDirection(direction === "ASC" ? "DESC" : "ASC")}
              accessibilityRole="button"
              accessibilityLabel={String(
                direction === "ASC"
                  ? fbs("Sorted ascending", "Media list sort ascending")
                  : fbs("Sorted descending", "Media list sort descending"),
              )}
            >
              <Image
                style={styles.directionIcon}
                source={
                  direction === "ASC"
                    ? require("yep/assets/icons/arrow-up.png")
                    : require("yep/assets/icons/arrow-down.png")
                }
              />
            </PressableOpacity>
          </View>
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
          <View style={{ paddingBottom: 16 }}>
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
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.mediaListDivider} />}
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
                !accessToken ? loggedOutDescription : emptyListDescription
              }
              cta={{
                label: !accessToken
                  ? String(
                      fbs("Log in", "Anime empty state login call to action"),
                    )
                  : discoverCtaLabel,
                onPress: async () => {
                  if (!accessToken) {
                    const result = await promptAsync();

                    if (result.type === "error" || result.type === "success") {
                      if (result.params.access_token) {
                        // Same order as auth.tsx: durable write, then the
                        // memory mirror, then the state flip — setAccessToken
                        // un-skips GetViewer/GetMediaList immediately, so the
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
        renderItem={renderMediaItem}
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
  mediaListDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: darkTheme.listItemBorder,
  },
  // A single outlined rounded control: the field (with sort glyph) opens the
  // sheet, the arrow past the hairline toggles direction. maxWidth keeps a long
  // field label from crowding the title.
  sortPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: darkTheme.listItemBorder,
    maxWidth: 180,
  },
  sortFieldButton: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 8,
    paddingRight: 8,
    paddingVertical: 4,
  },
  sortGlyph: {
    height: 12,
    width: 12,
    tintColor: darkTheme.subText,
  },
  sortLabel: {
    flexShrink: 1,
    fontFamily: Manrope.medium,
    fontSize: 12,
    color: darkTheme.text,
  },
  sortDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    marginVertical: 4,
    backgroundColor: darkTheme.buttonBorder,
  },
  directionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  directionIcon: {
    height: 12,
    width: 12,
    tintColor: darkTheme.text,
  },
});
