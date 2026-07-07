import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

import { StepperButton } from "./StepperButton";

type Props = {
  value: number;
  label: string;
  upperBound?: number;
  lowerBound: number;
  onIncrement: () => void;
  onDecrement: () => void;
  icon?: React.ReactNode;
  formatValue?: (value: number) => string;
};

export function Stepper({
  value,
  upperBound,
  lowerBound,
  label,
  onIncrement,
  onDecrement,
  icon,
  formatValue,
}: Props) {
  return (
    <View style={styles.stepperWithLabelContainer}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {icon}
        <Text style={styles.stepperLabel}>{label}</Text>
      </View>
      <View style={styles.stepperContainer}>
        <StepperButton
          type="decrement"
          disabled={value === lowerBound}
          onPress={onDecrement}
        />
        <Text style={styles.stepperCount}>
          {formatValue ? formatValue(value) : value}
        </Text>
        <StepperButton
          type="increment"
          disabled={value === upperBound}
          onPress={onIncrement}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepperWithLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  stepperLabel: {
    fontSize: 16,
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    textAlign: "center",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepperCount: {
    fontSize: 16,
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    textAlign: "center",
    // minWidth (not width): "8.5/10" and "100/100 ★" need room to grow.
    minWidth: 72,
    paddingHorizontal: 4,
  },
});
