import React from "react";
import {
  ActivityIndicator,
  ColorValue,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { PressableOpacity } from "yep/components/PressableOpacity";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

type Props = {
  label: string;
  onPress: () => void;
  size?: "normal" | "small";
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  loading?: boolean;
  color?: ColorValue;
  labelColor?: ColorValue;
};

export function Button({
  onPress,
  label,
  loading,
  size = "normal",
  style,
  containerStyle,
  color,
  labelColor,
}: Props) {
  const padding = size === "small" ? 8 : 16;

  return (
    <PressableOpacity
      accessibilityRole="button"
      accessibilityState={{
        busy: Boolean(loading),
        disabled: Boolean(loading),
      }}
      disabled={loading}
      style={[
        styles.pressable,
        {
          padding,
          ...(color && { backgroundColor: color }),
        },
        style,
      ]}
      containerStyle={containerStyle}
      borderRadius={100}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={labelColor ?? darkTheme.text} />
      ) : (
        <Text style={[styles.label, labelColor ? { color: labelColor } : null]}>
          {label}
        </Text>
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
