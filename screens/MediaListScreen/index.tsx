import { useActionSheet } from "@expo/react-native-action-sheet";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { fbs } from "fbtee";
import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChipGroup } from "yep/components/ChipGroup";
import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import {
  MediaListItem,
  MediaListItemFragment,
} from "yep/components/MediaListItem";
import { PagedList } from "yep/components/PagedList";
import { PressableOpacity } from "yep/components/PressableOpacity";
import type { MediaListStatus, MediaType } from "yep/graphql/enums";
import { LIST_STATUSES } from "yep/graphql/mediaListEntry";
import { usePaginatedQuery } from "yep/graphql/pagination";
import { graphql } from "yep/graphql/tada";
import type { FragmentOf } from "yep/graphql/tada";
import { useViewer, useViewerId } from "yep/graphql/viewer";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { MediaListSkeleton } from "yep/screens/MediaListScreen/MediaListSkeleton";
import {
  SortSettings,
  getMediaSortFieldLabel,
  mediaSortFields,
  mediaSortValue,
  naturalSortDirection,
} from "yep/screens/MediaListScreen/sort";
import { logInWithAniList, useAccessToken } from "yep/session";
import { usePersistedState } from "yep/storage";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { getMediaListStatusLabel, notEmpty } from "yep/utils";

const GetMediaList = graphql(
  `
    query GetMediaList(
      $userId: Int
      $type: MediaType!
      $status: MediaListStatus
      $sort: [MediaListSort]
      $page: Int!
      $perPage: Int!
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          total
        }
        mediaList(userId: $userId, type: $type, status: $status, sort: $sort) {
          id
          media {
            ...MediaListItemFragment
          }
        }
      }
    }
  `,
  [MediaListItemFragment],
);

type MediaListEntry = {
  id: number;
  media?: FragmentOf<typeof MediaListItemFragment> | null;
};

function keyExtractor(entry: MediaListEntry) {
  return `${entry.id}`;
}

function renderMediaItem({ item }: { item: MediaListEntry }) {
  return item.media ? <MediaListItem media={item.media} /> : null;
}

function getCopy(mediaType: MediaType) {
  return mediaType === "MANGA"
    ? {
        header: String(fbs("Manga", "Manga tab header label")),
        loggedOut: String(
          fbs(
            "Start tracking your manga by using an AniList account!",
            "Manga empty state login description",
          ),
        ),
        emptyList: String(
          fbs(
            "Explore the world of manga by adding some series to your list!",
            "Manga empty state list description",
          ),
        ),
        discover: String(
          fbs(
            "Discover new manga",
            "Manga empty state discover call to action",
          ),
        ),
      }
    : {
        header: String(fbs("Anime", "Anime tab header label")),
        loggedOut: String(
          fbs(
            "Start tracking your anime by using an AniList account!",
            "Anime empty state login description",
          ),
        ),
        emptyList: String(
          fbs(
            "Explore the world of anime by adding some shows to your list!",
            "Anime empty state list description",
          ),
        ),
        discover: String(
          fbs(
            "Discover new anime",
            "Anime empty state discover call to action",
          ),
        ),
      };
}

export function MediaListScreen({ mediaType }: { mediaType: MediaType }) {
  const copy = getCopy(mediaType);
  const [status, setStatus] = useState<MediaListStatus>(LIST_STATUSES[0]);
  // Persisted per media type: anime and manga keep independent sorts, and an
  // anime screen never loads the manga-only VOLUME_PROGRESS field.
  const [sortField, setSortField] = usePersistedState(SortSettings.field, {
    id: mediaType,
  });
  const [direction, setDirection] = usePersistedState(SortSettings.direction, {
    id: mediaType,
  });

  const { accessToken } = useAccessToken();
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
        setDirection(naturalSortDirection(field));
      },
    );
  }

  const { viewer } = useViewer();
  const viewerId = useViewerId();

  const mediaList = usePaginatedQuery(GetMediaList, {
    skip: !viewerId,
    perPage: 50,
    variables: {
      userId: viewerId,
      type: mediaType,
      status,
      sort: [
        mediaSortValue(
          sortField,
          direction,
          locale,
          viewer?.options?.titleLanguage,
        ),
      ],
    },
    fetchPolicy: "cache-and-network",
    items: (page) => page.mediaList,
  });
  const list = mediaList.items.filter(notEmpty);
  // Apollo 3.12 leaves `loading` stuck after this query's skip flips on
  // mount, so the skeleton keys off missing data instead.
  const showSkeleton = Boolean(accessToken) && !mediaList.data;

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={[styles.outerContainer, { backgroundColor: darkTheme.navBackground }]}
    >
      <Header
        label={copy.header}
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
      <PagedList
        style={{ backgroundColor: darkTheme.background }}
        paging={mediaList}
        joined
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <ChipGroup
            style={{ marginBottom: 16 }}
            value={status}
            onChange={setStatus}
            options={LIST_STATUSES.map((value) => ({
              value,
              label: getMediaListStatusLabel(value, mediaType),
            }))}
          />
        }
        data={list}
        ListEmptyComponent={
          showSkeleton ? (
            <MediaListSkeleton />
          ) : (
            <EmptyState
              title={
                !accessToken
                  ? String(fbs("Log in", "Anime empty state login title"))
                  : String(fbs("Empty list", "Anime empty state title"))
              }
              description={!accessToken ? copy.loggedOut : copy.emptyList}
              cta={{
                label: !accessToken
                  ? String(
                      fbs("Log in", "Anime empty state login call to action"),
                    )
                  : copy.discover,
                onPress: accessToken
                  ? () => router.push("/(tabs)/discover")
                  : logInWithAniList,
              }}
            />
          )
        }
        keyExtractor={keyExtractor}
        renderItem={renderMediaItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
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
