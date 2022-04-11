import React, { ReactNode } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  ViewStyle,
  ImageBackground,
  Text,
  View,
} from "react-native";

import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

type Props = {
  size: "small" | "tiny" | "large" | "profile" | "details";
  uri: string;
  title?: string;
  style?: ViewStyle;
  children?: ReactNode;
};

export function PosterAndTitle({ size, uri, title, style, children }: Props) {
  const { width: windowWidth } = useWindowDimensions();

  let posterWidth: number;
  switch (size) {
    case "large":
      posterWidth = (windowWidth - 16 * 4) / 3;
      break;
    case "details":
      posterWidth = 128;
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
    <View style={[styles.container, style]}>
      <ImageBackground
        resizeMode="cover"
        style={[styles.poster, { width: posterWidth, height: posterHeight }]}
        source={{ uri }}
      >
        {children}
      </ImageBackground>
      {title ? (
        <Text
          numberOfLines={2}
          style={[
            styles.title,
            {
              maxWidth: posterWidth,
            },
          ]}
        >
          {title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  poster: {
    backgroundColor: darkTheme.listItemBackground,
    borderRadius: 8,
    overflow: "hidden",
  },
  title: {
    color: darkTheme.text,
    fontFamily: Manrope.regular,
    fontSize: 12.8,
    marginTop: 8,
    textAlign: "center",
  },
});
