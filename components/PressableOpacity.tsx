import React, { PropsWithChildren, useState } from "react";
import {
  PressableProps,
  Pressable,
  Platform,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  cubicBezier,
  useReducedMotion,
} from "react-native-reanimated";

import { white } from "yep/colors";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  activeOpacity?: number;
  borderRadius?: number;
  containerStyle?: ViewStyle;
  useDisabledOpacity?: boolean;
};

export function PressableOpacity({
  activeOpacity,
  borderRadius,
  style,
  disabled,
  containerStyle,
  useDisabledOpacity = true,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const [pressed, setPressed] = useState(false);
  const reducedMotion = useReducedMotion();
  // `disabled` blocks onPress but NOT the pressed state, so a disabled
  // control would still react to touch without the guard.
  const showPressed = pressed && !disabled;
  const callerStyles = typeof style === "function" ? style({ pressed }) : style;

  // Reduced motion swaps the press scale for a dim (a ripple on Android),
  // which still confirms the touch without moving anything. The ripple stays
  // off otherwise: its drawable keeps the unscaled bounds.
  const pressedOpacity =
    reducedMotion && Platform.OS !== "android" ? (activeOpacity ?? 0.7) : 1;

  return (
    <BorderRadiusContainer borderRadius={borderRadius} style={containerStyle}>
      <AnimatedPressable
        style={[
          {
            borderRadius,
            opacity: showPressed ? pressedOpacity : 1,
            transform: [{ scale: showPressed && !reducedMotion ? 0.97 : 1 }],
            transitionProperty: ["transform", "opacity"],
            transitionDuration: 120,
            transitionTimingFunction: cubicBezier(0.23, 1, 0.32, 1),
            ...(disabled && useDisabledOpacity && { opacity: 0.4 }),
          },
          callerStyles,
        ]}
        disabled={disabled}
        onPressIn={(event) => {
          setPressed(true);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          setPressed(false);
          onPressOut?.(event);
        }}
        pressRetentionOffset={16}
        android_ripple={
          reducedMotion && !disabled
            ? { color: white, borderless: false }
            : undefined
        }
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
