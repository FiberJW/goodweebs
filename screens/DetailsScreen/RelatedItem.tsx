import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { AnimeRelationFragmentFragment } from "yep/graphql/generated";
import { RootStackParamList } from "yep/navigation";
import { getTitle } from "yep/utils";

type RelatedItemProps = {
  anime: AnimeRelationFragmentFragment;
  navigation: StackNavigationProp<RootStackParamList>;
};

export function RelatedItem({ anime, navigation }: RelatedItemProps) {
  if (!anime.coverImage?.large) return null;

  return (
    <PosterAndTitle
      size="large"
      uri={anime.coverImage?.large}
      onPress={() => {
        navigation.push("Details", { id: anime.id });
      }}
      title={getTitle(anime.title)}
    />
  );
}
