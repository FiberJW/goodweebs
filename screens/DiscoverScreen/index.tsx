import { useNavigation } from "expo-router";
import { fbs } from "fbtee";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChipGroup } from "yep/components/ChipGroup";
import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { SearchBox } from "yep/components/SearchBox";
import type { MediaType } from "yep/graphql/enums";
import { usePaginatedQuery } from "yep/graphql/pagination";
import { graphql } from "yep/graphql/tada";
import { DiscoverSkeletonGrid } from "yep/screens/DiscoverScreen/DiscoverSkeleton";
import {
  DiscoverUserSearchResults,
  UserSearchResultFragment,
} from "yep/screens/DiscoverScreen/DiscoverUserSearchResults";
import {
  MediaPosterFragment,
  PosterGrid,
} from "yep/screens/DiscoverScreen/PosterGrid";
import { darkTheme } from "yep/themes";
import { isLiquidGlass } from "yep/utils";

const PER_PAGE = 30;
type SearchType = MediaType | "USER";

const GetTrendingMedia = graphql(
  `
    # $formatIn narrows anime trending to TV shows (matching the old behavior);
    # omit it for manga, where every format should trend.
    query GetTrendingMedia(
      $type: MediaType!
      $formatIn: [MediaFormat]
      $page: Int!
      $perPage: Int!
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
        }
        media(
          format_in: $formatIn
          isAdult: false
          type: $type
          sort: [TRENDING_DESC]
        ) {
          ...MediaPosterFragment
        }
      }
    }
  `,
  [MediaPosterFragment],
);

const SearchMedia = graphql(
  `
    query SearchMedia(
      $search: String!
      $type: MediaType!
      $page: Int!
      $perPage: Int!
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
        }
        media(
          search: $search
          type: $type
          format_not_in: [MUSIC]
          isAdult: false
        ) {
          ...MediaPosterFragment
        }
      }
    }
  `,
  [MediaPosterFragment],
);

const SearchUsers = graphql(
  `
    query SearchUsers($search: String!, $page: Int!, $perPage: Int!) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
        }
        users(search: $search, sort: SEARCH_MATCH) {
          ...UserSearchResultFragment
        }
      }
    }
  `,
  [UserSearchResultFragment],
);

type DiscoverView =
  | "tooShort"
  | "searchLoading"
  | "searchError"
  | "searchResults"
  | "userPrompt"
  | "trendingLoading"
  | "trending";

function getDiscoverView({
  term,
  debouncedTerm,
  isUserSearch,
  search,
  trending,
}: {
  term: string;
  debouncedTerm: string;
  isUserSearch: boolean;
  search: { isInitialLoading: boolean; error?: unknown };
  trending: { isInitialLoading: boolean };
}): DiscoverView {
  if (term.length > 0) {
    if (term.length < 2) return "tooShort";
    if (search.isInitialLoading || term !== debouncedTerm)
      return "searchLoading";
    if (search.error) return "searchError";
    return "searchResults";
  }
  if (isUserSearch) return "userPrompt";
  if (trending.isInitialLoading) return "trendingLoading";
  return "trending";
}

