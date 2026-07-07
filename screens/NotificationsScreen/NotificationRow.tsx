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

export function NotificationRow({ item }: { item: NotificationRowData }) {
  const router = useRouter();
  const getTitle = useGetTitle();
  const { locale } = useLocaleContext();

  return (
    <PressableOpacity
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

const styles = StyleSheet.create({
  row: {
    backgroundColor: darkTheme.listItemBackground,
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  text: {
    color: darkTheme.text,
    fontFamily: Manrope.regular,
    fontSize: 14.4,
  },
  // Stretches to the poster's height: notification text pinned to the top,
  // timestamp to the bottom (design: space-between).
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
