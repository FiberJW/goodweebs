import React from "react";
import { Image, StyleSheet } from "react-native";

import {
  favoritedBackground,
  notFavoritedBackground,
  white40,
} from "yep/colors";

import { PressableOpacity } from "../PressableOpacity";

const likedIcon = require("yep/assets/icons/favorite-24.png");
const notLikedIcon = require("yep/assets/icons/favorite-border-24.png");

type Props = {
  isLiked: boolean;
  onPress: () => void;
};

export function LikeButton({ isLiked, onPress }: Props) {
  return (
    <PressableOpacity
      borderRadius={8}
      style={[
        styles.pressable,
        {
          backgroundColor: isLiked
            ? favoritedBackground
            : notFavoritedBackground,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={isLiked ? likedIcon : notLikedIcon} style={styles.icon} />
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  icon: { height: 24, width: 24 },
  pressable: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    padding: 16,
    width: 48,
  },
});
