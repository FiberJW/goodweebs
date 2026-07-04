import { NetworkStatus } from "@apollo/client";
import { Image, ImageBackground } from "expo-image";
import { useRouter } from "expo-router";
import { fbs } from "fbtee";
import React, { PropsWithChildren } from "react";
import {
  RefreshControl,
  View,
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
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { notEmpty, useGetTitle } from "yep/utils";

type StatProps = { label: string; value: number };

type ItemWithId = { id: number };
type FavoriteAnimeItem = {
  id: number;
  title?: {
    english?: string | null;
    romaji?: string | null;
    native?: string | null;
  } | null;
  coverImage?: { large?: string | null; medium?: string | null } | null;
};
type FavoriteCharacterItem = {
  id: number;
  name?: { full?: string | null } | null;
  image?: { large?: string | null; medium?: string | null } | null;
};

function keyExtractor(item: ItemWithId) {
  return `${item.id}`;
}

function renderFavoriteAnime({ item }: { item: FavoriteAnimeItem }) {
  return <FavoriteAnimeListItem item={item} />;
}

function renderFavoriteCharacter({ item }: { item: FavoriteCharacterItem }) {
  return <FavoriteCharacterListItem item={item} />;
}

function FavoriteAnimeListItem({ item }: { item: FavoriteAnimeItem }) {
  const router = useRouter();
  const getTitle = useGetTitle();

  return (
    <View style={styles.favoriteContainer}>
      <PressableOpacity onPress={() => router.push(`/details/${item.id}`)}>
        <PosterAndTitle
          size="profile"
          uri={item?.coverImage?.large ?? ""}
          title={getTitle(item.title)}
        />
      </PressableOpacity>
    </View>
  );
}

function FavoriteCharacterListItem({ item }: { item: FavoriteCharacterItem }) {
  const router = useRouter();

  return (
    <View style={styles.favoriteContainer}>
      <PressableOpacity onPress={() => router.push(`/character/${item.id}`)}>
        <PosterAndTitle
          size="profile"
          uri={item?.image?.large ?? ""}
          title={item.name?.full ?? undefined}
        />
      </PressableOpacity>
    </View>
  );
}

function OptionalBackgroundImage({
  bannerImage,
  children,
}: PropsWithChildren<{ bannerImage?: string | null }>) {
  return bannerImage ? (
    <ImageBackground
      source={{ uri: bannerImage }}
      style={{ borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </ImageBackground>
  ) : (
    <>{children}</>
  );
}

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
    networkStatus,
  } = useGetViewerQuery({ notifyOnNetworkStatusChange: true });
  // RefreshControl spins only for a user-pull refetch (networkStatus 4), not on
  // initial load (1) — fixes the spinner showing under the skeleton on mount.
  const isRefetching = networkStatus === NetworkStatus.refetch;
  const animeList = (viewerData?.Viewer?.favourites?.anime?.nodes ?? []).filter(
    notEmpty,
  );
  const characterList = (
    viewerData?.Viewer?.favourites?.characters?.nodes ?? []
  ).filter(notEmpty);
  const shouldShowInitialProfileLoading = loadingViewer && !viewerData?.Viewer;

  return (
    <View
      style={[styles.outerContainer, { backgroundColor: darkTheme.background }]}
    >
      <Header
        label={String(fbs("Profile", "Profile tab header label"))}
        rightSlot={
          <PressableOpacity
            onPress={() => router.push("/settings")}
            accessibilityRole="button"
            accessibilityLabel={String(
              fbs("Settings", "Settings button accessibility label"),
            )}
          >
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
        // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop -- RefreshControl must be a live element; React Compiler memoizes it
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
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
            <OptionalBackgroundImage bannerImage={viewerData.Viewer.bannerImage}>
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
                    label={String(fbs("Total anime", "Profile stat total anime"))}
                    value={viewerData.Viewer.statistics?.anime?.count ?? 0}
                  />
                  <Stat
                    label={String(
                      fbs("Days watched", "Profile stat days watched"),
                    )}
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
                <Text style={styles.listHeader}>
                  {String(fbs("Favorite anime", "Favorite anime section title"))}
                </Text>
                <FlatList
                  contentContainerStyle={[
                    styles.listContentContainer,
                    { gap: 8 },
                  ]}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={keyExtractor}
                  data={animeList}
                  renderItem={renderFavoriteAnime}
                />
              </View>
            ) : null}
            {characterList.length ? (
              <View>
                <Text style={styles.listHeader}>
                  {String(
                    fbs(
                      "Favorite characters",
                      "Favorite characters section title",
                    ),
                  )}
                </Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[
                    styles.listContentContainer,
                    { gap: 8 },
                  ]}
                  keyExtractor={keyExtractor}
                  data={characterList}
                  renderItem={renderFavoriteCharacter}
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
