import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { getDateFnsLocale, useGetTitle } from "yep/utils";

import { getNotificationText } from "./notificationText";

export type NotificationRowData = {
  id: number;
  __typename?: string;
  createdAt?: number | null;
  episode?: number | null;
  contexts?: (string | null)[] | null;
  context?: string | null;
  media: {
    id: number;
    title?: {
      romaji?: string | null;
      native?: string | null;
      english?: string | null;
    } | null;
    coverImage?: { medium?: string | null; large?: string | null } | null;
  };
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

  return (
    <PressableOpacity
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
          {getNotificationText(item, getTitle(item.media.title) ?? "")}
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
