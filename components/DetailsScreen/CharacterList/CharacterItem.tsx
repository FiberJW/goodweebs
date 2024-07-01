import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";

import { RootStackParamList } from "yep/_navigation";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { CharacterDataFragment } from "yep/graphql/generated";

type Props = {
  character: CharacterDataFragment;
  navigation: StackNavigationProp<RootStackParamList>;
};

export function CharacterItem({ character, navigation }: Props) {
  if (!character.image?.large) return null;

  return (
    <PressableOpacity
      onPress={() => {
        navigation.push("Character", { id: character.id });
      }}
    >
      <PosterAndTitle
        size="large"
        uri={character.image.large}
        title={character.name?.full ?? ""}
      />
    </PressableOpacity>
  );
}
