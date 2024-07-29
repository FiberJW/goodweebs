import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet } from "react-native";

import { favoritedBackground, notFavoritedBackground, white } from "yep/colors";

import { PressableOpacity } from "../PressableOpacity";

const likedIcon = require("yep/assets/icons/favorite-24.png");
const notLikedIcon = require("yep/assets/icons/favorite-border-24.png");

interface Properties {
  isLiked: boolean;
  onPress: () => Promise<void>;
}

export function LikeButton({ isLiked, onPress }: Properties) {
  const [loading, setLoading] = useState(false);

  async function handleOnPress() {
    setLoading(true);
    await onPress();
  }

  useEffect(
    function setLoadingToFalseAfterIsLikedChanges() {
      setLoading(false);
    },
    [isLiked]
  );

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
