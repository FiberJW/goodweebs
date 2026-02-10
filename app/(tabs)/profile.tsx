import { useRouter } from "expo-router";
import React, { PropsWithChildren } from "react";
import {
  ImageBackground,
  RefreshControl,
  View,
  Image,
  ScrollView,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";

import { black50, white } from "yep/colors";
import { Header } from "yep/components/Header";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { useGetViewerQuery } from "yep/graphql/generated";
import { ProfileSkeleton } from "yep/screens/ProfileScreen/ProfileSkeleton";
import { StringCase, getString } from "yep/strings";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { notEmpty, getTitle } from "yep/utils";

type StatProps = { label: string; value: number };

function Stat({ label, value }: StatProps) {
  return (
    <View style={styles.statContainer}>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function Profile() {
  const router = useRouter();
  const {
    loading: loadingViewer,
    data: viewerData,
    refetch,
  } = useGetViewerQuery({ notifyOnNetworkStatusChange: true });
  const animeList = (viewerData?.Viewer?.favourites?.anime?.nodes ?? []).filter(
    notEmpty,
  );
  const characterList = (
    viewerData?.Viewer?.favourites?.characters?.nodes ?? []
  ).filter(notEmpty);
  const shouldShowInitialProfileLoading = loadingViewer && !viewerData?.Viewer;

  type AnimeItem = (typeof animeList)[number];
  type CharacterItem = (typeof characterList)[number];

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
    <View
      style={[styles.outerContainer, { backgroundColor: darkTheme.background }]}
    >
      <Header
        label={getString("profile", StringCase.TITLE)}
        rightSlot={
          <PressableOpacity onPress={() => router.push("/settings")}>
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
      <ScrollView
        contentContainerStyle={styles.innerContainerContent}
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
        {shouldShowInitialProfileLoading ? (
          <ProfileSkeleton />
        ) : viewerData?.Viewer ? (
          <View style={styles.everythingButTheCTA}>
            <OptionalBackgroundImage>
              <View
                style={[
                  styles.userInfoAndStatsContainer,
                  {
                    backgroundColor: viewerData?.Viewer?.bannerImage
                      ? black50
                      : darkTheme.listItemBackground,
                  },
                ]}
              >
                <View style={styles.userInfoRow}>
                  <Image
                    style={styles.avatar}
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
                  <Text style={styles.username} numberOfLines={1}>
                    {viewerData.Viewer.name}
                  </Text>
                </View>
                <View style={styles.statsRow}>
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
                        24,
                    )}
                  />
                </View>
              </View>
            </OptionalBackgroundImage>
            {animeList.length ? (
              <View>
                <Text style={styles.listHeader}>Favorite Anime</Text>
                <FlatList
                  contentContainerStyle={[
                    styles.listContentContainer,
                    { gap: 8 },
                  ]}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item: AnimeItem) => `${item.id}`}
                  data={animeList}
                  renderItem={({ item }: { item: AnimeItem }) => (
                    <View style={styles.favoriteContainer}>
                      <PressableOpacity
                        onPress={() => router.push(`/details/${item.id}`)}
                      >
                        <PosterAndTitle
                          size="profile"
                          uri={item?.coverImage?.large ?? ""}
                          title={getTitle(item.title)}
                        />
                      </PressableOpacity>
                    </View>
                  )}
                />
              </View>
            ) : null}
            {characterList.length ? (
              <View>
                <Text style={styles.listHeader}>Favorite Characters</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[
                    styles.listContentContainer,
                    { gap: 8 },
                  ]}
                  keyExtractor={(item: CharacterItem) => `${item.id}`}
                  data={characterList}
                  renderItem={({ item }: { item: CharacterItem }) => (
                    <View style={styles.favoriteContainer}>
                      <PressableOpacity
                        onPress={() => router.push(`/character/${item.id}`)}
                      >
                        <PosterAndTitle
                          size="profile"
                          uri={item?.image?.large ?? ""}
                          title={item.name?.full ?? undefined}
                        />
                      </PressableOpacity>
                    </View>
                  )}
                />
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  innerContainerContent: {
    padding: 16,
    justifyContent: "space-between",
    gap: 16,
  },
  userInfoAndStatsContainer: {
    padding: 16,
    borderRadius: 8,
    gap: 16,
    overflow: "hidden",
    flex: 1,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  username: {
    fontFamily: Manrope.semiBold,
    fontSize: 20,
    color: darkTheme.text,
  },
  statsRow: {
    flexDirection: "row",
  },
  statContainer: {
    flex: 1,
    gap: 4,
  },
  statLabel: {
    fontFamily: Manrope.regular,
    fontSize: 12.8,
    color: darkTheme.text,
  },
  statValue: {
    fontFamily: Manrope.semiBold,
    fontSize: 20,
    color: darkTheme.text,
  },
  listHeader: {
    fontFamily: Manrope.semiBold,
    fontSize: 25,
    color: darkTheme.text,
    marginBottom: 8,
  },
  listContentContainer: {
    alignItems: "flex-start",
  },
  favoriteContainer: {
    alignItems: "center",
  },
  everythingButTheCTA: {
    flex: 1,
    gap: 16,
  },
});
