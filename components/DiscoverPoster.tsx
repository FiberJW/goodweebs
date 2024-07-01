import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";

import { RootStackParamList } from "yep/_navigation";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { AnimeFragmentFragment } from "yep/graphql/generated";
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
    <PressableOpacity
      onPress={() => navigation.navigate("Details", { id: item.id })}
    >
      <PosterAndTitle
        uri={item.coverImage?.large ?? item.coverImage?.medium ?? ""}
        size="large"
        title={getTitle(item.title ?? undefined)}
        style={(index + 1) % 3 !== 0 ? { marginRight: 16 } : undefined}
      />
    </PressableOpacity>
  );
}
