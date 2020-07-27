import React from "react";
import { Dimensions } from "react-native";

import { Container, Title, Image } from "./styles";

type Props = {
  size: "small" | "tiny" | "large";
  uri: string;
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function PosterAndTitle({ size, uri, title, onPress, disabled }: Props) {
  let posterWidth: number;
  switch (size) {
    case "large":
      posterWidth = (Dimensions.get("window").width - 16 * 4) / 3;
      break;
    case "small":
      posterWidth = 56;
      break;
    case "tiny":
      posterWidth = 48;
      break;
  }

  const posterHeight = Math.round(posterWidth * 1.4285714286);

  return (
    <Container onPress={onPress} disabled={disabled}>
      <Image
        style={{ width: posterWidth, height: posterHeight }}
        source={{ uri }}
      />
      {title ? (
        <Title
          numberOfLines={2}
          style={{
            maxWidth: posterWidth,
          }}
        >
          {title}
        </Title>
      ) : null}
    </Container>
  );
}
