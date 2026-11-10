import { Image, ImageBackground } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { fbs } from "fbtee";
import React from "react";
import { View, StyleSheet, Text } from "react-native";

import { black, white80 } from "yep/colors";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { graphql, readFragment } from "yep/graphql/tada";
import type { FragmentOf } from "yep/graphql/tada";
import { SCREENSHOT_BLUR_RADIUS } from "yep/screenshotMode";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

export const MediaTrailerData = graphql(`
  fragment MediaTrailerData on MediaTrailer {
    id
    thumbnail
    site
  }
`);

type Props = {
  trailer: FragmentOf<typeof MediaTrailerData>;
};

function getVideoURL(site: string, id: string): string | undefined {
  switch (site) {
    case "youtube":
      return `https://www.youtube.com/watch?v=${id}`;
    case "dailymotion":
      return `https://www.dailymotion.com/video/${id}`;
  }
}

export function Trailer({ trailer }: Props) {
  const { id, site, thumbnail } = readFragment(MediaTrailerData, trailer);

  if (!id || !site || !thumbnail) return null;

  const videoURL = getVideoURL(site, id);

  if (!videoURL) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {String(fbs("Trailer", "Trailer section title"))}
      </Text>
      <PressableOpacity
        onPress={() => WebBrowser.openBrowserAsync(videoURL)}
        borderRadius={8}
      >
        <ImageBackground
          blurRadius={SCREENSHOT_BLUR_RADIUS}
          source={{ uri: thumbnail }}
          style={{
            width: "100%",
            borderRadius: 8,
            aspectRatio: 16 / 9,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={styles.playButtonContainer}>
            <Image
              source={require("yep/assets/icons/triangle-right.png")}
              style={styles.playIcon}
            />
          </View>
        </ImageBackground>
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 16,
    marginBottom: 8,
  },
  playButtonContainer: {
    alignItems: "center",
    backgroundColor: white80,
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  playIcon: {
    height: 32,
    tintColor: black,
    width: 32,
  },
});
