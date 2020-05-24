import React from "react";
import { Header } from "yep/components/Header";
import { takimoto } from "yep/lib/takimoto";

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
