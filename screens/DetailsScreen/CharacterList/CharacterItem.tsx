import { useRouter } from "expo-router";
import React from "react";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { graphql, readFragment } from "yep/graphql/tada";
import type { FragmentOf } from "yep/graphql/tada";

export const CharacterListItemData = graphql(`
  fragment CharacterListItemData on Character {
    id
    name {
      full
    }
    image {
      large
    }
  }
`);

type Props = {
  character: FragmentOf<typeof CharacterListItemData>;
};

export function CharacterItem({ character: maskedCharacter }: Props) {
  const router = useRouter();
  const character = readFragment(CharacterListItemData, maskedCharacter);
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
