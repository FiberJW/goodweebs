import React from "react";
import { View, Image, StyleSheet } from "react-native";

import { useBreakpoints } from "yep/hooks/helpers";
import { websiteTheme } from "yep/themes";

const favicon = require("yep/assets/favicon.png");

const anilistIcon = require("./anilist.png");
const githubIcon = require("./github.png");
const goodweebsLogo1Line = require("./goodweebs-one-line.png");
const twitterIcon = require("./twitter.png");

export function Navbar() {
  const { isMobile } = useBreakpoints();

  return (
    <View style={styles.container}>
      <View style={styles.bounds}>
        {isMobile ? (
          <Image
            source={favicon}
            style={{ height: 40, width: 31.11, marginRight: 24 }}
          />
        ) : (
          <Image
            source={goodweebsLogo1Line}
            style={{ height: 40, width: 214.55, marginRight: 24 }}
          />
        )}
        <View style={styles.iconContainer}>
          <a href="https://github.com/fiberjw/goodweebs">
            <Image
              source={githubIcon}
              style={{ height: 24, width: 24, marginRight: 24 }}
            />
          </a>
          <a href="https://twitter.com/fiberjw">
            <Image
              source={twitterIcon}
              style={{ height: 24, width: 24, marginRight: 24 }}
            />
          </a>
          <a href="https://anilist.co/user/fiberjw">
            <Image source={anilistIcon} style={{ height: 24, width: 31.82 }} />
          </a>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bounds: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    maxWidth: 800,
    width: "100%",
  },
  container: {
    alignItems: "center",
    backgroundColor: websiteTheme.navBackground,
    justifyContent: "center",
    padding: 16,
    width: "100%",
  },
  iconContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
