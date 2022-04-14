import React from "react";

import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

export const OuterContainer = takimoto.View({
  flex: 1,
});

export const InnerContainer = takimoto.ScrollView(
  {},
  { padding: 16, justifyContent: "space-between" }
);

export const UserInfoAndStatsContainer = takimoto.View({
  padding: 16,
  borderRadius: 16,
  backgroundColor: darkTheme.listItemBackground,
});

export const Avatar = takimoto.Image({
  height: 40,
  width: 40,
  borderRadius: 20,
});

export const AvatarSpacer = takimoto.View({
  width: 8,
});

export const UserInfoRow = takimoto.View({
  flexDirection: "row",
  alignItems: "center",
});

export const Username = takimoto.Text({
  fontFamily: Manrope.semiBold,
  fontSize: 20,
  color: darkTheme.text,
});

export const StatsRow = takimoto.View({
  flexDirection: "row",
});

export const StatsRowSpacer = takimoto.View({
  height: 8,
});

const StatContainer = takimoto.View({
  flex: 1,
});

const StatLabel = takimoto.Text({
  fontFamily: Manrope.regular,
  fontSize: 12.8,
  color: darkTheme.text,
});

const StatSpacer = takimoto.View({ height: 4 });

const StatValue = takimoto.Text({
  fontFamily: Manrope.semiBold,
  fontSize: 20,
  color: darkTheme.text,
});

type StatProps = { label: string; value: number };

export function Stat({ label, value }: StatProps) {
  return (
    <StatContainer>
      <StatLabel numberOfLines={1}>{label}</StatLabel>
      <StatSpacer />
      <StatValue numberOfLines={1}>{value}</StatValue>
    </StatContainer>
  );
}

export const ListHeader = takimoto.Text({
  fontFamily: Manrope.semiBold,
  fontSize: 25,
  color: darkTheme.text,
});

export const ListHeaderSpacer = takimoto.View({ height: 8 });

export function makeListWithType<T>() {
  return takimoto.FlatList<T>(
    {},
    {
      alignItems: "flex-start",
    }
  );
}

export const ListItemSpacer = takimoto.View({ width: 8 });

export const FavoriteContainer = takimoto.View({
  alignItems: "center",
});

export const Person = takimoto.Image({
  height: 128,
  width: 128,
  borderRadius: 64,
  overflow: "hidden",
  backgroundColor: darkTheme.listItemBackground,
});

export const EverythingButTheCTA = takimoto.View({ flex: 1 });

export const VerticalSpacer = takimoto.View({ height: 16 });
