import React from "react";
import { Text, FlatList, StyleSheet } from "react-native";

import type {
  AnimeRelationFragmentFragment,
  MediaRelation,
} from "yep/graphql/generated";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { getReadableMediaRelation } from "yep/utils";

import { RelatedAnimeItem } from "./RelatedAnimeItem";

type RelatedListProps = {
  relations: AnimeRelationFragmentFragment[];
  relationType: MediaRelation;
};

function keyExtractor(item: AnimeRelationFragmentFragment) {
  return `${item.id}`;
}

function renderRelatedAnimeItem({
  item,
}: {
  item: AnimeRelationFragmentFragment;
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
