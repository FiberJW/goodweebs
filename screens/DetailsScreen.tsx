import React from "react";
import { takimoto } from "yep/lib/takimoto";
import { getString, StringCase } from "yep/strings";
import { darkTheme } from "yep/themes";

export function DetailsScreen() {
  return (
    <Container>
      <PlaceholderText>
        {getString("details", StringCase.TITLE)}
      </PlaceholderText>
    </Container>
  );
}

const Container = takimoto.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
});

const PlaceholderText = takimoto.Text({
  color: darkTheme.text,
  fontFamily: "Manrope-ExtraBold",
  fontSize: 25,
});
