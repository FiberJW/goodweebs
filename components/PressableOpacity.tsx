import React, { PropsWithChildren } from "react";
import { PressableProps, Pressable, Platform, View } from "react-native";

import { white } from "yep/colors";

type Props = PressableProps & {
  activeOpacity?: number;
  borderRadius?: number;
};

export function PressableOpacity({
  activeOpacity,
  borderRadius,
  style,
  ...rest
}: Props) {
  return (
    <BorderRadiusContainer borderRadius={borderRadius}>
      <Pressable
        style={({ pressed }) => {
          const pressedStyles =
            typeof style === "function" ? style({ pressed }) : style;

          const pressedOpacity =
            Platform.OS !== "android" ? activeOpacity ?? 0.2 : 1;

          if (Array.isArray(pressedStyles)) {
            return [
              { opacity: pressed ? pressedOpacity : 1, borderRadius },
              ...pressedStyles,
            ];
          }
          return [
            { opacity: pressed ? pressedOpacity : 1, borderRadius },
            pressedStyles,
          ];
        }}
        android_ripple={{ color: white, borderless: false }}
        {...rest}
      />
    </BorderRadiusContainer>
  );
}

type BorderRadiusContainerProps = PropsWithChildren<{
  borderRadius?: number;
}>;

function BorderRadiusContainer({
  borderRadius,
  children,
}: BorderRadiusContainerProps) {
  if (!borderRadius) return <>{children}</>;

  return <View style={{ borderRadius, overflow: "hidden" }}>{children}</View>;
}
