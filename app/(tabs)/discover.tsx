import { NetworkStatus } from "@apollo/client";
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
import { SearchBox } from "yep/components/SearchBox";
import {
  useGetTrendingAnimeQuery,
  useSearchAnimeQuery,
} from "yep/graphql/generated";
import type { MediaPosterFragmentFragment } from "yep/graphql/generated";
import { DiscoverPoster } from "yep/screens/DiscoverScreen/DiscoverPoster";
import { DiscoverSkeletonGrid } from "yep/screens/DiscoverScreen/DiscoverSkeleton";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { notEmpty } from "yep/utils";

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
    networkStatus: trendingNetworkStatus,
  } = useGetTrendingAnimeQuery({
    variables: { perPage: 30 },
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: searchData,
    error: searchError,
    loading: loadingSearchData,
    refetch: refetchSearch,
    networkStatus: searchNetworkStatus,
  } = useSearchAnimeQuery({
    skip: debouncedSearchTerm.trim().length === 0,
    variables: { search: debouncedSearchTerm },
    notifyOnNetworkStatusChange: true,
  });

  const searchList = (searchData?.Page?.media ?? []).filter(notEmpty);
  const trendingList = (trendingData?.Page?.media ?? []).filter(notEmpty);
  // Treat the debounce window as loading so stale results / "No search
  // results" don't flash while the user is still typing.
  const isSearchLoading =
    showSearchResultsView &&
    (loadingSearchData || searchTerm.trim() !== debouncedSearchTerm.trim());
  const isSearchError = showSearchResultsView && Boolean(searchError);
  const isTrendingInitialLoading = !showSearchResultsView && loadingTrending;
  // Each RefreshControl tracks its OWN query's networkStatus; refetch(4) is set
  // only by an explicit pull, never on initial load(1) or a search-term change(2).
  const isTrendingRefetching =
    trendingNetworkStatus === NetworkStatus.refetch;
  const isSearchRefetching = searchNetworkStatus === NetworkStatus.refetch;

  async function refetchSearchResults() {
    await refetchSearch({ search: debouncedSearchTerm });
  }

  return (
    <View
      style={[styles.outerContainer, { backgroundColor: darkTheme.background }]}
    >
      <Header label={String(fbs("Discover", "Discover tab header label"))} />
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
            <FlatList
              contentContainerStyle={{ gap: 16 }}
              data={searchList}
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
            {trendingList.length ? (
              <Text style={styles.listHeader}>
                {String(
                  fbs(
                    [
                      "Top ",
                      fbs.param("count", String(trendingList.length), {
                        number: trendingList.length,
                      }),
                      " trending anime",
                    ],
                    "Trending anime list header",
                  ),
                )}
              </Text>
            ) : null}
            <FlatList
              contentContainerStyle={{ gap: 16 }}
              data={trendingList}
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
