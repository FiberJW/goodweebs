import React from "react";
import { StyleSheet } from "react-native";

import { PressableOpacity } from "yep/components/PressableOpacity";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

const ButtonLabel = takimoto.Text({
  fontFamily: Manrope.semiBold,
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
    <PressableOpacity
      style={styles.container}
      borderRadius={8}
      onPress={onPress}
    >
      <ButtonLabel>{label}</ButtonLabel>
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: darkTheme.secondaryButton,
    justifyContent: "center",
    padding: 16,
    width: "100%",
  },
});
