import Constants from "expo-constants";
import React from "react";
import { StyleSheet, View, Text } from "react-native";

import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

interface Properties {
  label: string;
  rightSlot?: React.ReactNode;
}

export function Header({ label, rightSlot }: Properties) {
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: 16 + Constants.statusBarHeight,
        },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      {rightSlot}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: darkTheme.navBackground,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    width: "100%",
  },
  label: {
    color: darkTheme.text,
    fontFamily: Manrope.extraBold,
    fontSize: 25,
  },
});
