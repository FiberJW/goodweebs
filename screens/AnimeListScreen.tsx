import React from "react";
import { Text } from "react-native";
import { dark } from "yep/themes";
import { takimoto } from "yep/lib/takimoto";

export function AnimeListScreen() {
  return (
    <Container>
      <Text
        style={{
          color: dark.text,
          fontFamily: "Manrope-ExtraBold",
          fontSize: 25,
        }}
      >
        Anime!
      </Text>
    </Container>
  );
}

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
