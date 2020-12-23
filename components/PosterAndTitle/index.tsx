import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";

import { PressableOpacity } from "../PressableOpacity";

import { Title, Image } from "./styles";

type Props = {
  size: "small" | "tiny" | "large" | "profile";
  uri: string;
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function PosterAndTitle({ size, uri, title, onPress, disabled }: Props) {
  const { width: windowWidth } = useWindowDimensions();

  let posterWidth: number;
  switch (size) {
    case "large":
      posterWidth = (windowWidth - 16 * 4) / 3;
      break;
    case "profile":
      posterWidth = 89.6;
      break;
    case "small":
      posterWidth = 56;
      break;
    case "tiny":
      posterWidth = 48;
      break;
  }

  const posterHeight = Math.round(posterWidth * 1.4285714286);

  return (
    <PressableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
    >
      <Image
        resizeMode="cover"
        style={{ width: posterWidth, height: posterHeight }}
        source={{ uri }}
      />
      {title ? (
        <Title
          numberOfLines={2}
          style={{
            maxWidth: posterWidth,
          }}
        >
          {title}
        </Title>
      ) : null}
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
});
