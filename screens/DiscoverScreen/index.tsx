import { StackNavigationProp } from "@react-navigation/stack";
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
import { RootStackParamList } from "yep/navigation";
import { getString, StringCase } from "yep/strings";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { notEmpty } from "yep/utils";

import { DiscoverPoster } from "./DiscoverPoster";

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
};

export function DiscoverScreen({ navigation }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const { width: windowWidth } = useWindowDimensions();

  const posterWidth = (windowWidth - 16 * 4) / 3;
  const posterHeight = posterWidth * 1.4285714286;

  const showSearchResultsView = searchTerm.length > 0;

  const {
    loading: loadingTrending,
    data: trendingData,
    refetch: refetchTrendingOriginal,
  } = useGetTrendingAnimeQuery({
    variables: { perPage: 30 },
    // notifyOnNetworkStatusChange: true,
  });

  console.log({ trendingData });

  const { data: searchData, loading: loadingSearchData } = useSearchAnimeQuery({
    skip: searchTerm.trim().length === 0,
    variables: { search: searchTerm },
    notifyOnNetworkStatusChange: true,
  });

  const searchList = (searchData?.Page?.media ?? []).filter(notEmpty);
  const trendingList = (trendingData?.Page?.media ?? []).filter(notEmpty);

  async function refetchTrending() {
    await refetchTrendingOriginal();
  }

  return (
    <View style={styles.outerContainer}>
      <Header label={getString("discover", StringCase.TITLE)} />
      <SearchBox
        value={searchTerm}
        onChangeText={(text) => setSearchTerm(text)}
        placeholder="Search anime"
        onCancelPress={() => {
          setSearchTerm("");
        }}
        onClearPress={() => {
          setSearchTerm("");
        }}
      />
      <View style={styles.innerContainer}>
        {showSearchResultsView ? (
          <>
            <Text style={styles.listHeader}>
              Search results for: {searchTerm}
            </Text>
            <FlatList
              ItemSeparatorComponent={Separator}
              data={searchList}
              ListEmptyComponent={() =>
                loadingSearchData ? null : (
                  <EmptyState
                    title="No search results"
                    description="You may have misspelled what you were looking for, or this anime isn’t listed on AniList."
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
                  {...{ item, index, navigation, posterHeight, posterWidth }}
                  key={item.id}
                />
              )}
            />
          </>
        ) : (
          <>
            {trendingList.length ? (
              <Text style={styles.listHeader}>
                Top {trendingList.length} trending anime
              </Text>
            ) : null}
            <FlatList
              ItemSeparatorComponent={Separator}
              data={trendingList}
              numColumns={3}
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
                    {...{ item, index, navigation, posterHeight, posterWidth }}
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

function Separator() {
  return <View style={styles.separator} />;
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
  separator: {
    height: 16,
  },
});
