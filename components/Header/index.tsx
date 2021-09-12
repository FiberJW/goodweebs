import Constants from "expo-constants";
import React from "react";
import {
  Platform,
  Animated,
  Easing,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from "react-native";

import { white } from "yep/colors";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

import { PressableOpacity } from "../PressableOpacity";

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
    <View
      style={[
        styles.container,
        {
          paddingTop:
            Platform.OS === "ios" && statusBarPadding
              ? 16 + Constants.statusBarHeight
              : undefined,
        },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      {refreshing ? (
        <ActivityIndicator style={styles.spinner} color={white} size="large" />
      ) : null}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: darkTheme.navBackground,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    width: "100%",
  },
  label: {
    color: darkTheme.text,
    fontFamily: Manrope.extraBold,
    fontSize: 25,
  },
  spinner: {
    height: 24,
    width: 24,
  },
});
