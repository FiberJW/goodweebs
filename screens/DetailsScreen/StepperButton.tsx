import { Image } from "expo-image";
import React from "react";
import { StyleSheet } from "react-native";

import { PressableOpacity } from "yep/components/PressableOpacity";
import { darkTheme } from "yep/themes";

type Props = {
  onPress: () => void;
  disabled?: boolean;
  type: "increment" | "decrement";
};

export function StepperButton({ onPress, type, disabled }: Props) {
  return (
    <PressableOpacity
      disabled={disabled}
      onPress={onPress}
      style={styles.container}
      borderRadius={32}
    >
      <Image
        style={styles.stepperButtonIcon}
        source={
          type === "increment"
            ? require("yep/assets/icons/progress-increment.png")
            : require("yep/assets/icons/progress-decrement.png")
        }
      />
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkTheme.button,
    padding: 16,
  },
  stepperButtonIcon: {
    height: 16,
    width: 16,
    tintColor: darkTheme.text,
  },
});
