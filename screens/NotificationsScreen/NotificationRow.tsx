import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { graphql, type ResultOf } from "yep/graphql/tada";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { getDateFnsLocale, useGetTitle } from "yep/utils";

import { getNotificationText } from "./notificationText";

// Colocated fragment for a notification-list row. @_unmask because the
// notifications screen narrows this union by __typename and reshapes it (rather
// than handing a masked ref to a leaf), so it needs the fields visible. Only the
// two members the screen renders are selected; other NotificationUnion members
// come back empty (filtered server-side via type_in, narrowed away in the screen).
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

// The two renderable members, with media guaranteed present (the screen filters
// out rows without media before rendering).
type RenderableNotification = Extract<
  ResultOf<typeof NotificationRowFragment>,
  { __typename: "AiringNotification" | "RelatedMediaAdditionNotification" }
>;
export type NotificationRowData = RenderableNotification & {
  media: NonNullable<RenderableNotification["media"]>;
};

export function NotificationRow({
  item,
  first,
  last,
}: {
  item: NotificationRowData;
  first: boolean;
  last: boolean;
}) {
  const router = useRouter();
  const getTitle = useGetTitle();
  const { locale } = useLocaleContext();
  const text = getNotificationText(item, getTitle(item.media.title) ?? "");

  return (
    <PressableOpacity
      accessibilityRole="link"
      accessibilityLabel={text}
      style={[
        styles.row,
        {
          borderTopRightRadius: first ? 16 : undefined,
          borderTopLeftRadius: first ? 16 : undefined,
          borderBottomRightRadius: last ? 16 : undefined,
          borderBottomLeftRadius: last ? 16 : undefined,
        },
      ]}
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
            {formatDistanceToNow(new Date(item.createdAt * 1000), {
              addSuffix: true,
              locale: getDateFnsLocale(locale),
            })}
          </Text>
        ) : null}
      </View>
    </PressableOpacity>
  );
}

// Matches AnimeListItem: joined cards (only the list's first/last corners
// round), title-line and broadcast-line text styles.
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
