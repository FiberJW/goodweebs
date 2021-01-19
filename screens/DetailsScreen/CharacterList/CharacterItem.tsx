import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { CharacterDataFragment } from "yep/graphql/generated";
import { RootStackParamList } from "yep/navigation";

type Props = {
  character: CharacterDataFragment;
  navigation: StackNavigationProp<RootStackParamList>;
};

export function CharacterItem({ character, navigation }: Props) {
  if (!character.image?.large) return null;

  return (
    <PosterAndTitle
      size="large"
      uri={character.image.large}
      onPress={() => {
        navigation.push("Character", { id: character.id });
      }}
      title={character.name?.full ?? ""}
    />
  );
}
