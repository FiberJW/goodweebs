import { useRouter } from "expo-router";
import React from "react";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import type { MediaPosterFragmentFragment } from "yep/graphql/generated";
import { useGetTitle } from "yep/utils";

export function DiscoverPoster({
  item,
  index,
}: {
  item: MediaPosterFragmentFragment;
  index: number;
}) {
  const router = useRouter();
  const getTitle = useGetTitle();

  return (
    <PressableOpacity onPress={() => router.push(`/details/${item.id}`)}>
      <PosterAndTitle
        uri={item.coverImage?.large ?? item.coverImage?.medium ?? ""}
        size="large"
        title={getTitle(item.title ?? undefined)}
        style={(index + 1) % 3 !== 0 ? { marginRight: 16 } : undefined}
      />
    </PressableOpacity>
  );
}
