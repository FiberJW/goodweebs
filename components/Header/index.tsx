import Constants from "expo-constants";
import React from "react";

import { Container, Label } from "./styles";

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
