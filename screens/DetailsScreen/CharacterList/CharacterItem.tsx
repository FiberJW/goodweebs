import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { CharacterDataFragment } from "yep/graphql/generated";
import { RootStackParamList } from "yep/navigation";

interface Properties {
  character: CharacterDataFragment;
  navigation: StackNavigationProp<RootStackParamList>;
}

export function CharacterItem({ character, navigation }: Properties) {
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
