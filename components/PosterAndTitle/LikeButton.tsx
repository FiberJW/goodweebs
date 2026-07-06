import { Image } from "expo-image";
import { fbs } from "fbtee";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

import { favoritedBackground, notFavoritedBackground, white } from "yep/colors";

import { PressableOpacity } from "../PressableOpacity";

const likedIcon = require("yep/assets/icons/favorite-24.png");
const notLikedIcon = require("yep/assets/icons/favorite-border-24.png");

type Props = {
  isLiked: boolean;
  onPress: () => Promise<void>;
};

export function LikeButton({ isLiked, onPress }: Props) {
  const [loadingForLiked, setLoadingForLiked] = useState<boolean | null>(null);
  const loading = loadingForLiked === isLiked;

  async function handleOnPress() {
    setLoadingForLiked(isLiked);
    await onPress().finally(() => {
      setLoadingForLiked(null);
    });
  }

  return (
    <PressableOpacity
      borderRadius={8}
      accessibilityRole="button"
      accessibilityLabel={String(
        isLiked
          ? fbs("Remove from favorites", "Unfavorite button accessibility label")
          : fbs("Add to favorites", "Favorite button accessibility label"),
      )}
      style={[
        styles.pressable,
        {
          backgroundColor: isLiked
            ? favoritedBackground
            : notFavoritedBackground,
        },
      ]}
      onPress={handleOnPress}
      activeOpacity={1}
    >
      {loading ? (
        <ActivityIndicator size="small" color={white} />
      ) : (
        <Image
          source={isLiked ? likedIcon : notLikedIcon}
          style={styles.icon}
        />
      )}
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  icon: { height: 24, width: 24 },
  pressable: {
    alignItems: "center",
    backgroundColor: favoritedBackground,
    height: 48,
    justifyContent: "center",
    padding: 16,
    width: 48,
  },
});
