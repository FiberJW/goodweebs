import { Checkbox } from "expo-checkbox";
import React from "react";
import { ColorValue, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

import { black } from "yep/colors";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

import { PressableOpacity } from "./PressableOpacity";

type Props = {
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
  checkboxCheckedColor?: ColorValue;
  checkboxBackgroundColor?: ColorValue;
  checkboxBorderColor?: ColorValue;
  checkboxStyle?: ViewStyle;
  labelColor?: ColorValue;
  labelStyle?: TextStyle;
  pressableStyle?: ViewStyle;
  style?: ViewStyle;
};

export function CheckboxRow({
  label,
  onValueChange,
  value,
  checkboxCheckedColor = black,
  checkboxBackgroundColor = black,
  checkboxBorderColor = darkTheme.subHeader,
  checkboxStyle,
  labelColor = darkTheme.subText,
  labelStyle,
  pressableStyle,
  style,
}: Props) {
  return (
    <View style={[styles.row, style]}>
      <Checkbox
        color={value ? checkboxCheckedColor : undefined}
        onValueChange={onValueChange}
        style={[
          styles.checkbox,
          {
            backgroundColor: checkboxBackgroundColor,
            borderColor: checkboxBorderColor,
          },
          checkboxStyle,
        ]}
        value={value}
      />
      <PressableOpacity
        onPress={() => {
          onValueChange(!value);
        }}
        style={[styles.textPressable, pressableStyle]}
      >
        <Text style={[styles.text, { color: labelColor }, labelStyle]}>{label}</Text>
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    height: 24,
    width: 24,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  text: {
    fontFamily: Manrope.regular,
    fontSize: 16,
  },
  textPressable: {
    flex: 1,
  },
});
