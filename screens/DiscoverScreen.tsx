import React from "react";
import { Header } from "yep/components/Header";
import { takimoto } from "yep/lib/takimoto";
import { getString, StringCase } from "yep/strings";

export function DiscoverScreen() {
  return (
    <Container>
      <Header label={getString("discover", StringCase.TITLE)} />
    </Container>
  );
}

const Container = takimoto.View({
  flex: 1,
  alignItems: "center",
});
