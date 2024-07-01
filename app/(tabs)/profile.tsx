import React, { PropsWithChildren } from "react";
import { ImageBackground, RefreshControl, View, Image } from "react-native";

import { black50, white } from "yep/colors";
import { Header } from "yep/components/Header";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { useGetViewerQuery } from "yep/graphql/generated";
import { StringCase, getString } from "yep/strings";
import { darkTheme } from "yep/themes";
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
} from "../../components/ProfileScreen/styles";

export function ProfileScreen() {
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

  function OptionalBackgroundImage({ children }: PropsWithChildren) {
    return viewerData?.Viewer?.bannerImage ? (
      <ImageBackground
        source={{ uri: viewerData.Viewer.bannerImage }}
        style={{ borderRadius: 8, overflow: "hidden" }}
      >
        {children}
      </ImageBackground>
    ) : (
      <>{children}</>
    );
  }

  return (
    <OuterContainer>
      <Header
        label={getString("profile", StringCase.TITLE)}
        rightSlot={
          <PressableOpacity onPress={() => navigation.navigate("Settings")}>
            <Image
              style={{
                tintColor: white,
                height: 24,
                width: 24,
              }}
              source={require("yep/assets/icons/navigation/settings-gear.png")}
            />
          </PressableOpacity>
        }
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
        showsVerticalScrollIndicator={false}
      >
        {viewerData?.Viewer ? (
          <EverythingButTheCTA>
            <OptionalBackgroundImage>
              <UserInfoAndStatsContainer
                style={{
                  backgroundColor: viewerData?.Viewer?.bannerImage
                    ? black50
                    : darkTheme.listItemBackground,
                }}
              >
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
                  <Username numberOfLines={1}>
                    {viewerData.Viewer.name}
                  </Username>
                </UserInfoRow>
                <StatsRow>
                  <Stat
                    label="Total Anime"
                    value={viewerData.Viewer.statistics?.anime?.count ?? 0}
                  />
                  <Stat
                    label="Days Watched"
                    value={Math.round(
                      (viewerData.Viewer.statistics?.anime?.minutesWatched ??
                        0) /
                        60 /
                        24
                    )}
                  />
                </StatsRow>
              </UserInfoAndStatsContainer>
            </OptionalBackgroundImage>
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
      </InnerContainer>
    </OuterContainer>
  );
}
