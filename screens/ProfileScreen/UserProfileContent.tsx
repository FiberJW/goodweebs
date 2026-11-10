import { Image, ImageBackground } from "expo-image";
import { fbs } from "fbtee";
import React, { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

import { black50 } from "yep/colors";
import { FollowButton } from "yep/components/FollowButton";
import { JoinedCards } from "yep/components/PagedList";
import { PosterShelf } from "yep/components/PosterShelf";
import { ActivityFeedRow } from "yep/components/activity-feed-row";
import type { ActivityFeedItem } from "yep/graphql/activity";
import { graphql, type ResultOf } from "yep/graphql/tada";
import { useGetName, useGetTitle } from "yep/graphql/viewer";
import { SCREENSHOT_BLUR_RADIUS, fakeHandle } from "yep/screenshotMode";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

export const UserProfileFragment = graphql(`
  fragment UserProfileFragment on User @_unmask {
    id
    name
    isFollowing
    avatar {
      large
      medium
    }
    bannerImage
    favourites {
      anime {
        nodes {
          id
          title {
            english
            romaji
            native
          }
          coverImage {
            large
            medium
          }
        }
      }
      characters {
        nodes {
          id
          name {
            full
            native
          }
          image {
            large
            medium
          }
        }
      }
    }
    statistics {
      anime {
        count
        minutesWatched
      }
      manga {
        count
        chaptersRead
      }
    }
  }
`);

type ProfileUser = ResultOf<typeof UserProfileFragment>;
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
}: {
  activities: readonly ActivityFeedItem[];
}) {
  return (
    <View>
      <Text style={styles.sectionTitle}>
        {String(fbs("Recent activity", "Profile recent list activity title"))}
      </Text>
      {activities.length ? (
        <JoinedCards>
          {activities.map((activity) => (
            <ActivityFeedRow key={activity.id} item={activity} />
          ))}
        </JoinedCards>
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
  activities,
}: {
  user: ProfileUser;
  activities: readonly ActivityFeedItem[];
}) {
  const avatarUrl = user.avatar?.large ?? user.avatar?.medium;
  const getTitle = useGetTitle();
  const getName = useGetName();
  const favoriteAnime = (user.favourites?.anime?.nodes ?? []).flatMap(
    (anime) =>
      anime
        ? [
            {
              id: anime.id,
              uri: anime.coverImage?.large ?? anime.coverImage?.medium ?? "",
              title: getTitle(anime.title),
              href: `/details/${anime.id}` as const,
              size: "profile" as const,
            },
          ]
        : [],
  );
  const favoriteCharacters = (user.favourites?.characters?.nodes ?? []).flatMap(
    (character) =>
      character
        ? [
            {
              id: character.id,
              uri: character.image?.large ?? character.image?.medium ?? "",
              title: getName(character.name),
              href: `/character/${character.id}` as const,
              size: "profile" as const,
            },
          ]
        : [],
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
            <FollowButton
              userId={user.id}
              isFollowing={Boolean(user.isFollowing)}
            />
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
      {favoriteAnime.length ? (
        <View>
          <Text style={styles.sectionTitle}>
            {String(fbs("Favorite anime", "Favorite anime section title"))}
          </Text>
          <PosterShelf posters={favoriteAnime} />
        </View>
      ) : null}
      {favoriteCharacters.length ? (
        <View>
          <Text style={styles.sectionTitle}>
            {String(
              fbs("Favorite characters", "Favorite characters section title"),
            )}
          </Text>
          <PosterShelf posters={favoriteCharacters} />
        </View>
      ) : null}
      <UserActivityFeed activities={activities} />
    </View>
  );
}

const styles = StyleSheet.create({
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
