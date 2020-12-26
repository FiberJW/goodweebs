import React from "react";
import {
  Linking,
  Image,
  useWindowDimensions,
  View,
  StyleSheet,
  Text,
  ImageBackground,
} from "react-native";

import { black } from "yep/colors";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { MediaTrailerDataFragment } from "yep/graphql/generated";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

type Props = {
  trailer: MediaTrailerDataFragment;
};

function getVideoURL(site: string, id: string): string | undefined {
  switch (site) {
    case "youtube":
      return `https://www.youtube.com/watch?v=${id}`;
    case "dailymotion":
      return `https://www.dailymotion.com/video/${id}`;
  }
}

export function Trailer({ trailer: { id, site, thumbnail } }: Props) {
  const { width: windowWidth } = useWindowDimensions();

  const width = windowWidth - 32;
  const height = (windowWidth - 32) / (16 / 9);

  if (!id || !site || !thumbnail) return null;

  const videoURL = getVideoURL(site, id);

  if (!videoURL) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Trailer</Text>
      <PressableOpacity
        onPress={() => Linking.openURL(videoURL)}
        borderRadius={8}
      >
        <ImageBackground
          source={{ uri: thumbnail }}
          style={{
            width,
            borderRadius: 8,
            height,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("yep/assets/icons/trailer-icon.png")}
            style={styles.playIcon}
          />
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
  playIcon: {
    height: 32,
    tintColor: black,
    width: 32,
  },
});
