import React from "react";

import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";

type Props = {
  label: string;
  onPress: () => void;
  isSelected?: boolean;
};

export function StatusChip({ label, onPress, isSelected }: Props) {
  return (
    <Container
      onPress={onPress}
      style={
        isSelected ? { backgroundColor: darkTheme.selectedChipFill } : undefined
      }
    >
      <Label style={isSelected ? { color: darkTheme.textInverted } : undefined}>
        {label}
      </Label>
    </Container>
  );
}

const Container = takimoto.TouchableOpacity({
  backgroundColor: "transparent",
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: darkTheme.chipBorder,
});

const Label = takimoto.Text({
  fontSize: 12.8,
  fontFamily: "Manrope-SemiBold",
  color: darkTheme.text,
});
