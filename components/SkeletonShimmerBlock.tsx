import React, { useEffect, useState } from "react";
import {
  DimensionValue,
  LayoutChangeEvent,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { darkTheme } from "yep/themes";

const SHIMMER_DURATION_MS = 1400;
const SHIMMER_STRIP_WIDTH = 64;

type Props = {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function SkeletonShimmerBlock({
  width,
  height,
  borderRadius = 8,
  style,
}: Props) {
  const animationProgress = useSharedValue(0);
  const [measuredWidth, setMeasuredWidth] = useState<number>(
    typeof width === "number" ? width : 0,
  );

  useEffect(() => {
    animationProgress.value = withRepeat(
      withTiming(1, {
        duration: SHIMMER_DURATION_MS,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false,
    );
  }, [animationProgress]);

  const animatedShimmerStyle = useAnimatedStyle(() => {
    const travelDistance = measuredWidth + SHIMMER_STRIP_WIDTH;

    return {
      transform: [
        {
          translateX:
            animationProgress.value * travelDistance - SHIMMER_STRIP_WIDTH,
        },
      ],
    };
  }, [measuredWidth]);

  function onLayout(event: LayoutChangeEvent) {
    if (typeof width === "number") return;

    const nextWidth = event.nativeEvent.layout.width;

    if (nextWidth !== measuredWidth) {
      setMeasuredWidth(nextWidth);
    }
  }

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.block,
        {
          borderRadius,
          height,
          width,
        },
        style,
      ]}
    >
      {measuredWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shimmerStrip,
            {
              borderRadius,
              height,
              width: SHIMMER_STRIP_WIDTH,
            },
            animatedShimmerStyle,
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: darkTheme.listItemBackground,
    overflow: "hidden",
  },
  shimmerStrip: {
    position: "absolute",
    top: 0,
    experimental_backgroundImage:
      "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.08), rgba(255,255,255,0))",
  } as ViewStyle,
});
