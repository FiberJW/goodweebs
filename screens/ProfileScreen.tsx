import React from "react";
import { Header } from "yep/components/Header";
import { takimoto } from "yep/lib/takimoto";
import { StringCase, getString } from "yep/strings";

export function ProfileScreen() {
  return (
    <Container>
      <Header label={getString("profile", StringCase.TITLE)} />
    </Container>
  );
}

const Container = takimoto.View({
  flex: 1,
  alignItems: "center",
});
