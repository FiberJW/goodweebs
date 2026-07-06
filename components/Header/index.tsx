import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

type Props = {
  label: string;
  rightSlot?: React.ReactNode;
};

export function Header({ label, rightSlot }: Props) {
  // Safe-area inset, not Constants.statusBarHeight — the constant is stale/0
  // under Android 15+ forced edge-to-edge.
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: 16 + insets.top,
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
