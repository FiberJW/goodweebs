import React from "react";
import { FlatList, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { PressableOpacity } from "yep/components/PressableOpacity";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

type ChipItem = {
  key: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

function Chip({
  label,
  onPress,
  isSelected,
}: {
  label: string;
  onPress: () => void;
  isSelected: boolean;
}) {
  return (
    <PressableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      disabled={isSelected}
      useDisabledOpacity={false}
      style={[styles.container, isSelected && styles.selected]}
      borderRadius={16}
    >
      <Text style={[styles.label, isSelected && styles.selectedLabel]}>
        {label}
      </Text>
    </PressableOpacity>
  );
}

function renderChip({ item }: { item: ChipItem }) {
  return (
    <Chip
      label={item.label}
      isSelected={item.isSelected}
      onPress={item.onPress}
    />
  );
}

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  style?: ViewStyle;
}) {
  const chips = options.map((option) => ({
    key: option.value,
    label: option.label,
    isSelected: option.value === value,
    onPress: () => onChange(option.value),
  }));

  return (
    <View style={style}>
      <FlatList
        horizontal
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        data={chips}
        renderItem={renderChip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkTheme.button,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selected: {
    backgroundColor: darkTheme.selectedChipFill,
    borderColor: darkTheme.text,
  },
  label: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 12.8,
  },
  selectedLabel: { color: darkTheme.textInverted },

  content: { gap: 8 },
});
