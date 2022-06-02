import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

import { useBreakpoints } from "yep/hooks/helpers";
import { websiteTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

const favicon = require("yep/assets/favicon.png");

const linkInlineStyle = { textDecoration: "none" };

export function Footer() {
  const { isMobile } = useBreakpoints();
  return (
    <View style={[styles.background, { height: isMobile ? 80 : 128 }]}>
      <View style={styles.container}>
        <a href="https://github.com/fiberjw/goodweebs" style={linkInlineStyle}>
          <Text style={[styles.link, { marginRight: 24 }]}>Source ?</Text>
        </a>
        <Image source={favicon} style={styles.favicon} />
        <a href="https://anilist.co/terms" style={linkInlineStyle}>
          <Text style={[styles.link, { marginLeft: 24 }]}>Policy</Text>
        </a>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    alignItems: "center",
    backgroundColor: websiteTheme.navBackground,
    justifyContent: "center",
    width: "100%",
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    maxWidth: 800,
    width: "100%",
  },
  favicon: { height: 40, width: 31.11 },
  link: {
    color: websiteTheme.text,
    fontFamily: Manrope.medium,
    fontSize: 16,
  },
});
