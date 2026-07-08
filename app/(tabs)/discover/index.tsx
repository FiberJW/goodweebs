import { NetworkStatus, useQuery } from "@apollo/client";
import { useNavigation } from "expo-router";
import { fbs } from "fbtee";
import React, { useEffect, useState } from "react";
import { useWindowDimensions, StyleSheet, View } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { SearchBox } from "yep/components/SearchBox";
import { StatusChip } from "yep/components/StatusChip";
import type { MediaType } from "yep/graphql/enums";
import { graphql } from "yep/graphql/tada";
import { useLoadNextPage } from "yep/hooks/helpers";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { MediaPosterFragment } from "yep/screens/DiscoverScreen/DiscoverPoster";
import { DiscoverSearchResults } from "yep/screens/DiscoverScreen/DiscoverSearchResults";
import { DiscoverSkeletonGrid } from "yep/screens/DiscoverScreen/DiscoverSkeleton";
import { DiscoverTrendingResults } from "yep/screens/DiscoverScreen/DiscoverTrendingResults";
import { darkTheme } from "yep/themes";
import { notEmpty, isLiquidGlass } from "yep/utils";

const TRENDING_PER_PAGE = 30;
const SEARCH_PER_PAGE = 30;

const GetTrendingMedia = graphql(
  `
  # $formatIn narrows anime trending to TV shows (matching the old behavior);
  # omit it for manga, where every format should trend.
  query GetTrendingMedia($type: MediaType!, $formatIn: [MediaFormat], $page: Int = 1, $perPage: Int = 20) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
      }
      media(format_in: $formatIn, isAdult: false, type: $type, sort: [TRENDING_DESC]) {
        ...MediaPosterFragment
      }
    }
  }
`,
  [MediaPosterFragment],
);

const SearchMedia = graphql(
  `
  query SearchMedia($search: String, $type: MediaType!, $page: Int = 1, $perPage: Int = 30) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
      }
      media(search: $search, type: $type, format_not_in: [MUSIC], isAdult: false) {
        ...MediaPosterFragment
      }
    }
  }
`,
  [MediaPosterFragment],
);

