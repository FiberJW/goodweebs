import { useRouter } from "expo-router";
import { fbs } from "fbtee";
import React, { useState } from "react";
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
import { DiscoverPoster } from "yep/screens/DiscoverScreen/DiscoverPoster";
import { DiscoverSkeletonGrid } from "yep/screens/DiscoverScreen/DiscoverSkeleton";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { notEmpty } from "yep/utils";

export default function Discover() {
  const [searchTerm, setSearchTerm] = useState("");
  const { width: windowWidth } = useWindowDimensions();
  const router = useRouter();

  const posterWidth = (windowWidth - 16 * 4) / 3;
  const posterHeight = posterWidth * 1.4285714286;

  const showSearchResultsView = searchTerm.length > 0;

  const {
    loading: loadingTrending,
    data: trendingData,
    refetch: refetchTrendingOriginal,
  } = useGetTrendingAnimeQuery({
    variables: { perPage: 30 },
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: searchData,
    error: searchError,
    loading: loadingSearchData,
    refetch: refetchSearch,
  } = useSearchAnimeQuery({
    skip: searchTerm.trim().length === 0,
    variables: { search: searchTerm },
    notifyOnNetworkStatusChange: true,
  });

  const searchList = (searchData?.Page?.media ?? []).filter(notEmpty);
  const trendingList = (trendingData?.Page?.media ?? []).filter(notEmpty);
  const isSearchLoading = showSearchResultsView && loadingSearchData;
  const isSearchError = showSearchResultsView && Boolean(searchError);
  const isTrendingInitialLoading = !showSearchResultsView && loadingTrending;

  async function refetchTrending() {
    await refetchTrendingOriginal();
  }

  async function refetchSearchResults() {
    await refetchSearch({ search: searchTerm });
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
              <fbt desc="Search results header">
                Search results for:{" "}
                <fbt:param name="searchTerm">{searchTerm}</fbt:param>
              </fbt>
            </Text>
            <FlatList
              contentContainerStyle={{ gap: 16 }}
              data={searchList}
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
              refreshControl={
                <RefreshControl
                  refreshing={loadingSearchData}
                  tintColor={darkTheme.text}
                  titleColor={darkTheme.text}
                />
              }
              numColumns={3}
              keyExtractor={(item) => `${item.id}`}
              renderItem={({ item, index }) => (
                <DiscoverPoster
                  {...{ item, index, posterHeight, posterWidth }}
                  onPress={() => router.push(`/details/${item.id}`)}
                  key={item.id}
                />
              )}
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
                <fbt desc="Trending anime list header">
                  Top{" "}
                  <fbt:param name="count">{trendingList.length}</fbt:param>{" "}
                  trending anime
                </fbt>
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
              refreshControl={
                <RefreshControl
                  refreshing={loadingTrending}
                  onRefresh={refetchTrending}
                  tintColor={darkTheme.text}
                  titleColor={darkTheme.text}
                />
              }
              keyExtractor={(item) => `${item.id}`}
              renderItem={({ item, index }) => {
                return (
                  <DiscoverPoster
                    {...{ item, index, posterHeight, posterWidth }}
                    onPress={() => router.push(`/details/${item.id}`)}
                    key={item.id}
                  />
                );
              }}
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
