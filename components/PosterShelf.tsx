import type { Href } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, type ViewStyle } from "react-native";

import { PosterAndTitle } from "yep/components/PosterAndTitle";

type ShelfPoster = {
  id: number;
  uri: string;
  title: string | undefined;
  href: Href;
  size: "large" | "profile";
};

function keyExtractor(poster: ShelfPoster) {
  return `${poster.id}`;
}

function renderPoster({ item }: { item: ShelfPoster }) {
  return (
    <PosterAndTitle
      size={item.size}
      uri={item.uri}
      title={item.title}
      href={item.href}
    />
  );
}

export function PosterShelf({
  posters,
  style,
}: {
  posters: readonly ShelfPoster[];
  style?: ViewStyle;
}) {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={styles.content}
      keyExtractor={keyExtractor}
      data={posters}
      renderItem={renderPoster}
    />
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "flex-start", gap: 8 },
});
