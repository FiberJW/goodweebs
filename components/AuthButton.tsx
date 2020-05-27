import React from "react";

import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";

const ButtonTouchable = takimoto.TouchableOpacity({
  backgroundColor: darkTheme.secondaryButton,
  padding: 16,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
});

const ButtonLabel = takimoto.Text({
  fontFamily: "Manrope-SemiBold",
  fontSize: 16,
  color: darkTheme.text,
  textAlign: "center",
});

type AuthButtonProps = {
  label: string;
  onPress: () => void;
};

export function AuthButton({ onPress, label }: AuthButtonProps) {
  return (
    <ButtonTouchable onPress={onPress}>
      <ButtonLabel>{label}</ButtonLabel>
    </ButtonTouchable>
  );
}
