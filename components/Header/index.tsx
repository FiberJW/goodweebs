import Constants from "expo-constants";
import React from "react";
import { Platform, Animated, Easing } from "react-native";

import { white } from "yep/colors";

import { PressableOpacity } from "../PressableOpacity";

import { Container, Label, Spinner } from "./styles";

type Props = {
  label: string;
  refreshing?: boolean;
  statusBarPadding?: boolean;
  onSyncPress?: () => void;
};

export function Header({
  label,
  statusBarPadding = true,
  onSyncPress,
  refreshing,
}: Props) {
  const spinValue = new Animated.Value(0);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Container
      style={{
        paddingTop:
          Platform.OS === "ios" && statusBarPadding
            ? 16 + Constants.statusBarHeight
            : undefined,
      }}
    >
      <Label>{label}</Label>
      {refreshing ? <Spinner color={white} size="large" /> : null}
      {onSyncPress && !refreshing ? (
        <PressableOpacity
          onPress={() => {
            Animated.timing(spinValue, {
              toValue: 1,
              duration: 250,
              easing: Easing.linear,
              useNativeDriver: true, // To make use of native driver for performance
            }).start();
            onSyncPress();
          }}
        >
          <Animated.Image
            source={require("yep/assets/icons/sync.png")}
            style={{ transform: [{ rotate: spin }], height: 24, width: 24 }}
          />
        </PressableOpacity>
      ) : null}
    </Container>
  );
}
