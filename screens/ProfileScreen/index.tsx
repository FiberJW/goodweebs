import { StackNavigationProp } from "@react-navigation/stack";
import * as Updates from "expo-updates";
import React from "react";
import { Alert, AsyncStorage, RefreshControl } from "react-native";

import { white } from "yep/colors";
import { Button } from "yep/components/Button";
import { Header } from "yep/components/Header";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";
import { useGetViewerQuery } from "yep/graphql/generated";
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
  AvatarSpacer,
  FavoriteContainer,
  EverythingButTheCTA,
  VerticalSpacer,
} from "./styles";

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
};

export function ProfileScreen({ navigation }: Props) {
  const {
    loading: loadingViewer,
    data: viewerData,
    refetch,
  } = useGetViewerQuery({ notifyOnNetworkStatusChange: true });

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
                      ? {
                          uri:
                            viewerData?.Viewer?.avatar?.large ??
                            viewerData?.Viewer?.avatar?.medium,
                        }
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
                      <PosterAndTitle
                        size="profile"
                        uri={item?.coverImage?.large ?? ""}
                        title={getTitle(item.title)}
                        onPress={() =>
                          navigation.navigate("Details", { id: item.id })
                        }
                      />
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
                      <PosterAndTitle
                        disabled
                        size="profile"
                        uri={item?.image?.large ?? ""}
                        title={item.name?.full ?? undefined}
                      />
                    </FavoriteContainer>
                  )}
                />
              </>
            ) : null}
          </EverythingButTheCTA>
        ) : null}
        <VerticalSpacer />
        <Button
          label="Log out"
          onPress={async () => {
            Alert.alert("Are you sure that you want to log out?", undefined, [
              { style: "cancel", text: "Cancel" },
              {
                text: "Log out",
                style: "destructive",
                onPress: async () => {
                  await AsyncStorage.removeItem(ANILIST_ACCESS_TOKEN_STORAGE);
                  await Updates.reloadAsync();
                },
              },
            ]);
          }}
        />
      </InnerContainer>
    </OuterContainer>
  );
}
