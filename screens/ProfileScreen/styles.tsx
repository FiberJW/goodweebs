import React from "react";

import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";

export const OuterContainer = takimoto.View({
  flex: 1,
});

export const InnerContainer = takimoto.ScrollView(
  {},
  { padding: 16, justifyContent: "space-between" }
);

export const UserInfoAndStatsContainer = takimoto.View({
  padding: 16,
  borderRadius: 8,
  backgroundColor: darkTheme.listItemBackground,
  marginBottom: 16,
});

export const Avatar = takimoto.Image({
  height: 40,
  width: 40,
  marginRight: 8,
});

export const UserInfoRow = takimoto.View({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 16,
});

export const Username = takimoto.Text({
  fontFamily: "Manrope-SemiBold",
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
  fontFamily: "Manrope-Regular",
  fontSize: 12.8,
  color: darkTheme.text,
  marginBottom: 4,
});

const StatValue = takimoto.Text({
  fontFamily: "Manrope-SemiBold",
  fontSize: 20,
  color: darkTheme.text,
});

type StatProps = { label: string; value: number };

export function Stat({ label, value }: StatProps) {
  return (
    <StatContainer>
      <StatLabel numberOfLines={1}>{label}</StatLabel>
      <StatValue numberOfLines={1}>{value}</StatValue>
    </StatContainer>
  );
}

export const ListHeader = takimoto.Text({
  fontFamily: "Manrope-SemiBold",
  fontSize: 25,
  color: darkTheme.text,

  marginBottom: 8,
});

export const List = takimoto.FlatList<{
  id: string;
}>(
  {
    marginBottom: 8,
  },
  {
    alignItems: "flex-start",
  }
);

export const ListSpacer = takimoto.View({ width: 8 });

export const Poster = takimoto.ImageBackground({
  height: 80,
  width: 56,
  borderRadius: 4,
  overflow: "hidden",
  backgroundColor: darkTheme.listItemBackground,
});

export const Person = takimoto.ImageBackground({
  height: 56,
  width: 56,
  borderRadius: 28,
  overflow: "hidden",
  backgroundColor: darkTheme.listItemBackground,
});

export const EverythingButTheCTA = takimoto.View({ flex: 1, marginBottom: 16 });
