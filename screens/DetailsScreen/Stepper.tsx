import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

import { StepperButton } from "./StepperButton";

type Props = {
  defaultValue: number;
  label: string;
  upperBound?: number;
  lowerBound: number;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
};

export function Stepper({
  defaultValue,
  upperBound,
  lowerBound,
  label,
  onChange,
  icon,
}: Props) {
  const [count, setCount] = useState(defaultValue);

  useEffect(
    function setCountWhenDefaultValueChanges() {
      setCount(defaultValue);
    },
    [defaultValue],
  );

  return (
    <View style={styles.stepperWithLabelContainer}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {icon}
        <Text style={styles.stepperLabel}>{label}</Text>
      </View>
      <View style={styles.stepperContainer}>
        <StepperButton
          type="decrement"
          disabled={count === lowerBound}
          onPress={() => {
            const newCount = count - 1;
            setCount(newCount);
            onChange(newCount);
          }}
        />
        <Text style={styles.stepperCount}>{count}</Text>
        <StepperButton
          type="increment"
          disabled={count === upperBound}
          onPress={() => {
            const newCount = count + 1;
            setCount(newCount);
            onChange(newCount);
          }}
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
    width: 48,
  },
});
