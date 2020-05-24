import React from "react";
import { Header } from "yep/components/Header";
import { takimoto } from "yep/lib/takimoto";

export function DiscoverScreen() {
  return (
    <Container>
      <Header label="Discover" />
    </Container>
  );
}

const Container = takimoto.View({
  flex: 1,
  alignItems: "center",
});
