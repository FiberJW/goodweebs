import React from "react";
import { ActivityIndicator, StyleSheet, Text, ViewStyle } from "react-native";

import { PressableOpacity } from "yep/components/PressableOpacity";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

type ButtonSize = "normal" | "large" | "small";

function getDynamicButtonStyles(size: ButtonSize): ViewStyle {
  switch (size) {
    case "large":
      return { padding: 24 };
    case "normal":
      return { padding: 16 };
    case "small":
      return { padding: 8 };
  }
}

type Props = {
  label: string;
  onPress: () => void;
  size?: ButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  loading?: boolean;
};

export function Button({
  onPress,
  label,
  loading,
  disabled,
  size = "normal",
  style,
  containerStyle,
}: Props) {
  const { padding } = getDynamicButtonStyles(size);

  return (
    <PressableOpacity
      disabled={disabled || loading}
      style={[styles.pressable, { padding }, style]}
      containerStyle={containerStyle}
      borderRadius={8}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={darkTheme.text} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  label: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 16,
    textAlign: "center",
  },
  pressable: {
    alignItems: "center",
    backgroundColor: darkTheme.button,
    justifyContent: "center",
    width: "100%",
  },
});
