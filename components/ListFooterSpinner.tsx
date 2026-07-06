import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

import { darkTheme } from "yep/themes";

export function ListFooterSpinner() {
  return (
    <ActivityIndicator color={darkTheme.text} style={styles.footerSpinner} />
  );
}

const styles = StyleSheet.create({
  footerSpinner: {
    paddingVertical: 16,
  },
});
