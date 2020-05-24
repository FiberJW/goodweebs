import Constants from "expo-constants";
import React from "react";
import { takimoto } from "yep/lib/takimoto";
import { darkTheme } from "yep/themes";

const Container = takimoto.Text({
  backgroundColor: darkTheme.navBackground,
  padding: 16,
  width: "100%",
});

const Label = takimoto.Text({
  color: darkTheme.text,
  fontFamily: "Manrope-ExtraBold",
  fontSize: 25,
});

type Props = {
  label: string;
  statusBarPadding?: boolean;
};

export function Header({ label, statusBarPadding = true }: Props) {
  return (
    <Container
      style={{
        paddingTop: statusBarPadding
          ? 16 + Constants.statusBarHeight
          : undefined,
      }}
    >
      <Label>{label}</Label>
    </Container>
  );
}
