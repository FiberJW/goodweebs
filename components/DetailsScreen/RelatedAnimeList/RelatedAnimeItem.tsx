import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";

import { RootStackParamList } from "yep/_navigation";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { AnimeRelationFragmentFragment } from "yep/graphql/generated";
import { getTitle } from "yep/utils";

type RelatedItemProps = {
  anime: AnimeRelationFragmentFragment;
  navigation: StackNavigationProp<RootStackParamList>;
};

export function RelatedAnimeItem({ anime, navigation }: RelatedItemProps) {
  if (!anime.coverImage?.large) return null;

  return (
    <PressableOpacity
      onPress={() => {
        navigation.push("Details", { id: anime.id });
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
