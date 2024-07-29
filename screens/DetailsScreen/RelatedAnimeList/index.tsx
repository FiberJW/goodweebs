import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";

import {
  AnimeRelationFragmentFragment,
  MediaRelation,
} from "yep/graphql/generated";
import { RootStackParamList } from "yep/navigation";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { getReadableMediaRelation } from "yep/utils";

import { RelatedAnimeItem } from "./RelatedAnimeItem";

const RelatedListFlatList = takimoto.FlatList<AnimeRelationFragmentFragment>(
  {
    width: "100%",
    marginBottom: 16,
  },
  { gap: 8 }
);

const RelatedListHeader = takimoto.Text({
  fontFamily: Manrope.semiBold,
  color: darkTheme.text,
  fontSize: 16,
  marginBottom: 8,
});

interface RelatedListProperties {
  relations: AnimeRelationFragmentFragment[];
  relationType: MediaRelation;
  navigation: StackNavigationProp<RootStackParamList>;
}

export function RelatedAnimeList({
  relationType,
  relations,
  navigation,
}: RelatedListProperties) {
  if (
    // filter out non-anime relations
    // TODO: add back in when DetailScreen can support Characters/People, Manga, and Studios
    [
      MediaRelation.Adaptation,
      MediaRelation.Character,
      MediaRelation.Other,
      MediaRelation.Source,
      MediaRelation.Contains,
    ].includes(relationType)
  ) {
    return null;
  }

  return (
    <>
      <RelatedListHeader>
        {getReadableMediaRelation(relationType)}
      </RelatedListHeader>
      <RelatedListFlatList
        horizontal
        keyExtractor={(item) => `${item.id}`}
        data={relations}
        renderItem={({ item }) => {
          return <RelatedAnimeItem anime={item} navigation={navigation} />;
        }}
      />
    </>
  );
}
