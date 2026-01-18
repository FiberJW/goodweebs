import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  StyleSheet,
  ViewProps,
  TextProps,
  ImageProps,
  ScrollViewProps,
  FlatListProps,
} from "react-native";

import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

export function OuterContainer({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.outerContainer, style]} />;
}

export function InnerContainer({
  style,
  contentContainerStyle,
  ...props
}: ScrollViewProps) {
  return (
    <ScrollView
      {...props}
      style={[styles.innerContainer, style]}
      contentContainerStyle={[
        styles.innerContainerContent,
        contentContainerStyle,
      ]}
    />
  );
}

export function UserInfoAndStatsContainer({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.userInfoAndStatsContainer, style]} />;
}

export function Avatar({ style, ...props }: ImageProps) {
  return <Image {...props} style={[styles.avatar, style]} />;
}

export function UserInfoRow({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.userInfoRow, style]} />;
}

export function Username({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.username, style]} />;
}

export function StatsRow({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.statsRow, style]} />;
}

type StatProps = { label: string; value: number };

export function Stat({ label, value }: StatProps) {
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

export function ListHeader({ style, ...props }: TextProps) {
  return <Text {...props} style={[styles.listHeader, style]} />;
}

export function makeListWithType<T>() {
  return function StyledFlatList({
    style,
    contentContainerStyle,
    ...props
  }: FlatListProps<T>) {
    return (
      <FlatList
        {...props}
        style={style}
        contentContainerStyle={[
          styles.listContentContainer,
          contentContainerStyle,
        ]}
      />
    );
  };
}

export function FavoriteContainer({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.favoriteContainer, style]} />;
}

export function Person({ style, ...props }: ImageProps) {
  return <Image {...props} style={[styles.person, style]} />;
}

export function EverythingButTheCTA({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.everythingButTheCTA, style]} />;
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  innerContainer: {},
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
  person: {
    height: 128,
    width: 128,
    borderRadius: 64,
    overflow: "hidden",
    backgroundColor: darkTheme.listItemBackground,
  },
  everythingButTheCTA: {
    flex: 1,
    gap: 16,
  },
});
