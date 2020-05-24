import React from "react";
import { Header } from "yep/components/Header";
import { takimoto } from "yep/lib/takimoto";

export function ProfileScreen() {
  return (
    <Container>
      <Header label="Profile" />
    </Container>
  );
}

const Container = takimoto.View({
  flex: 1,
  alignItems: "center",
});
