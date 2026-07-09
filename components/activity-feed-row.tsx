import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { fbs } from "fbtee";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PressableOpacity } from "yep/components/PressableOpacity";
import { graphql } from "yep/graphql/tada";
import type { ResultOf } from "yep/graphql/tada";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { fakeHandle } from "yep/screenshotMode";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { getDateFnsLocale, useGetTitle } from "yep/utils";

export const ActivityFeedFragment = graphql(`
  fragment ActivityFeedFragment on ListActivity @_unmask {
    id
    createdAt
    status
    progress
    user {
      id
      name
      avatar {
        medium
        large
      }
    }
    media {
      id
      title {
        romaji
        native
        english
      }
      coverImage {
        medium
        large
      }
    }
  }
`);

export type ActivityFeedItem = ResultOf<typeof ActivityFeedFragment>;

export function ActivityFeedDivider() {
  return <View style={styles.divider} />;
}

export function ActivityFeedRow({
  item,
  first = false,
  last = false,
}: {
  item: ActivityFeedItem;
  first?: boolean;
  last?: boolean;
}) {
  const router = useRouter();
  const { locale } = useLocaleContext();
  const getTitle = useGetTitle();
  const { media, user } = item;

  if (!media || !user) return null;

  const avatarUrl = user.avatar?.medium ?? user.avatar?.large ?? "";
  const coverUrl = media.coverImage?.medium ?? media.coverImage?.large ?? "";
  const mediaTitle = getTitle(media.title) ?? "";
  // ponytail: `status` verbs ("watched episode", "plans to watch") only exist
  // in English on AniList — the connector below is the localizable part.
  const action = [item.status ?? "updated", item.progress]
    .filter(Boolean)
    .join(" ");
  const connector = item.progress
    ? ` ${String(
        fbs(
          "of",
          "Connector between a list activity action and the media title, as in 'watched episode 3 of TITLE'",
        ),
      )} `
    : " ";
  const profileLabel = String(
    fbs(
      [fbs.param("username", user.name), "'s profile"],
      "User profile link accessibility label",
    ),
  );
  const userHref = `/user/${user.id}` as const;
  const mediaHref = `/details/${media.id}` as const;

  return (
    <View
      style={[
        styles.row,
        {
          borderTopLeftRadius: first ? 16 : undefined,
          borderTopRightRadius: first ? 16 : undefined,
          borderBottomLeftRadius: last ? 16 : undefined,
          borderBottomRightRadius: last ? 16 : undefined,
        },
      ]}
    >
      <PressableOpacity
        borderRadius={24}
        accessibilityRole="link"
        accessibilityLabel={profileLabel}
        onPress={() => router.push(userHref)}
      >
        <Image
          source={
            avatarUrl
              ? { uri: avatarUrl }
              : require("yep/assets/icons/avatar-placeholder.png")
          }
          style={styles.avatar}
        />
      </PressableOpacity>
      <View style={styles.activityText}>
        <Text style={styles.summary} numberOfLines={3}>
          <Text
            style={styles.username}
            accessibilityRole="link"
            accessibilityLabel={profileLabel}
            onPress={() => router.push(userHref)}
          >
            {fakeHandle(user.name)}
          </Text>
          <Text style={styles.action}>{` ${action}${connector}`}</Text>
          <Text
            style={styles.mediaTitle}
            accessibilityRole="link"
            accessibilityLabel={mediaTitle}
            onPress={() => router.push(mediaHref)}
          >
            {mediaTitle}
          </Text>
        </Text>
        <Text style={styles.timestamp} numberOfLines={1}>
          {formatDistanceToNow(new Date(item.createdAt * 1000), {
            addSuffix: true,
            locale: getDateFnsLocale(locale),
          })}
        </Text>
      </View>
      <PressableOpacity
        borderRadius={8}
        accessibilityRole="link"
        accessibilityLabel={mediaTitle}
        onPress={() => router.push(mediaHref)}
      >
        <Image
          contentFit="cover"
          recyclingKey={coverUrl}
          source={{ uri: coverUrl }}
          style={styles.cover}
        />
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    color: darkTheme.subText,
    fontFamily: Manrope.regular,
    fontSize: 15,
  },
  activityText: {
    alignSelf: "stretch",
    flex: 1,
    justifyContent: "space-between",
  },
  avatar: {
    borderCurve: "continuous",
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  cover: {
    backgroundColor: darkTheme.listItemBackground,
    borderCurve: "continuous",
    borderRadius: 8,
    height: 80,
    overflow: "hidden",
    width: 56,
  },
  divider: {
    backgroundColor: darkTheme.listItemBorder,
    height: StyleSheet.hairlineWidth,
  },
  mediaTitle: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 15,
  },
  row: {
    alignItems: "flex-start",
    backgroundColor: darkTheme.listItemBackground,
    borderCurve: "continuous",
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  summary: { color: darkTheme.subText, lineHeight: 20 },
  timestamp: {
    color: darkTheme.subHeader,
    fontFamily: Manrope.regular,
    fontSize: 12,
  },
  username: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 15,
  },
});
