import React from "react";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { AnimeFragmentFragment } from "yep/graphql/generated";
import { useGetTitle } from "yep/utils";

export function DiscoverPoster({
  item,
  index,
  onPress,
}: {
  item: AnimeFragmentFragment;
  index: number;
  onPress?: () => void;
}) {
  const getTitle = useGetTitle();

  return (
    <PressableOpacity onPress={onPress}>
      <PosterAndTitle
        uri={item.coverImage?.large ?? item.coverImage?.medium ?? ""}
        size="large"
        title={getTitle(item.title ?? undefined)}
        style={(index + 1) % 3 !== 0 ? { marginRight: 16 } : undefined}
      />
    </PressableOpacity>
  );
}