export default function Discover() {
  const [contentWidth, setContentWidth] = useState(0);
  const [searchType, setSearchType] = useState<SearchType>("ANIME");
  const [searchTerm, setSearchTerm] = useState("");
  // Debounce and require two characters so a pause after every keystroke does
  // not burn through AniList's degraded per-minute allowance.
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearchTerm(searchTerm), 600);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const normalizedSearchTerm = searchTerm.trim();
  const normalizedDebouncedSearchTerm = debouncedSearchTerm.trim();
  const showSearchResultsView = normalizedSearchTerm.length > 0;
  const canSearch = normalizedDebouncedSearchTerm.length >= 2;
  const isUserSearch = searchType === "USER";
  const mediaType = isUserSearch ? "ANIME" : searchType;

  const trending = usePaginatedQuery(GetTrendingMedia, {
    skip: isUserSearch || showSearchResultsView,
    perPage: PER_PAGE,
    variables: {
      type: mediaType,
      formatIn: mediaType === "ANIME" ? ["TV"] : undefined,
    },
    items: (page) => page.media,
  });
  const mediaSearch = usePaginatedQuery(SearchMedia, {
    skip: isUserSearch || !canSearch,
    perPage: PER_PAGE,
    variables: { search: normalizedDebouncedSearchTerm, type: mediaType },
    items: (page) => page.media,
  });
  const userSearch = usePaginatedQuery(SearchUsers, {
    skip: !isUserSearch || !canSearch,
    perPage: PER_PAGE,
    variables: { search: normalizedDebouncedSearchTerm },
    items: (page) => page.users,
  });
  const search = isUserSearch ? userSearch : mediaSearch;
  const view = getDiscoverView({
    term: normalizedSearchTerm,
    debouncedTerm: normalizedDebouncedSearchTerm,
    isUserSearch,
    search,
    trending,
  });
  const searchResultsTitle = String(
    fbs(
      ["Search results for: ", fbs.param("searchTerm", normalizedSearchTerm)],
      "Search results header",
    ),
  );

  const searchPlaceholder = String(
    fbs("Search anime, manga & users", "Search input placeholder"),
  );
  const navigation = useNavigation();
  useEffect(() => {
    if (!isLiquidGlass) return;
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: searchPlaceholder,
        hideWhenScrolling: false,
        onChangeText: (e: { nativeEvent: { text: string } }) =>
          setSearchTerm(e.nativeEvent.text),
        onCancelButtonPress: () => setSearchTerm(""),
        hideNavigationBar: false,
      },
    });
  }, [navigation, searchPlaceholder]);

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={[styles.outerContainer, { backgroundColor: darkTheme.background }]}
    >
      <Header label={String(fbs("Discover", "Discover tab header label"))} />
      {!isLiquidGlass ? (
        <SearchBox
          value={searchTerm}
          onChangeText={(text) => setSearchTerm(text)}
          placeholder={searchPlaceholder}
          onClear={() => setSearchTerm("")}
        />
      ) : null}
      <View
        style={styles.innerContainer}
        onLayout={(event) =>
          setContentWidth(Math.max(0, event.nativeEvent.layout.width - 32))
        }
      >
        <ChipGroup
          style={styles.mediaTypeRow}
          value={searchType}
          onChange={setSearchType}
          options={[
            {
              value: "ANIME",
              label: String(fbs("Anime", "Discover anime toggle label")),
            },
            {
              value: "MANGA",
              label: String(fbs("Manga", "Discover manga toggle label")),
            },
            {
              value: "USER",
              label: String(fbs("Users", "Discover users toggle label")),
            },
          ]}
        />
        {view === "tooShort" ? (
          <EmptyState
            title={String(fbs("Keep typing", "Search minimum length title"))}
            description={String(
              fbs(
                "Enter at least 2 characters to search.",
                "Search minimum length description",
              ),
            )}
          />
        ) : view === "searchLoading" ? (
          isUserSearch ? (
            <ActivityIndicator
              color={darkTheme.text}
              size="large"
              style={styles.loading}
            />
          ) : (
            <DiscoverSkeletonGrid width={contentWidth} />
          )
        ) : view === "searchError" ? (
          <EmptyState
            title={String(
              fbs("Couldn't load search results", "Search error title"),
            )}
            description={String(
              fbs(
                "Check your connection and try again.",
                "Search error description",
              ),
            )}
            cta={{
              label: String(fbs("Retry", "Search retry button label")),
              onPress: search.refresh,
            }}
          />
        ) : view === "searchResults" ? (
          isUserSearch ? (
            <DiscoverUserSearchResults
              title={searchResultsTitle}
              results={userSearch}
            />
          ) : (
            <PosterGrid
              width={contentWidth}
              title={searchResultsTitle}
              results={mediaSearch}
              emptyState={
                <EmptyState
                  title={String(
                    fbs("No search results", "No search results title"),
                  )}
                  description={String(
                    fbs(
                      "You may have misspelled what you were looking for, or this title isn't listed on AniList.",
                      "No search results description",
                    ),
                  )}
                />
              }
            />
          )
        ) : view === "userPrompt" ? (
          <EmptyState
            title={String(fbs("Find users", "User search prompt title"))}
            description={String(
              fbs(
                "Search AniList users by username to view profiles and follow them.",
                "User search prompt description",
              ),
            )}
          />
        ) : view === "trendingLoading" ? (
          <DiscoverSkeletonGrid width={contentWidth} />
        ) : (
          <PosterGrid
            width={contentWidth}
            title={
              trending.items.length
                ? mediaType === "MANGA"
                  ? String(fbs("Trending manga", "Trending manga list header"))
                  : String(fbs("Trending anime", "Trending anime list header"))
                : undefined
            }
            results={trending}
            emptyState={
              <EmptyState
                title={String(
                  fbs(
                    "Unexpected loading error",
                    "Trending loading error title",
                  ),
                )}
                description={String(
                  fbs(
                    "Swipe down to try again",
                    "Trending loading error description",
                  ),
                )}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    padding: 16,
  },
  mediaTypeRow: { marginBottom: 16 },
  loading: { flex: 1 },
  outerContainer: {
    flex: 1,
  },
});
