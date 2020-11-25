import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet } from "react-native";

import { PressableOpacity } from "yep/components/PressableOpacity";
import { AnimeFragmentFragment } from "yep/graphql/generated";
import { RootStackParamList } from "yep/navigation";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

export function DiscoverPoster({
  item,
  navigation,
  index,
  posterHeight,
  posterWidth,
}: {
  item: AnimeFragmentFragment;
  index: number;
  posterHeight: number;
  posterWidth: number;
  navigation: StackNavigationProp<RootStackParamList>;
}) {
  return (
    <PressableOpacity
      onPress={() => navigation.navigate("Details", { id: item.id })}
      style={[
        styles.posterContainer,
        (index + 1) % 3 !== 0 ? { marginRight: 16 } : undefined,
      ]}
    >
      <Poster
        resizeMode="cover"
        source={{
          uri: item.coverImage?.large ?? item.coverImage?.medium ?? "",
        }}
        style={{
          height: posterHeight,
          width: posterWidth,
        }}
      />
      <PosterTitle
        numberOfLines={2}
        style={{
          maxWidth: posterWidth,
        }}
      >
        {item.title?.english || item.title?.romaji || item.title?.native}
      </PosterTitle>
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  posterContainer: {
    alignItems: "center",
  },
});

const Poster = takimoto.Image({
  borderRadius: 4,
  overflow: "hidden",
  marginBottom: 8,
  backgroundColor: darkTheme.listItemBackground,
});

const PosterTitle = takimoto.Text({
  fontFamily: Manrope.regular,
  fontSize: 12.8,
  textAlign: "center",
  color: darkTheme.text,
});
