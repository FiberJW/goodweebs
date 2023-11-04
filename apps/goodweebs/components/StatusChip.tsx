import React from "react";
import { StyleSheet, Text } from "react-native";

import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

import { PressableOpacity } from "./PressableOpacity";

type Props = {
  label: string;
  onPress: () => void;
  isSelected?: boolean;
};

export function StatusChip({ label, onPress, isSelected }: Props) {
  return (
    <PressableOpacity
      onPress={onPress}
      style={[
        styles.container,
        isSelected
          ? {
              backgroundColor: darkTheme.selectedChipFill,
              borderColor: darkTheme.text,
            }
          : undefined,
      ]}
      borderRadius={16}
    >
      <Text
        style={[
          styles.label,
          isSelected ? { color: darkTheme.textInverted } : undefined,
        ]}
      >
        {label}
      </Text>
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkTheme.button,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 12.8,
  },
});
