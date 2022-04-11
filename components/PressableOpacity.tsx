import React, { PropsWithChildren } from "react";
import {
  PressableProps,
  Pressable,
  Platform,
  View,
  ViewStyle,
} from "react-native";

import { white } from "yep/colors";

type Props = PressableProps & {
  activeOpacity?: number;
  borderRadius?: number;
  containerStyle?: ViewStyle;
};

export function PressableOpacity({
  activeOpacity,
  borderRadius,
  style,
  disabled,
  containerStyle,
  ...rest
}: Props) {
  return (
    <BorderRadiusContainer borderRadius={borderRadius} style={containerStyle}>
      <Pressable
        style={({ pressed }) => {
          const pressedStyles =
            typeof style === "function" ? style({ pressed }) : style;

          const pressedOpacity =
            Platform.OS !== "android" ? activeOpacity ?? 0.2 : 1;

          const nativeStyle = {
            opacity: pressed ? pressedOpacity : 1,
            borderRadius,
            ...(disabled && { opacity: 0.4 }),
          };

          if (Array.isArray(pressedStyles)) {
            return [nativeStyle, ...pressedStyles];
          }
          return [nativeStyle, pressedStyles];
        }}
        disabled={disabled}
        android_ripple={{ color: white, borderless: false }}
        {...rest}
      />
    </BorderRadiusContainer>
  );
}

type BorderRadiusContainerProps = PropsWithChildren<{
  borderRadius?: number;
  style?: ViewStyle;
}>;

function BorderRadiusContainer({
  borderRadius,
  style,
  children,
}: BorderRadiusContainerProps) {
  if (!borderRadius) return <>{children}</>;

  return (
    <View style={[{ borderRadius, overflow: "hidden" }, style]}>
      {children}
    </View>
  );
}
