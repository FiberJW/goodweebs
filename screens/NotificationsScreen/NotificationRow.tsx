import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { graphql, type ResultOf } from "yep/graphql/tada";
import { useGetTitle } from "yep/graphql/viewer";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { getTimeAgo } from "yep/utils";

import { getNotificationText } from "./notificationText";

// Only the two members the screen renders are selected; AniList returns the
// other NotificationUnion members empty.
export const NotificationRowFragment = graphql(`
  fragment NotificationRowFragment on NotificationUnion @_unmask {
    __typename
    ... on AiringNotification {
      id
      episode
      contexts
      createdAt
      media {
        id
        type
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
    ... on RelatedMediaAdditionNotification {
      id
      context
      createdAt
      media {
        id
        type
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
  }
`);

type RenderableNotification = Extract<
  ResultOf<typeof NotificationRowFragment>,
  { __typename: "AiringNotification" | "RelatedMediaAdditionNotification" }
>;
export type NotificationRowData = RenderableNotification & {
  media: NonNullable<RenderableNotification["media"]>;
};

export function NotificationRow({ item }: { item: NotificationRowData }) {
  const router = useRouter();
  const getTitle = useGetTitle();
  const { locale } = useLocaleContext();
  const text = getNotificationText(item, getTitle(item.media.title) ?? "");

  return (
    <PressableOpacity
      accessibilityRole="link"
      accessibilityLabel={text}
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => router.push(`/details/${item.media.id}`)}
    >
      <PosterAndTitle
        size="tiny"
        uri={
          item.media.coverImage?.medium ?? item.media.coverImage?.large ?? ""
        }
      />
      <View style={styles.textColumn}>
        <Text style={styles.text} numberOfLines={3}>
          {text}
        </Text>
        {item.createdAt ? (
          <Text style={styles.timestamp} numberOfLines={1}>
            {getTimeAgo(item.createdAt, locale)}
          </Text>
        ) : null}
      </View>
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: darkTheme.listItemBackground,
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  text: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 16,
  },
  textColumn: {
    flex: 1,
    justifyContent: "space-between",
  },
  timestamp: {
    color: darkTheme.footnote,
    fontFamily: Manrope.regular,
    fontSize: 12.8,
  },
});
