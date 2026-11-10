import React from "react";
import { StyleSheet, Text } from "react-native";

import { PagedList } from "yep/components/PagedList";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import {
  getPosterGrid,
  POSTER_GAP,
} from "yep/components/PosterAndTitle/layout";
import type { PaginatedQuery } from "yep/graphql/pagination";
import { graphql, readFragment, type FragmentOf } from "yep/graphql/tada";
import { useGetTitle } from "yep/graphql/viewer";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { notEmpty } from "yep/utils";

export const MediaPosterFragment = graphql(`
  fragment MediaPosterFragment on Media {
    id
    title {
      romaji
      native
      english
    }
    coverImage {
      large
      medium
    }
  }
`);

type Poster = FragmentOf<typeof MediaPosterFragment>;

function DiscoverPoster({ item, width }: { item: Poster; width: number }) {
  const getTitle = useGetTitle();
  const media = readFragment(MediaPosterFragment, item);

  return (
    <PosterAndTitle
      href={`/details/${media.id}`}
      uri={media.coverImage?.large ?? media.coverImage?.medium ?? ""}
      size="large"
      width={width}
      title={getTitle(media.title)}
    />
  );
}

function keyExtractor(item: Poster) {
  return `${readFragment(MediaPosterFragment, item).id}`;
}

export function PosterGrid({
  width,
  title,
  results,
  emptyState,
}: {
  width: number;
  title?: string;
  results: PaginatedQuery & { items: readonly (Poster | null)[] };
  emptyState: React.ReactElement;
}) {
  const grid = getPosterGrid(width);
  if (width <= 0) return null;
  return (
    <PagedList
      key={grid.columns}
      paging={results}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator
      ListHeaderComponent={
        title ? <Text style={styles.listHeader}>{title}</Text> : undefined
      }
      data={results.items.filter(notEmpty)}
      numColumns={grid.columns}
      columnWrapperStyle={grid.columns > 1 ? styles.row : undefined}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListEmptyComponent={emptyState}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => (
        <DiscoverPoster item={item} width={grid.width} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { gap: POSTER_GAP },
  row: { gap: POSTER_GAP },
  listHeader: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 20,
    marginBottom: 16,
  },
});
