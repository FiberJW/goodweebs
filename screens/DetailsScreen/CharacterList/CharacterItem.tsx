import { useRouter } from "expo-router";
import React from "react";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { graphql, readFragment } from "yep/graphql/tada";
import type { FragmentOf } from "yep/graphql/tada";
import { useGetName } from "yep/utils";

export const CharacterListItemData = graphql(`
  fragment CharacterListItemData on Character {
    id
    name {
      full
      native
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
  const getName = useGetName();
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
        title={getName(character.name) ?? ""}
      />
    </PressableOpacity>
  );
}
