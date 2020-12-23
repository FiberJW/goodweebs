import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { AnimeFragmentFragment } from "yep/graphql/generated";
import { RootStackParamList } from "yep/navigation";
import { getTitle } from "yep/utils";

export function DiscoverPoster({
  item,
  navigation,
  index,
}: {
  item: AnimeFragmentFragment;
  index: number;
  navigation: StackNavigationProp<RootStackParamList>;
}) {
  return (
    <PosterAndTitle
      onPress={() => navigation.navigate("Details", { id: item.id })}
      uri={item.coverImage?.large ?? item.coverImage?.medium ?? ""}
      size="large"
      title={getTitle(item.title ?? undefined)}
      style={(index + 1) % 3 !== 0 ? { marginRight: 16 } : undefined}
    />
  );
}
