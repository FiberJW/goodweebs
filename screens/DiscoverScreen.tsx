import { useQuery } from "@apollo/react-hooks";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { Dimensions, RefreshControl } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { SearchBox } from "yep/components/SearchBox";
import {
  GetTrendingAnimeQuery,
  GetTrendingAnimeQueryVariables,
  SearchAnimeQuery,
  SearchAnimeQueryVariables,
} from "yep/graphql/generated";
import {
  GetTrendingTVAnime,
  mediaSeason,
  SearchAnime,
  year,
} from "yep/graphql/queries/Discover";
import { RootStackParamList } from "yep/navigation";
import { getString, StringCase } from "yep/strings";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { notEmpty } from "yep/utils";

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
};

export function DiscoverScreen({ navigation }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const showSearchResultsView = searchTerm.length > 0;

  const {
    loading: loadingTrending,
    data: trendingData,
    refetch: refetchTrendingOriginal,
  } = useQuery<GetTrendingAnimeQuery, GetTrendingAnimeQueryVariables>(
    GetTrendingTVAnime,
    {
      variables: { season: mediaSeason, year, perPage: 30 },
    }
  );

  const { data: searchData } = useQuery<
    SearchAnimeQuery,
    SearchAnimeQueryVariables
  >(SearchAnime, {
    skip: searchTerm.trim().length === 0,
    variables: { search: searchTerm },
    notifyOnNetworkStatusChange: true,
  });

  const searchList = (searchData?.Page?.media ?? []).filter(notEmpty);
  const trendingList = (trendingData?.Page?.media ?? []).filter(notEmpty);

  const SearchList = makeList<typeof searchList[number]>();
  const TrendingList = makeList<typeof trendingList[number]>();

  async function refetchTrending() {
    setIsFirstLoad(false);
    await refetchTrendingOriginal({ season: mediaSeason, year });
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
          searchList.length === 0 ? (
            <EmptyState />
          ) : (
            <SearchList
              ListHeaderComponent={() => (
                <ListHeader>Search results for: {searchTerm}</ListHeader>
              )}
              ItemSeparatorComponent={Divider}
              data={searchList}
              numColumns={3}
              keyExtractor={(item) => `${item.id}`}
              renderItem={({ item, index }) => (
                <PosterContainer
                  onPress={() =>
                    navigation.navigate("Details", { id: item.id })
                  }
                  style={
                    (index + 1) % 3 !== 0 ? { marginRight: 16 } : undefined
                  }
                >
                  <Poster source={{ uri: item.coverImage?.large ?? "" }} />
                  <PosterTitle numberOfLines={2}>
                    {item.title?.english ||
                      item.title?.romaji ||
                      item.title?.native}
                  </PosterTitle>
                </PosterContainer>
              )}
            />
          )
        ) : (
          <TrendingList
            ListHeaderComponent={() =>
              trendingList.length ? (
                <ListHeader>
                  Top {trendingList.length} trending anime
                </ListHeader>
              ) : null
            }
            ItemSeparatorComponent={Divider}
            data={trendingList}
            numColumns={3}
            refreshControl={
              <RefreshControl
                refreshing={!isFirstLoad && loadingTrending}
                onRefresh={refetchTrending}
                tintColor={darkTheme.text}
                titleColor={darkTheme.text}
              />
            }
            keyExtractor={(item) => `${item.id}`}
            renderItem={({ item, index }) => (
              <PosterContainer
                onPress={() => navigation.navigate("Details", { id: item.id })}
                style={(index + 1) % 3 !== 0 ? { marginRight: 16 } : undefined}
              >
                <Poster
                  resizeMode="cover"
                  source={{ uri: item.coverImage?.large ?? "" }}
                />
                <PosterTitle numberOfLines={2}>
                  {item.title?.english ||
                    item.title?.romaji ||
                    item.title?.native}
                </PosterTitle>
              </PosterContainer>
            )}
          />
        )}
      </InnerContainer>
    </OuterContainer>
  );
}

const posterWidth = (Dimensions.get("window").width - 16 * 4) / 3;
const posterHeight = posterWidth * 1.4285714286;

const Poster = takimoto.Image({
  height: posterHeight,
  width: posterWidth,
  borderRadius: 4,
  overflow: "hidden",
  marginBottom: 8,
  backgroundColor: darkTheme.listItemBackground,
});

const PosterTitle = takimoto.Text({
  fontFamily: "Manrope-Regular",
  fontSize: 12.8,
  textAlign: "center",
  maxWidth: posterWidth,
  color: darkTheme.text,
});

const PosterContainer = takimoto.TouchableOpacity({
  alignItems: "center",
});

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
  fontFamily: "Manrope-SemiBold",
  fontSize: 20,
  color: darkTheme.text,
  marginBottom: 16,
});

function makeList<T>() {
  return takimoto.FlatList<T>({}, {});
}
