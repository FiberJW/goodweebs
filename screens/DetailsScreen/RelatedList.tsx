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

import { RelatedItem } from "./RelatedItem";

const RelatedListFlatList = takimoto.FlatList<AnimeRelationFragmentFragment>({
  width: "100%",
});

const RelatedListSeparator = takimoto.View({ width: 8 });
const RelatedListSpacer = takimoto.View({ height: 16 });

const RelatedListHeader = takimoto.Text({
  fontFamily: Manrope.semiBold,
  color: darkTheme.text,
  fontSize: 16,
  marginBottom: 8,
});

type RelatedListProps = {
  relations: AnimeRelationFragmentFragment[];
  relationType: MediaRelation;
  navigation: StackNavigationProp<RootStackParamList>;
};

export function RelatedList({
  relationType,
  relations,
  navigation,
}: RelatedListProps) {
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
        ItemSeparatorComponent={RelatedListSeparator}
        keyExtractor={(item) => `${item.id}`}
        data={relations}
        renderItem={({ item }) => {
          return <RelatedItem anime={item} navigation={navigation} />;
        }}
      />
      <RelatedListSpacer />
    </>
  );
}
