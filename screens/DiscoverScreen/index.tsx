import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { RefreshControl, useWindowDimensions } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { SearchBox } from "yep/components/SearchBox";
import {
  useGetTrendingAnimeQuery,
  useSearchAnimeQuery,
} from "yep/graphql/generated";
import { RootStackParamList } from "yep/navigation";
import { getString, StringCase } from "yep/strings";
import { takimoto } from "yep/takimoto";
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
    notifyOnNetworkStatusChange: true,
  });

  const { data: searchData, loading: loadingSearchData } = useSearchAnimeQuery({
    skip: searchTerm.trim().length === 0,
    variables: { search: searchTerm },
    notifyOnNetworkStatusChange: true,
  });

  const searchList = (searchData?.Page?.media ?? []).filter(notEmpty);
  const trendingList = (trendingData?.Page?.media ?? []).filter(notEmpty);

  const SearchList = makeList<typeof searchList[number]>();
  const TrendingList = makeList<typeof trendingList[number]>();

  async function refetchTrending() {
    await refetchTrendingOriginal();
  }

  return (
    <OuterContainer>
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
      <InnerContainer>
        {showSearchResultsView ? (
          <>
            <ListHeader>Search results for: {searchTerm}</ListHeader>
            <SearchList
              ItemSeparatorComponent={Divider}
              data={searchList}
              ListEmptyComponent={() =>
                loadingSearchData ? null : <EmptyState />
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
              <ListHeader>Top {trendingList.length} trending anime</ListHeader>
            ) : null}
            <TrendingList
              ItemSeparatorComponent={Divider}
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
      </InnerContainer>
    </OuterContainer>
  );
}

const OuterContainer = takimoto.View({
  flex: 1,
});

const InnerContainer = takimoto.View({
  flex: 1,
  padding: 16,
});

const Divider = takimoto.View({
  height: 16,
});

const ListHeader = takimoto.Text({
  fontFamily: Manrope.semiBold,
  fontSize: 20,
  color: darkTheme.text,
  marginBottom: 16,
});

function makeList<T>() {
  return takimoto.FlatList<T>({}, {});
}
