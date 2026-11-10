import React from "react";
import { View, Text, StyleSheet } from "react-native";

import type { EntryCounter } from "yep/graphql/mediaListEntry";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

import { StepperButton } from "./StepperButton";

type Props = {
  label: string;
  counter: EntryCounter;
  icon?: React.ReactNode;
  formatValue?: (value: number) => string;
};

export function Stepper({ label, counter, icon, formatValue }: Props) {
  return (
    <View style={styles.stepperWithLabelContainer}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {icon}
        <Text style={styles.stepperLabel}>{label}</Text>
      </View>
      <View style={styles.stepperContainer}>
        <StepperButton
          type="decrement"
          disabled={!counter.canDecrement}
          onPress={counter.decrement}
        />
        <Text style={styles.stepperCount}>
          {formatValue ? formatValue(counter.value) : counter.value}
        </Text>
        <StepperButton
          type="increment"
          disabled={!counter.canIncrement}
          onPress={counter.increment}
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
    minWidth: 72,
    paddingHorizontal: 4,
  },
});
