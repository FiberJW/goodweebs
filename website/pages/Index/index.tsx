import React from "react";
import { StyleSheet, View } from "react-native";

import { websiteTheme } from "yep/themes";

import { DownloadSection } from "./DownloadSection";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function Index() {
  return (
    <View style={styles.root}>
      <Navbar />
      <View style={styles.innerContainer}>
        <DownloadSection />
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    alignItems: "center",
    backgroundColor: websiteTheme.pageBackground,
    flex: 1,
    justifyContent: "center",
    padding: 16,
    width: "100%",
  },
  root: { flex: 1, minHeight: "100vh" },
});
