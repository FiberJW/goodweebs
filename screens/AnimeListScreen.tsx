import React from "react";
import { dark } from "yep/themes";
import { takimoto } from "yep/lib/takimoto";

export function AnimeListScreen() {
  return (
    <Container>
      <HeaderLabel>Anime!</HeaderLabel>
    </Container>
  );
}

const HeaderLabel = takimoto.Text({
  color: dark.text,
  fontFamily: "Manrope-ExtraBold",
  fontSize: 25,
});

const Container = takimoto.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  whenWidth: {
    "<": {
      500: {
        backgroundColor: "red",
      },
    },
  },
  whenHeight: {
    ">": {
      320: {
        backgroundColor: "blue",
      },
    },
  },
});
