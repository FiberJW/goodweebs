import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { fbs } from "fbtee";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PressableOpacity } from "yep/components/PressableOpacity";
import {
  getListActivityAction,
  type ActivityFeedItem,
  type ListActivityAction,
} from "yep/graphql/activity";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { fakeHandle } from "yep/screenshotMode";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { getDateFnsLocale, useGetTitle } from "yep/utils";

export function ActivityFeedDivider() {
  return <View style={styles.divider} />;
}

function getActivityActionText(
  action: ListActivityAction,
  progress: string | null | undefined,
) {
  const progressText = progress?.trim();

  switch (action) {
    case "watchedEpisode":
      return progressText
        ? String(
            fbs(
              [
                " watched episode ",
                fbs.param("progress", progressText),
                " of ",
              ],
              "Anime list activity with episode progress",
            ),
          )
        : String(
            fbs(
              " watched an episode of ",
              "Anime list activity without episode progress",
            ),
          );
    case "rewatchedEpisode":
      return progressText
        ? String(
            fbs(
              [
                " rewatched episode ",
                fbs.param("progress", progressText),
                " of ",
              ],
              "Anime rewatch list activity with episode progress",
            ),
          )
        : String(
            fbs(
              " rewatched an episode of ",
              "Anime rewatch list activity without episode progress",
            ),
          );
    case "readChapter":
      return progressText
        ? String(
            fbs(
              [
                " read chapter ",
                fbs.param("progress", progressText),
                " of ",
              ],
              "Manga list activity with chapter progress",
            ),
          )
        : String(
            fbs(
              " read a chapter of ",
              "Manga list activity without chapter progress",
            ),
          );
    case "rereadChapter":
      return progressText
        ? String(
            fbs(
              [
                " reread chapter ",
                fbs.param("progress", progressText),
                " of ",
              ],
              "Manga reread list activity with chapter progress",
            ),
          )
        : String(
            fbs(
              " reread a chapter of ",
              "Manga reread list activity without chapter progress",
            ),
          );
    case "plansToWatch":
      return String(fbs(" plans to watch ", "Plans to watch list activity"));
    case "plansToRead":
      return String(fbs(" plans to read ", "Plans to read list activity"));
    case "completed":
      return String(fbs(" completed ", "Completed list activity"));
    case "pausedWatching":
      return String(fbs(" paused watching ", "Paused watching list activity"));
    case "pausedReading":
      return String(fbs(" paused reading ", "Paused reading list activity"));
    case "dropped":
      return String(fbs(" dropped ", "Dropped list activity"));
    case "updated":
      return String(fbs(" updated ", "Generic list activity"));
  }
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
  const actionText = getActivityActionText(
    getListActivityAction(item.status),
    item.progress,
  );
  // fbtee trims boundary whitespace from source and translated strings.
  // English needs word spacing; Japanese particles and punctuation should
  // join directly to the username and title.
  const renderedActionText = locale.startsWith("ja")
    ? actionText
    : ` ${actionText} `;
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
          <Text style={styles.action}>{renderedActionText}</Text>
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
      {coverUrl ? (
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
      ) : null}
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
