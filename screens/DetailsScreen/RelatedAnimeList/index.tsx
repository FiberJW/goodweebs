import React from "react";
import { Text, FlatList, StyleSheet } from "react-native";

import {
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

export function RelatedAnimeList({
  relationType,
  relations,
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
      <Text style={styles.relatedListHeader}>
        {getReadableMediaRelation(relationType)}
      </Text>
      <FlatList
        style={styles.relatedListFlatList}
        contentContainerStyle={{ gap: 8 }}
        horizontal
        keyExtractor={(item) => `${item.id}`}
        data={relations}
        renderItem={({ item }) => {
          return <RelatedAnimeItem anime={item} />;
        }}
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
