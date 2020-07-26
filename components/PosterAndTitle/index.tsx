import React from "react";
import { Dimensions } from "react-native";

import { Container, Title, Image } from "./styles";

type Props = {
  small?: boolean;
  uri: string;
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function PosterAndTitle({
  small,
  uri,
  title,
  onPress,
  disabled,
}: Props) {
  const posterWidth = (Dimensions.get("window").width - 16 * 4) / 3;
  const posterHeight = posterWidth * 1.4285714286;

  return (
    <Container onPress={onPress} disabled={disabled}>
      <Image
        style={
          small
            ? { height: 80, width: 56 }
            : { width: posterWidth, height: posterHeight }
        }
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
