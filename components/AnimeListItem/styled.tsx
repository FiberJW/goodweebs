import React from "react";
import { ImageSourcePropType, StyleSheet } from "react-native";
import { takimoto } from "yep/lib/takimoto";
import { darkTheme } from "yep/themes";

export const Container = takimoto.TouchableOpacity({
  padding: 8,
  borderRadius: 8,
  backgroundColor: darkTheme.listItemBackground,
  flexDirection: "row",
});

export const Poster = takimoto.ImageBackground({
  height: 80,
  width: 56,
  borderRadius: 4,
  overflow: "hidden",
});

export const PosterGradient = takimoto.LinearGradient({
  ...StyleSheet.absoluteFillObject,
  justifyContent: "flex-end",
  alignItems: "flex-end",
  padding: 4,
});

export const BroadcastIcon = takimoto.Image({
  height: 16,
  width: 16,
});

export const Title = takimoto.Text({
  fontFamily: "Manrope-SemiBold",
  color: darkTheme.text,
  fontSize: 16,
});

export const EpisodeProgress = takimoto.Text({
  fontFamily: "Manrope-ExtraLight",
  color: darkTheme.text,
  fontSize: 20,
  textAlign: "right",
});

export const BroadcastSchedule = takimoto.Text({
  fontSize: 12.8,
  color: darkTheme.footnote,
  fontFamily: "Manrope-Regular",
});

export const TitleAndBroadcastColumn = takimoto.View({
  alignItems: "flex-start",
  justifyContent: "space-between",
  flex: 1,
});

export const ProgressColumn = takimoto.View({
  alignItems: "flex-end",
  justifyContent: "space-between",
});

export const Spacer = takimoto.View({
  width: 8,
});

export const ProgressButtonGroup = takimoto.View({ flexDirection: "row" });

export const ProgressButtonSpacer = takimoto.View({ width: 8 });

const ProgressButtonTouchable = takimoto.TouchableOpacity({
  backgroundColor: darkTheme.primaryButton,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 4,
  justifyContent: "center",
  alignItems: "center",
});

const ProgressButtonIcon = takimoto.Image({
  height: 8,
  width: 8,
});

type ProgressButtonProps = {
  onPress: () => void;
  icon: ImageSourcePropType;
};

export function ProgressButton({ onPress, icon }: ProgressButtonProps) {
  return (
    <ProgressButtonTouchable onPress={onPress}>
      <ProgressButtonIcon source={icon} />
    </ProgressButtonTouchable>
  );
}
