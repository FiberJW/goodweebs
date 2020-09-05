import React from "react";
import { ImageSourcePropType, StyleSheet } from "react-native";

import { dangoPinkBackground, dangoPink, dangoPinkText } from "yep/colors";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

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
  fontFamily: Manrope.semiBold,
  color: darkTheme.text,
  fontSize: 16,
});

export const EpisodeProgress = takimoto.Text({
  fontFamily: Manrope.extraLight,
  color: darkTheme.text,
  fontSize: 20,
  textAlign: "right",
});

export const BroadcastSchedule = takimoto.Text({
  fontSize: 12.8,
  color: darkTheme.footnote,
  fontFamily: Manrope.regular,
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
  backgroundColor: darkTheme.secondaryButton,
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
});

const ProgressButtonIcon = takimoto.Image({
  height: 16,
  width: 16,
});

type ProgressButtonProps = {
  onPress: () => void;
  icon: ImageSourcePropType;
  disabled?: boolean;
};

export function ProgressButton({
  onPress,
  icon,
  disabled,
}: ProgressButtonProps) {
  return (
    <ProgressButtonTouchable
      onPress={onPress}
      disabled={disabled}
      style={disabled ? { opacity: 0.4 } : undefined}
    >
      <ProgressButtonIcon source={icon} />
    </ProgressButtonTouchable>
  );
}

const EpisodesBehindContainer = takimoto.View({
  position: "absolute",
  top: 4,
  right: 4,
  height: 16,
  width: 16,
  borderRadius: 16,
  backgroundColor: dangoPinkBackground,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: dangoPink,
  shadowColor: dangoPinkText,
  shadowOffset: { height: 2, width: 0 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
});

const EpisodesBehindText = takimoto.Text({
  fontSize: 8,
  textAlign: "center",
  textAlignVertical: "center",
  color: dangoPinkText,
  fontFamily: Manrope.semiBold,
});

type EpisodesBehindProps = {
  count: number;
};

export function EpisodesBehind({ count }: EpisodesBehindProps) {
  if (count <= 0) return null;

  return (
    <EpisodesBehindContainer>
      <EpisodesBehindText>{count}</EpisodesBehindText>
    </EpisodesBehindContainer>
  );
}
