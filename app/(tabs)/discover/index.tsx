import { NetworkStatus } from "@apollo/client";
import { useNavigation } from "expo-router";
import { fbs } from "fbtee";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  useWindowDimensions,
  StyleSheet,
  View,
  FlatList,
  Text,
} from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { ListFooterSpinner } from "yep/components/ListFooterSpinner";
import { SearchBox } from "yep/components/SearchBox";
import {
  useGetTrendingAnimeQuery,
  useSearchAnimeQuery,
} from "yep/graphql/generated";
import type { MediaPosterFragmentFragment } from "yep/graphql/generated";
import { useLoadNextPage } from "yep/hooks/helpers";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { DiscoverPoster } from "yep/screens/DiscoverScreen/DiscoverPoster";
import { DiscoverSkeletonGrid } from "yep/screens/DiscoverScreen/DiscoverSkeleton";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { notEmpty, isLiquidGlass } from "yep/utils";

const TRENDING_PER_PAGE = 30;
const SEARCH_PER_PAGE = 30;

type ItemWithId = { id: number };

function keyExtractor(item: ItemWithId) {
  return `${item.id}`;
}

function renderDiscoverPoster({
  item,
  index,
}: {
  item: MediaPosterFragmentFragment;
  index: number;
}) {
  return <DiscoverPoster item={item} index={index} />;
}

export default function Discover() {
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
  } = useGetTrendingAnimeQuery({
    variables: { perPage: TRENDING_PER_PAGE },
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: searchData,
    error: searchError,
    loading: loadingSearchData,
    refetch: refetchSearch,
    fetchMore: fetchMoreSearch,
    networkStatus: searchNetworkStatus,
  } = useSearchAnimeQuery({
    skip: debouncedSearchTerm.trim().length === 0,
    variables: { search: debouncedSearchTerm, perPage: SEARCH_PER_PAGE },
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

  async function refetchSearchResults() {
    await refetchSearch({ search: debouncedSearchTerm });
  }

  // Liquid glass: the search field lives in the native header (adopted by the
  // search tab's glass circle), replacing the in-screen SearchBox below.
  const navigation = useNavigation();
  const { locale } = useLocaleContext();
  useEffect(() => {
    if (!isLiquidGlass) return;
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: String(fbs("Search anime", "Search input placeholder")),
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
          placeholder={String(fbs("Search anime", "Search input placeholder"))}
          onCancelPress={() => {
            setSearchTerm("");
          }}
          onClearPress={() => {
            setSearchTerm("");
          }}
        />
      ) : null}
      <View style={styles.innerContainer}>
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
              onPress: refetchSearchResults,
            }}
          />
        ) : showSearchResultsView ? (
          <>
            <FlatList
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={{ gap: 16 }}
              // An element (not an inline component) so FlatList doesn't
              // remount it on every data change.
              ListHeaderComponent={
                <Text style={styles.listHeader}>
                  {String(
                    fbs(
                      [
                        "Search results for: ",
                        fbs.param("searchTerm", searchTerm),
                      ],
                      "Search results header",
                    ),
                  )}
                </Text>
              }
              data={searchList}
              onEndReached={loadNextSearchPage}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isSearchFetchingMore ? <ListFooterSpinner /> : null
              }
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              ListEmptyComponent={() =>
                loadingSearchData ? null : (
                  <EmptyState
                    title={String(
                      fbs("No search results", "No search results title"),
                    )}
                    description={String(
                      fbs(
                        "You may have misspelled what you were looking for, or this anime isn't listed on AniList.",
                        "No search results description",
                      ),
                    )}
                  />
                )
              }
              // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop -- RefreshControl must be a live element; React Compiler memoizes it
              refreshControl={
                <RefreshControl
                  refreshing={isSearchRefetching}
                  onRefresh={() => {
                    refetchSearch({ search: debouncedSearchTerm }).catch(
                      () => {},
                    );
                  }}
                  tintColor={darkTheme.text}
                  titleColor={darkTheme.text}
                />
              }
              numColumns={3}
              keyExtractor={keyExtractor}
              renderItem={renderDiscoverPoster}
            />
          </>
        ) : isTrendingInitialLoading ? (
          <DiscoverSkeletonGrid
            {...{
              posterHeight,
              posterWidth,
            }}
          />
        ) : (
          <>
            <FlatList
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={{ gap: 16 }}
              ListHeaderComponent={
                trendingList.length ? (
                  <Text style={styles.listHeader}>
                    {String(fbs("Trending anime", "Trending anime list header"))}
                  </Text>
                ) : null
              }
              data={trendingList}
              onEndReached={loadNextTrendingPage}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isTrendingFetchingMore ? <ListFooterSpinner /> : null
              }
              numColumns={3}
              ListEmptyComponent={() =>
                loadingTrending ? null : (
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
                )
              }
              // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop -- RefreshControl must be a live element; React Compiler memoizes it
              refreshControl={
                <RefreshControl
                  refreshing={isTrendingRefetching}
                  onRefresh={() => {
                    refetchTrending().catch(() => {});
                  }}
                  tintColor={darkTheme.text}
                  titleColor={darkTheme.text}
                />
              }
              keyExtractor={keyExtractor}
              renderItem={renderDiscoverPoster}
            />
          </>
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
  listHeader: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 20,
    marginBottom: 16,
  },
  outerContainer: {
    flex: 1,
  },
});
