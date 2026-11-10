import { fbs } from "fbtee";
import groupBy from "lodash/groupBy";
import React from "react";
import { StyleSheet, Text } from "react-native";

import { PosterShelf } from "yep/components/PosterShelf";
import type { MediaRelation } from "yep/graphql/enums";
import { graphql, readFragment, type FragmentOf } from "yep/graphql/tada";
import { useGetName, useGetTitle } from "yep/graphql/viewer";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { getReadableMediaRelation } from "yep/utils";

export const CharacterListItemData = graphql(`
  fragment CharacterListItemData on Character {
    id
    name {
      full
      native
    }
    image {
      large
    }
  }
`);

export const AnimeRelationFragment = graphql(`
  fragment AnimeRelationFragment on Media {
    id
    title {
      romaji
      native
      english
    }
    coverImage {
      large
    }
  }
`);

export function CharacterShelf({
  characters,
}: {
  characters: readonly FragmentOf<typeof CharacterListItemData>[];
}) {
  const getName = useGetName();
  const posters = characters.flatMap((masked) => {
    const character = readFragment(CharacterListItemData, masked);
    return character.image?.large
      ? [
          {
            id: character.id,
            uri: character.image.large,
            title: getName(character.name) ?? "",
            href: `/character/${character.id}` as const,
            size: "large" as const,
          },
        ]
      : [];
  });

  return (
    <>
      <Text style={styles.header}>
        {String(fbs("Characters", "Characters section title"))}
      </Text>
      <PosterShelf posters={posters} style={styles.shelf} />
    </>
  );
}

export function RelationShelves({
  relations,
}: {
  relations: readonly {
    relationType: MediaRelation;
    node: FragmentOf<typeof AnimeRelationFragment>;
  }[];
}) {
  const getTitle = useGetTitle();
  const posters = relations.flatMap(({ relationType, node }) => {
    const media = readFragment(AnimeRelationFragment, node);
    return media.coverImage?.large
      ? [
          {
            relationType,
            id: media.id,
            uri: media.coverImage.large,
            title: getTitle(media.title),
            href: `/details/${media.id}` as const,
            size: "large" as const,
          },
        ]
      : [];
  });

  return (
    <>
      {Object.entries(groupBy(posters, (poster) => poster.relationType)).map(
        ([relationType, group]) => (
          <React.Fragment key={relationType}>
            <Text style={styles.header}>
              {getReadableMediaRelation(relationType as MediaRelation)}
            </Text>
            <PosterShelf posters={group} style={styles.shelf} />
          </React.Fragment>
        ),
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 16,
    marginBottom: 8,
  },
  shelf: { marginBottom: 16, width: "100%" },
});
