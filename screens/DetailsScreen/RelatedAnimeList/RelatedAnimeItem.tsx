import { useRouter } from "expo-router";
import React from "react";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { AnimeRelationFragmentFragment } from "yep/graphql/generated";
import { getTitle } from "yep/utils";

type RelatedItemProps = {
  anime: AnimeRelationFragmentFragment;
};

export function RelatedAnimeItem({ anime }: RelatedItemProps) {
  const router = useRouter();
  if (!anime.coverImage?.large) return null;

  return (
    <PressableOpacity
      onPress={() => {
        router.push(`/details/${anime.id}`);
      }}
    >
      <PosterAndTitle
        size="large"
        uri={anime.coverImage?.large}
        title={getTitle(anime.title)}
      />
    </PressableOpacity>
  );
}
