import { Checkbox } from "expo-checkbox";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { black } from "yep/colors";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

import { PressableOpacity } from "./PressableOpacity";

type Props = {
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
};

export function CheckboxRow({ label, onValueChange, value }: Props) {
  return (
    <View style={styles.row}>
      <Checkbox
        color={value ? black : undefined}
        onValueChange={onValueChange}
        style={styles.checkbox}
        value={value}
      />
      <PressableOpacity
        onPress={() => onValueChange(!value)}
        style={styles.textPressable}
      >
        <Text style={styles.text}>{label}</Text>
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    backgroundColor: black,
    borderColor: darkTheme.subHeader,
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
    color: darkTheme.subText,
    fontFamily: Manrope.regular,
    fontSize: 16,
  },
  textPressable: {
    flex: 1,
  },
});
