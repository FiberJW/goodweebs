import { Image, ImageProps } from "expo-image";
import React from "react";
import { StyleSheet } from "react-native";

import { PressableOpacity } from "yep/components/PressableOpacity";
import { darkTheme } from "yep/themes";

type ProgressButtonProps = {
  onPress: () => void;
  icon: ImageProps["source"];
  disabled?: boolean;
  accessibilityLabel: string;
};

export function ProgressButton({
  onPress,
  icon,
  disabled,
  accessibilityLabel,
}: ProgressButtonProps) {
  return (
    <PressableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      // Visual height is 32pt; pad the touch target to the 44pt minimum.
      hitSlop={{ top: 6, bottom: 6 }}
      style={styles.container}
      borderRadius={100}
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  icon: {
    height: 16,
    width: 16,
  },
});
