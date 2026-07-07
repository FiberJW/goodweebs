import { useRouter } from "expo-router";
import React from "react";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import type { CharacterListItemDataFragment } from "yep/graphql/generated";

type Props = {
  character: CharacterListItemDataFragment;
};

export function CharacterItem({ character }: Props) {
  const router = useRouter();
  if (!character.image?.large) return null;

  return (
    <PressableOpacity
      onPress={() => {
        router.push(`/character/${character.id}`);
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
