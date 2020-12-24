import React from "react";
import { ImageSourcePropType, StyleSheet, Image } from "react-native";

import { darkTheme } from "yep/themes";

import { PressableOpacity } from "../PressableOpacity";

type ProgressButtonProps = {
  onPress: () => void;
  icon: ImageSourcePropType;
  disabled?: boolean;
};

export function ProgressButton({
  onPress,
  icon,
  disabled,
}: ProgressButtonProps) {
  return (
    <PressableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, disabled ? { opacity: 0.4 } : undefined]}
      borderRadius={8}
    >
      <Image style={styles.icon} source={icon} />
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: darkTheme.button,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  icon: {
    height: 16,
    width: 16,
  },
});
