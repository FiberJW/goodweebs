import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

import { useBreakpoints } from "yep/hooks/helpers";
import { websiteTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

const appStore = require("./app-store-button.png");
const playStore = require("./play-store-button.png");
const screenshotSource = require("./screenshot.png");

export function DownloadSection() {
  const { isMobile } = useBreakpoints();

  return (
    <View style={styles.container}>
      <View style={[styles.leftSection, isMobile ? { margin: 24 } : null]}>
        <View>
          <Text
            style={[styles.titleFirstLine, isMobile ? { fontSize: 24 } : null]}
          >
            Be a good weeb.
          </Text>
          <Text
            style={[styles.titleSecondLine, isMobile ? { fontSize: 24 } : null]}
          >
            Download this app.
          </Text>
          <Text
            style={[styles.description, isMobile ? { fontSize: 16 } : null]}
          >
            Keep up with anime on the go with Goodweebs, a cross-platform anime
            tracker built on top of AniList.co.
          </Text>
        </View>
        <View style={styles.downloadButtonsRow}>
          <a href="TODO: add link">
            <Image style={styles.appStoreButtonImage} source={appStore} />
          </a>
          <a href="TODO: add link">
            <Image style={styles.playStoreButtonImage} source={playStore} />
          </a>
        </View>
      </View>
      <Image
        source={screenshotSource}
        style={[styles.screenshot, isMobile ? { display: "none" } : null]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  appStoreButtonImage: {
    height: 56,
    marginBottom: 16,
    marginRight: 16,
    width: 167.53,
  },
  container: {
    backgroundColor: websiteTheme.downloadSectionBackground,
    borderRadius: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    maxWidth: 800,
    width: "100%",
  },
  description: {
    color: websiteTheme.subText,
    fontFamily: Manrope.light,
    fontSize: 16,
    marginBottom: 16,
    maxWidth: "35ch",
  },
  downloadButton: {},
  downloadButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: -16,
    marginRight: -24,
  },
  leftSection: {
    flex: 1,
    justifyContent: "space-between",
    margin: 40,
  },
  playStoreButtonImage: {
    height: 56,
    marginBottom: 16,
    marginRight: 16,
    width: 188,
  },
  screenshot: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 360,
    marginRight: 40,
    marginTop: 40,
    width: 256,
  },
  titleFirstLine: {
    color: websiteTheme.text,
    fontFamily: Manrope.regular,
    fontSize: 32,
  },
  titleSecondLine: {
    color: websiteTheme.text,
    fontFamily: Manrope.bold,
    fontSize: 32,
    marginBottom: 8,
  },
});
