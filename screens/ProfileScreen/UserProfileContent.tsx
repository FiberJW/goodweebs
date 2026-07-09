import { Image, ImageBackground } from "expo-image";
import { useRouter } from "expo-router";
import { fbs } from "fbtee";
import React, { PropsWithChildren, ReactNode } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { black50 } from "yep/colors";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import {
  ActivityFeedDivider,
  type ActivityFeedItem,
  ActivityFeedRow,
} from "yep/components/activity-feed-row";
import { UserProfileFragment } from "yep/graphql/profile";
import type { ResultOf } from "yep/graphql/tada";
import { SCREENSHOT_BLUR_RADIUS, fakeHandle } from "yep/screenshotMode";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { notEmpty, useGetName, useGetTitle } from "yep/utils";

type ProfileUser = ResultOf<typeof UserProfileFragment>;
const EMPTY_ACTIVITIES: readonly ActivityFeedItem[] = [];
type ItemWithId = { id: number };
type FavoriteAnimeItem = NonNullable<
  NonNullable<NonNullable<ProfileUser["favourites"]>["anime"]>["nodes"]
>[number];
type FavoriteCharacterItem = NonNullable<
  NonNullable<NonNullable<ProfileUser["favourites"]>["characters"]>["nodes"]
>[number];

function keyExtractor(item: ItemWithId) {
  return `${item.id}`;
}

function renderFavoriteAnime({ item }: { item: FavoriteAnimeItem }) {
  return <FavoriteAnime item={item} />;
}

function renderFavoriteCharacter({ item }: { item: FavoriteCharacterItem }) {
  return <FavoriteCharacter item={item} />;
}

function FavoriteAnime({ item }: { item: FavoriteAnimeItem }) {
  const router = useRouter();
  const getTitle = useGetTitle();
  const title = getTitle(item?.title);

  return (
    <PressableOpacity
      accessibilityRole="link"
      accessibilityLabel={title}
      onPress={() => router.push(`/details/${item?.id}`)}
    >
      <PosterAndTitle
        size="profile"
        uri={item?.coverImage?.large ?? item?.coverImage?.medium ?? ""}
        title={title}
      />
    </PressableOpacity>
  );
}

function FavoriteCharacter({ item }: { item: FavoriteCharacterItem }) {
  const router = useRouter();
  const getName = useGetName();
  const name = getName(item?.name);

  return (
    <PressableOpacity
      accessibilityRole="link"
      accessibilityLabel={name}
      onPress={() => router.push(`/character/${item?.id}`)}
    >
      <PosterAndTitle
        size="profile"
        uri={item?.image?.large ?? item?.image?.medium ?? ""}
        title={name}
      />
    </PressableOpacity>
  );
}

function OptionalBackgroundImage({
  bannerImage,
  children,
}: PropsWithChildren<{ bannerImage?: string | null }>) {
  return bannerImage ? (
    <ImageBackground
      blurRadius={SCREENSHOT_BLUR_RADIUS}
      source={{ uri: bannerImage }}
      style={styles.banner}
    >
      {children}
    </ImageBackground>
  ) : (
    <>{children}</>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
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

function UserActivityFeed({
  activities,
  loading,
  error,
}: {
  activities: readonly ActivityFeedItem[];
  loading: boolean;
  error: boolean;
}) {
  return (
    <View>
      <Text style={styles.sectionTitle}>
        {String(fbs("Recent activity", "Profile recent list activity title"))}
      </Text>
      {loading ? (
        <ActivityIndicator
          color={darkTheme.text}
          style={styles.activityLoading}
        />
      ) : activities.length ? (
        <View>
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              {index ? <ActivityFeedDivider /> : null}
              <ActivityFeedRow
                item={activity}
                first={index === 0}
                last={index === activities.length - 1}
              />
            </React.Fragment>
          ))}
        </View>
      ) : error ? (
        <Text style={styles.emptyActivity}>
          {String(
            fbs("Could not load recent activity.", "Profile activity error"),
          )}
        </Text>
      ) : (
        <Text style={styles.emptyActivity}>
          {String(fbs("No list updates yet.", "Empty profile activity text"))}
        </Text>
      )}
    </View>
  );
}

