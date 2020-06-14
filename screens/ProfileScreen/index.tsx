import { useQuery } from "@apollo/react-hooks";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { AsyncStorage, RefreshControl } from "react-native";

import { white } from "yep/colors";
import { AuthButton } from "yep/components/AuthButton";
import { Header } from "yep/components/Header";
import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";
import { client } from "yep/graphql/client";
import { GetViewerQuery, GetViewerQueryVariables } from "yep/graphql/generated";
import { GetViewer } from "yep/graphql/queries/Viewer";
import { RootStackParamList } from "yep/navigation";
import { StringCase, getString } from "yep/strings";
import { notEmpty } from "yep/utils";

import {
  OuterContainer,
  InnerContainer,
  UserInfoAndStatsContainer,
  Avatar,
  UserInfoRow,
  Username,
  StatsRow,
  Stat,
  StatsRowSpacer,
  ListHeader,
  makeListWithType,
  ListSpacer,
  Poster,
  FavoriteContainer,
  FavoriteName,
  EverythingButTheCTA,
} from "./styles";

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
};

export function ProfileScreen({ navigation }: Props) {
  const { loading: loadingViewer, data: viewerData, refetch } = useQuery<
    GetViewerQuery,
    GetViewerQueryVariables
  >(GetViewer, { notifyOnNetworkStatusChange: true });

  const animeList = (viewerData?.Viewer?.favourites?.anime?.nodes ?? []).filter(
    notEmpty
  );
  const characterList = (
    viewerData?.Viewer?.favourites?.characters?.nodes ?? []
  ).filter(notEmpty);

  type AnimeItem = typeof animeList[number];
  type CharacterItem = typeof characterList[number];

  const FavoriteAnimeList = makeListWithType<AnimeItem>();
  const FavoriteCharacterList = makeListWithType<CharacterItem>();

  return (
    <OuterContainer>
      <Header
        label={getString("profile", StringCase.TITLE)}
        onSyncPress={async () => {
          await refetch();
        }}
      />
      <InnerContainer
        refreshControl={
          <RefreshControl
            refreshing={loadingViewer}
            onRefresh={() => refetch()}
            tintColor={white}
            titleColor={white}
          />
        }
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
      >
        {viewerData?.Viewer ? (
          <EverythingButTheCTA>
            <UserInfoAndStatsContainer>
              <UserInfoRow>
                <Avatar
                  source={
                    viewerData?.Viewer?.avatar
                      ? { uri: viewerData?.Viewer?.avatar?.medium }
                      : require("yep/assets/icons/avatar-placeholder.png")
                  }
                />
                <Username numberOfLines={1}>{viewerData.Viewer.name}</Username>
              </UserInfoRow>
              <StatsRow>
                <Stat
                  label="Total Anime"
                  value={viewerData.Viewer.statistics?.anime?.count ?? 0}
                />
                <Stat
                  label="Days Watched"
                  value={Math.round(
                    (viewerData.Viewer.statistics?.anime?.minutesWatched ?? 0) /
                      60 /
                      24
                  )}
                />
              </StatsRow>
              <StatsRowSpacer />
              <StatsRow>
                <Stat
                  label="Total Manga"
                  value={viewerData.Viewer.statistics?.manga?.count ?? 0}
                />
                <Stat
                  label="Chapters Read"
                  value={viewerData.Viewer.statistics?.manga?.chaptersRead ?? 0}
                />
              </StatsRow>
            </UserInfoAndStatsContainer>
            {animeList.length ? (
              <>
                <ListHeader>Favorite Anime</ListHeader>
                <FavoriteAnimeList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={ListSpacer}
                  keyExtractor={(item) => `${item.id}`}
                  data={animeList}
                  renderItem={({ item }) => (
                    <FavoriteContainer>
                      <Poster
                        resizeMode="cover"
                        source={{
                          uri: item?.coverImage?.large ?? "",
                        }}
                      />
                      {item?.title ? (
                        <FavoriteName numberOfLines={2}>
                          {item.title.english ||
                            item.title.romaji ||
                            item.title.native}
                        </FavoriteName>
                      ) : null}
                    </FavoriteContainer>
                  )}
                />
              </>
            ) : null}
            {characterList.length ? (
              <>
                <ListHeader>Favorite Characters</ListHeader>
                <FavoriteCharacterList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={ListSpacer}
                  keyExtractor={(item) => `${item.id}`}
                  data={characterList}
                  renderItem={({ item }) => (
                    <FavoriteContainer>
                      <Poster
                        resizeMode="cover"
                        source={{
                          uri: item.image?.large ?? "",
                        }}
                      />
                      {item?.name ? (
                        <FavoriteName numberOfLines={2}>
                          {item.name.full}
                        </FavoriteName>
                      ) : null}
                    </FavoriteContainer>
                  )}
                />
              </>
            ) : null}
          </EverythingButTheCTA>
        ) : null}
        <AuthButton
          label="Log out"
          onPress={async () => {
            navigation.replace("Auth");
            await client.clearStore();
            await AsyncStorage.removeItem(ANILIST_ACCESS_TOKEN_STORAGE);
          }}
        />
      </InnerContainer>
    </OuterContainer>
  );
}
