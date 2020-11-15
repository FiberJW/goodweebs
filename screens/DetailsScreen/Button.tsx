import React from "react";
import { StyleSheet, ActivityIndicator } from "react-native";

import { white15 } from "yep/colors";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

const ButtonLabel = takimoto.Text({
  fontSize: 16,
  color: darkTheme.text,
  fontFamily: Manrope.semiBold,
  textAlign: "center",
});

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function Button({ label, onPress, disabled, loading }: Props) {
  return (
    <PressableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      borderRadius={8}
      style={styles.container}
      containerStyle={{ flex: 1 }}
    >
      {loading ? (
        <ActivityIndicator color={darkTheme.text} />
      ) : (
        <ButtonLabel>{label}</ButtonLabel>
      )}
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: white15,
    flex: 1,
    justifyContent: "center",
    padding: 8,
  },
});
