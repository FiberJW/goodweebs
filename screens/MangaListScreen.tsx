import React from "react";
import { takimoto } from "yep/lib/takimoto";
import { Header } from "yep/components/Header";

export function MangaListScreen() {
  return (
    <Container>
      <Header label="Manga" />
    </Container>
  );
}

const Container = takimoto.View({
  flex: 1,
  alignItems: "center",
});
