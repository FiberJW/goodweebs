import React from "react";
import { Header } from "yep/components/Header";
import { takimoto } from "yep/lib/takimoto";

export function SettingsScreen() {
  return (
    <Container>
      <Header label="Settings" />
    </Container>
  );
}

const Container = takimoto.View({
  flex: 1,
  alignItems: "center",
});
