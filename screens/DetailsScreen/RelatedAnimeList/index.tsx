import React from "react";
import { Text, FlatList, StyleSheet } from "react-native";

import type { MediaRelation } from "yep/graphql/enums";
import { readFragment } from "yep/graphql/tada";
import type { FragmentOf } from "yep/graphql/tada";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { getReadableMediaRelation } from "yep/utils";

import { AnimeRelationFragment, RelatedAnimeItem } from "./RelatedAnimeItem";

type RelatedListProps = {
  relations: readonly FragmentOf<typeof AnimeRelationFragment>[];
  relationType: MediaRelation;
};

function keyExtractor(item: FragmentOf<typeof AnimeRelationFragment>) {
  return `${readFragment(AnimeRelationFragment, item).id}`;
}

function renderRelatedAnimeItem({
  item,
}: {
  item: FragmentOf<typeof AnimeRelationFragment>;
}) {
  return <RelatedAnimeItem anime={item} />;
}

export function RelatedAnimeList({
  relationType,
  relations,
}: RelatedListProps) {
  return (
    <>
      <Text style={styles.relatedListHeader}>
        {getReadableMediaRelation(relationType)}
      </Text>
      <FlatList
        style={styles.relatedListFlatList}
        contentContainerStyle={{ gap: 8 }}
        horizontal
        keyExtractor={keyExtractor}
        data={relations}
        renderItem={renderRelatedAnimeItem}
      />
    </>
  );
}

const styles = StyleSheet.create({
  relatedListFlatList: {
    width: "100%",
    marginBottom: 16,
  },
  relatedListHeader: {
    fontFamily: Manrope.semiBold,
    color: darkTheme.text,
    fontSize: 16,
    marginBottom: 8,
  },
});
