import { ImageBackground } from "expo-image";
import { useRouter, type Href } from "expo-router";
import React, { ReactNode } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  ViewStyle,
  Text,
  View,
} from "react-native";

import { PressableOpacity } from "yep/components/PressableOpacity";
import { SCREENSHOT_BLUR_RADIUS } from "yep/screenshotMode";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

type Props = {
  size: "small" | "tiny" | "large" | "profile" | "details";
  uri: string;
  title?: string;
  style?: ViewStyle;
  children?: ReactNode;
  href?: Href;
};

type PosterSize = Props["size"];

const POSTER_WIDTHS: Record<Exclude<PosterSize, "large">, number> = {
  details: 128,
  profile: 89.6,
  small: 56,
  tiny: 48,
};

export const POSTER_GRID = { columns: 3, gap: 16 };

export function usePosterSize(size: PosterSize) {
  const { width: windowWidth } = useWindowDimensions();
  const width =
    size === "large"
      ? (windowWidth - POSTER_GRID.gap * (POSTER_GRID.columns + 1)) /
        POSTER_GRID.columns
      : POSTER_WIDTHS[size];
  return { width, height: Math.round(width * 1.4285714286) };
}

export function PosterAndTitle({ href, ...props }: Props) {
  const router = useRouter();
  if (!href) return <Poster {...props} />;
  return (
    <PressableOpacity
      accessibilityRole="link"
      accessibilityLabel={props.title}
      onPress={() => router.push(href)}
    >
      <Poster {...props} />
    </PressableOpacity>
  );
}

function Poster({ size, uri, title, style, children }: Omit<Props, "href">) {
  const { width: posterWidth, height: posterHeight } = usePosterSize(size);

  return (
    <View style={[styles.container, style]}>
      <ImageBackground
        blurRadius={SCREENSHOT_BLUR_RADIUS}
        contentFit="cover"
        // Ties the rendered bitmap to the uri in recycled list rows (anime
        // list, discover grid): without it a recycled row shows the previous
        // poster until the new one decodes — visible wrong-cover flicker
        // during fast scrolls.
        recyclingKey={uri}
        style={[styles.poster, { width: posterWidth, height: posterHeight }]}
        source={{ uri }}
      >
        {children}
      </ImageBackground>
      {title ? (
        <Text
          numberOfLines={2}
          style={[
            styles.title,
            {
              maxWidth: posterWidth,
            },
          ]}
        >
          {title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  poster: {
    backgroundColor: darkTheme.listItemBackground,
    borderRadius: 8,
    overflow: "hidden",
  },
  title: {
    color: darkTheme.text,
    fontFamily: Manrope.regular,
    fontSize: 12.8,
    marginTop: 8,
    textAlign: "center",
  },
});
