import { useQuery } from "@apollo/react-hooks";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { Dimensions } from "react-native";

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
import { RootStackParamList, Navigation } from "yep/navigation";
import { getString, StringCase } from "yep/strings";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { notEmpty } from "yep/utils";

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
};

export function DiscoverScreen({ navigation }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const showSearchResultsView = searchTerm.length > 0;

  const {
    loading: loadingTrending,
    data: trendingData,
    refetch: refetchTrending,
  } = useQuery<GetTrendingAnimeQuery, GetTrendingAnimeQueryVariables>(
    GetTrendingTVAnime,
    {
      variables: { season: mediaSeason, year, perPage: 30 },
      pollInterval: 5000,
    }
  );

  const { loading: loadingSearch, data: searchData } = useQuery<
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

  return (
    <OuterContainer>
      <Header
        label={getString("discover", StringCase.TITLE)}
        refreshing={loadingTrending || loadingSearch}
        onSyncPress={() => refetchTrending({ season: mediaSeason, year })}
      />
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
        <ListHeader>
          {showSearchResultsView
            ? `Search results for: ${searchTerm}`
            : "Top 30 trending anime"}
        </ListHeader>
        {showSearchResultsView ? (
          searchList.length === 0 ? (
            <EmptyState />
          ) : (
            <SearchList
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
                  <Poster source={{ uri: item.coverImage?.extraLarge ?? "" }} />
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
            ItemSeparatorComponent={Divider}
            data={trendingList}
            numColumns={3}
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