export default function Discover() {
  // One toggle scopes both trending and search results to anime or manga.
  const [mediaType, setMediaType] = useState<MediaType>("ANIME");
  const [searchTerm, setSearchTerm] = useState("");
  // Only the debounced copy hits the network: typing a title fires one query,
  // not one per keystroke against AniList's degraded 30/min rate limit.
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(handle);
  }, [searchTerm]);
  const { width: windowWidth } = useWindowDimensions();

  const posterWidth = (windowWidth - 16 * 4) / 3;
  const posterHeight = posterWidth * 1.4285714286;

  const showSearchResultsView = searchTerm.length > 0;

  const {
    loading: loadingTrending,
    data: trendingData,
    refetch: refetchTrending,
    fetchMore: fetchMoreTrending,
    networkStatus: trendingNetworkStatus,
  } = useQuery(GetTrendingMedia, {
    variables: {
      perPage: TRENDING_PER_PAGE,
      type: mediaType,
      // TV-only trending for anime (the old behavior); manga trends across
      // every format.
      formatIn: mediaType === "ANIME" ? ["TV"] : undefined,
    },
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: searchData,
    error: searchError,
    loading: loadingSearchData,
    refetch: refetchSearch,
    fetchMore: fetchMoreSearch,
    networkStatus: searchNetworkStatus,
  } = useQuery(SearchMedia, {
    skip: debouncedSearchTerm.trim().length === 0,
    variables: {
      search: debouncedSearchTerm,
      type: mediaType,
      perPage: SEARCH_PER_PAGE,
    },
    notifyOnNetworkStatusChange: true,
  });

  const searchList = (searchData?.Page?.media ?? []).filter(notEmpty);
  const trendingList = (trendingData?.Page?.media ?? []).filter(notEmpty);
  // Each RefreshControl tracks its OWN query's networkStatus; refetch(4) is
  // set only by an explicit pull, never on initial load(1) or a search-term
  // change(2). fetchMore(3) drives the footer spinners.
  const isTrendingRefetching =
    trendingNetworkStatus === NetworkStatus.refetch;
  const isSearchRefetching = searchNetworkStatus === NetworkStatus.refetch;
  const isTrendingFetchingMore =
    trendingNetworkStatus === NetworkStatus.fetchMore;
  const isSearchFetchingMore =
    searchNetworkStatus === NetworkStatus.fetchMore;
  // Treat the debounce window as loading so stale results / "No search
  // results" don't flash while the user is still typing. Skeleton for the
  // initial load / a new term only — not while a further page appends (the
  // footer spinner covers that).
  const isSearchLoading =
    showSearchResultsView &&
    ((loadingSearchData && !isSearchFetchingMore) ||
      searchTerm.trim() !== debouncedSearchTerm.trim());
  const isSearchError = showSearchResultsView && Boolean(searchError);
  // Skeleton for the initial load only — not while a further page appends
  // (the footer spinner covers that).
  const isTrendingInitialLoading =
    !showSearchResultsView && loadingTrending && !isTrendingFetchingMore;

  const loadNextSearchPage = useLoadNextPage({
    loadedCount: (searchData?.Page?.media ?? []).length,
    hasNextPage: searchData?.Page?.pageInfo?.hasNextPage,
    paused: isSearchRefetching,
    perPage: SEARCH_PER_PAGE,
    fetchMore: fetchMoreSearch,
  });

  const loadNextTrendingPage = useLoadNextPage({
    loadedCount: (trendingData?.Page?.media ?? []).length,
    hasNextPage: trendingData?.Page?.pageInfo?.hasNextPage,
    paused: isTrendingRefetching,
    perPage: TRENDING_PER_PAGE,
    fetchMore: fetchMoreTrending,
  });

  function refreshSearchResults() {
    refetchSearch({ search: debouncedSearchTerm }).catch(() => {});
  }

  function refreshTrendingResults() {
    refetchTrending().catch(() => {});
  }

  // Liquid glass: the search field lives in the native header (adopted by the
  // search tab's glass circle), replacing the in-screen SearchBox below.
  const navigation = useNavigation();
  const { locale } = useLocaleContext();
  useEffect(() => {
    if (!isLiquidGlass) return;
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: String(
          fbs("Search anime & manga", "Search input placeholder"),
        ),
        hideWhenScrolling: false,
        onChangeText: (e: { nativeEvent: { text: string } }) =>
          setSearchTerm(e.nativeEvent.text),
        onCancelButtonPress: () => setSearchTerm(""),
        // Keep the (empty) nav bar in place while searching so the in-screen
        // Header doesn't jump.
        hideNavigationBar: false,
      },
    });
    // `locale` re-runs this so the placeholder follows in-app language
    // changes (fbs strings resolve at call time).
  }, [navigation, locale]);

  return (
    <View
      style={[styles.outerContainer, { backgroundColor: darkTheme.background }]}
    >
      <Header label={String(fbs("Discover", "Discover tab header label"))} />
      {!isLiquidGlass ? (
        <SearchBox
          value={searchTerm}
          onChangeText={(text) => setSearchTerm(text)}
          placeholder={String(
            fbs("Search anime & manga", "Search input placeholder"),
          )}
          onCancelPress={() => {
            setSearchTerm("");
          }}
          onClearPress={() => {
            setSearchTerm("");
          }}
        />
      ) : null}
      <View style={styles.innerContainer}>
        <View style={styles.mediaTypeRow}>
          <StatusChip
            label={String(fbs("Anime", "Discover anime toggle label"))}
            isSelected={mediaType === "ANIME"}
            disabled={mediaType === "ANIME"}
            onPress={() => setMediaType("ANIME")}
          />
          <StatusChip
            label={String(fbs("Manga", "Discover manga toggle label"))}
            isSelected={mediaType === "MANGA"}
            disabled={mediaType === "MANGA"}
            onPress={() => setMediaType("MANGA")}
          />
        </View>
        {isSearchLoading ? (
          <DiscoverSkeletonGrid
            {...{
              posterHeight,
              posterWidth,
            }}
          />
        ) : isSearchError ? (
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
              onPress: refreshSearchResults,
            }}
          />
        ) : showSearchResultsView ? (
          <DiscoverSearchResults
            data={searchList}
            searchTerm={searchTerm}
            loading={loadingSearchData}
            isFetchingMore={isSearchFetchingMore}
            isRefetching={isSearchRefetching}
            onEndReached={loadNextSearchPage}
            onRefresh={refreshSearchResults}
          />
        ) : isTrendingInitialLoading ? (
          <DiscoverSkeletonGrid
            {...{
              posterHeight,
              posterWidth,
            }}
          />
        ) : (
          <DiscoverTrendingResults
            data={trendingList}
            mediaType={mediaType}
            loading={loadingTrending}
            isFetchingMore={isTrendingFetchingMore}
            isRefetching={isTrendingRefetching}
            onEndReached={loadNextTrendingPage}
            onRefresh={refreshTrendingResults}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    padding: 16,
  },
  mediaTypeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  outerContainer: {
    flex: 1,
  },
});
