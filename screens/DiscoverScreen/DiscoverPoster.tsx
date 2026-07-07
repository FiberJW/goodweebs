import { useRouter } from "expo-router";
import React from "react";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { graphql, readFragment, type FragmentOf } from "yep/graphql/tada";
import { useGetTitle } from "yep/utils";

export const MediaPosterFragment = graphql(`
  fragment MediaPosterFragment on Media {
    id
    title {
      romaji
      native
      english
    }
    coverImage {
      large
      medium
    }
  }
`);

export function DiscoverPoster({
  item,
  index,
}: {
  item: FragmentOf<typeof MediaPosterFragment>;
  index: number;
}) {
  const router = useRouter();
  const getTitle = useGetTitle();
  const media = readFragment(MediaPosterFragment, item);

  return (
    <PressableOpacity onPress={() => router.push(`/details/${media.id}`)}>
      <PosterAndTitle
        uri={media.coverImage?.large ?? media.coverImage?.medium ?? ""}
        size="large"
        title={getTitle(media.title ?? undefined)}
        style={(index + 1) % 3 !== 0 ? { marginRight: 16 } : undefined}
      />
    </PressableOpacity>
  );
}
