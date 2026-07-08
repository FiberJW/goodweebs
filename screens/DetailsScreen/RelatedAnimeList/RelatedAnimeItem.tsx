import { useRouter } from "expo-router";
import React from "react";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { graphql, readFragment } from "yep/graphql/tada";
import type { FragmentOf } from "yep/graphql/tada";
import { useGetTitle } from "yep/utils";

export const AnimeRelationFragment = graphql(`
  fragment AnimeRelationFragment on Media {
    id
    isFavourite
    title {
      romaji
      native
      english
    }
    type
    format
    coverImage {
      large
      medium
      color
    }
  }
`);

type RelatedItemProps = {
  anime: FragmentOf<typeof AnimeRelationFragment>;
};

export function RelatedAnimeItem({ anime: maskedAnime }: RelatedItemProps) {
  const router = useRouter();
  const getTitle = useGetTitle();

  const anime = readFragment(AnimeRelationFragment, maskedAnime);

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
