import React from "react";
import { dark } from "yep/themes";
import { takimoto } from "yep/lib/takimoto";

import Constants from "expo-constants";

const Container = takimoto.Text({
  backgroundColor: dark.navBackground,
  padding: 16,
  width: "100%",
});

const Label = takimoto.Text({
  color: dark.text,
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