export function UserProfileContent({
  user,
  action,
  activities = EMPTY_ACTIVITIES,
  activityLoading = false,
  activityError = false,
}: {
  user: ProfileUser;
  action?: ReactNode;
  activities?: readonly ActivityFeedItem[];
  activityLoading?: boolean;
  activityError?: boolean;
}) {
  const avatarUrl = user.avatar?.large ?? user.avatar?.medium;
  const animeList = (user.favourites?.anime?.nodes ?? []).filter(notEmpty);
  const characterList = (user.favourites?.characters?.nodes ?? []).filter(
    notEmpty,
  );

  return (
    <View style={styles.container}>
      <OptionalBackgroundImage bannerImage={user.bannerImage}>
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: user.bannerImage
                ? black50
                : darkTheme.listItemBackground,
            },
          ]}
        >
          <View style={styles.userRow}>
            <Image
              style={styles.avatar}
              source={
                avatarUrl
                  ? { uri: avatarUrl }
                  : require("yep/assets/icons/avatar-placeholder.png")
              }
            />
            <Text style={styles.username} numberOfLines={1}>
              {fakeHandle(user.name)}
            </Text>
            {action}
          </View>
          <View style={styles.statsRow}>
            <Stat
              label={String(fbs("Total anime", "Profile stat total anime"))}
              value={user.statistics?.anime?.count ?? 0}
            />
            <Stat
              label={String(fbs("Days watched", "Profile stat days watched"))}
              value={Math.round(
                (user.statistics?.anime?.minutesWatched ?? 0) / 60 / 24,
              )}
            />
            <Stat
              label={String(fbs("Total manga", "Profile stat total manga"))}
              value={user.statistics?.manga?.count ?? 0}
            />
          </View>
        </View>
      </OptionalBackgroundImage>
      {animeList.length ? (
        <View>
          <Text style={styles.sectionTitle}>
            {String(fbs("Favorite anime", "Favorite anime section title"))}
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shelf}
            keyExtractor={keyExtractor}
            data={animeList}
            renderItem={renderFavoriteAnime}
          />
        </View>
      ) : null}
      {characterList.length ? (
        <View>
          <Text style={styles.sectionTitle}>
            {String(
              fbs("Favorite characters", "Favorite characters section title"),
            )}
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shelf}
            keyExtractor={keyExtractor}
            data={characterList}
            renderItem={renderFavoriteCharacter}
          />
        </View>
      ) : null}
      <UserActivityFeed
        activities={activities}
        loading={activityLoading}
        error={activityError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  activityLoading: { alignSelf: "flex-start", paddingVertical: 24 },
  avatar: { borderRadius: 24, height: 48, width: 48 },
  banner: { borderCurve: "continuous", borderRadius: 16, overflow: "hidden" },
  container: { flex: 1, gap: 20 },
  emptyActivity: {
    color: darkTheme.subText,
    fontFamily: Manrope.regular,
    fontSize: 14,
    paddingVertical: 12,
  },
  sectionTitle: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 25,
    marginBottom: 8,
  },
  shelf: { alignItems: "flex-start", gap: 8 },
  statContainer: { flex: 1, gap: 4 },
  statLabel: {
    color: darkTheme.subHeader,
    fontFamily: Manrope.regular,
    fontSize: 12.8,
  },
  statsRow: { flexDirection: "row", gap: 8 },
  statValue: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 20,
    fontVariant: ["tabular-nums"],
  },
  userCard: {
    borderCurve: "continuous",
    borderRadius: 16,
    gap: 20,
    overflow: "hidden",
    padding: 16,
  },
  username: {
    color: darkTheme.text,
    flex: 1,
    fontFamily: Manrope.semiBold,
    fontSize: 20,
  },
  userRow: { alignItems: "center", flexDirection: "row", gap: 12 },
});
