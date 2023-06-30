import { useApolloClient } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { Alert, RefreshControl, View } from "react-native";

import { white } from "yep/colors";
import { Button } from "yep/components/Button";
import { Header } from "yep/components/Header";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";
import { useGetViewerQuery } from "yep/graphql/generated";
import { RootStackParamList, TabParamList } from "yep/navigation";
import { StringCase, getString } from "yep/strings";
import { useAccessToken } from "yep/useAccessToken";
import { notEmpty, getTitle } from "yep/utils";

import {
  OuterContainer,
  InnerContainer,
  UserInfoAndStatsContainer,
  Avatar,
  UserInfoRow,
  Username,
  StatsRow,
  Stat,
  ListHeader,
  makeListWithType,
  FavoriteContainer,
  EverythingButTheCTA,
} from "./styles";

type Props = {
  navigation: StackNavigationProp<RootStackParamList & TabParamList>;
};

export function ProfileScreen({ navigation }: Props) {
  const {
    loading: loadingViewer,
    data: viewerData,
    refetch,
  } = useGetViewerQuery({ notifyOnNetworkStatusChange: true });
  const { setAccessToken } = useAccessToken();
  const animeList = (viewerData?.Viewer?.favourites?.anime?.nodes ?? []).filter(
    notEmpty
  );
  const characterList = (
    viewerData?.Viewer?.favourites?.characters?.nodes ?? []
  ).filter(notEmpty);
  const client = useApolloClient();

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
            </UserInfoAndStatsContainer>
            {animeList.length ? (
              <View>
                <ListHeader>Favorite Anime</ListHeader>
                <FavoriteAnimeList
                  contentContainerStyle={{ gap: 8 }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => `${item.id}`}
                  data={animeList}
                  renderItem={({ item }) => (
                    <FavoriteContainer>
                      <PressableOpacity
                        onPress={() =>
                          navigation.navigate("Details", { id: item.id })
                        }
                      >
                        <PosterAndTitle
                          size="profile"
                          uri={item?.coverImage?.large ?? ""}
                          title={getTitle(item.title)}
                        />
                      </PressableOpacity>
                    </FavoriteContainer>
                  )}
                />
              </View>
            ) : null}
            {characterList.length ? (
              <View>
                <ListHeader>Favorite Characters</ListHeader>
                <FavoriteCharacterList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                  keyExtractor={(item) => `${item.id}`}
                  data={characterList}
                  renderItem={({ item }) => (
                    <FavoriteContainer>
                      <PressableOpacity
                        onPress={() =>
                          navigation.navigate("Character", { id: item.id })
                        }
                      >
                        <PosterAndTitle
                          size="profile"
                          uri={item?.image?.large ?? ""}
                          title={item.name?.full ?? undefined}
                        />
                      </PressableOpacity>
                    </FavoriteContainer>
                  )}
                />
              </View>
            ) : null}
          </EverythingButTheCTA>
        ) : null}

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
                  setAccessToken(undefined);
                  navigation.navigate("Anime");
                  await client.resetStore();
                },
              },
            ]);
          }}
        />
      </InnerContainer>
    </OuterContainer>
  );
}
