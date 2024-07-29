import React, { useState, useEffect } from "react";
import { View } from "react-native";

import { useDidMountEffect } from "yep/hooks/helpers";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

import { StepperButton } from "./StepperButton";

const StepperWithLabelContainer = takimoto.View({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  marginBottom: 16,
});

const StepperLabel = takimoto.Text({
  fontSize: 16,
  color: darkTheme.text,
  fontFamily: Manrope.semiBold,
  textAlign: "center",
});

const StepperContainer = takimoto.View({
  flexDirection: "row",
  alignItems: "center",
});

const StepperCount = takimoto.Text({
  fontSize: 16,
  color: darkTheme.text,
  fontFamily: Manrope.semiBold,
  textAlign: "center",
  width: 48,
});

interface Properties {
  defaultValue: number;
  label: string;
  upperBound?: number;
  lowerBound: number;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
}

export function Stepper({
  defaultValue,
  upperBound,
  lowerBound,
  label,
  onChange,
  icon,
}: Properties) {
  const [count, setCount] = useState(defaultValue);

  useDidMountEffect(
    function callOnlyChangeWhenCountChanges() {
      onChange(count);
    },
    [count]
  );

  useEffect(
    function setCountWhenDefaultValueChanges() {
      setCount(defaultValue);
    },
    [defaultValue]
  );

  return (
    <StepperWithLabelContainer>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {icon}
        <StepperLabel>{label}</StepperLabel>
      </View>
      <StepperContainer>
        <StepperButton
          type="decrement"
          disabled={count === lowerBound}
          onPress={() => {
            setCount((c) => c - 1);
          }}
        />
        <StepperCount>{count}</StepperCount>
        <StepperButton
          type="increment"
          disabled={count === upperBound}
          onPress={() => {
            setCount((c) => c + 1);
          }}
        />
      </StepperContainer>
    </StepperWithLabelContainer>
  );
}
