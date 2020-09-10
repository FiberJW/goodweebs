import { useQuery } from "@apollo/client";
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
import { notEmpty, getTitle } from "yep/utils";

import {
  OuterContainer,
  InnerContainer,
  UserInfoAndStatsContainer,
  Avatar,
  UserInfoRow,
  ListItemSpacer,
  Username,
  ListHeaderSpacer,
  StatsRow,
  Stat,
  ListHeader,
  makeListWithType,
  ListSpacer,
  Poster,
  AvatarSpacer,
  FavoriteContainer,
  FavoriteName,
  EverythingButTheCTA,
  VerticalSpacer,
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
      <Header label={getString("profile", StringCase.TITLE)} />
      <InnerContainer
        refreshControl={
          <RefreshControl
            refreshing={loadingViewer}
            onRefresh={() => refetch()}
            tintColor={white}
            titleColor={white}
          />
        }
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
                <AvatarSpacer />
                <Username numberOfLines={1}>{viewerData.Viewer.name}</Username>
              </UserInfoRow>
              <VerticalSpacer />
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
            </UserInfoAndStatsContainer>
            {animeList.length ? (
              <>
                <VerticalSpacer />
                <ListHeader>Favorite Anime</ListHeader>
                <ListHeaderSpacer />
                <FavoriteAnimeList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={ListItemSpacer}
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
                        <>
                          <ListSpacer />
                          <FavoriteName numberOfLines={2}>
                            {getTitle(item.title)}
                          </FavoriteName>
                        </>
                      ) : null}
                    </FavoriteContainer>
                  )}
                />
              </>
            ) : null}

            {characterList.length ? (
              <>
                <VerticalSpacer />
                <ListHeader>Favorite Characters</ListHeader>
                <ListHeaderSpacer />
                <FavoriteCharacterList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={ListItemSpacer}
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
                        <>
                          <ListSpacer />
                          <FavoriteName numberOfLines={2}>
                            {item.name.full}
                          </FavoriteName>
                        </>
                      ) : null}
                    </FavoriteContainer>
                  )}
                />
              </>
            ) : null}
          </EverythingButTheCTA>
        ) : null}
        <VerticalSpacer />
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
