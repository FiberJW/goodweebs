import React from "react";
import { StyleSheet, Text } from "react-native";

import { PagedList } from "yep/components/PagedList";
import { POSTER_GRID, PosterAndTitle } from "yep/components/PosterAndTitle";
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

function DiscoverPoster({ item, index }: { item: Poster; index: number }) {
  const getTitle = useGetTitle();
  const media = readFragment(MediaPosterFragment, item);

  return (
    <PosterAndTitle
      href={`/details/${media.id}`}
      uri={media.coverImage?.large ?? media.coverImage?.medium ?? ""}
      size="large"
      title={getTitle(media.title)}
      style={
        (index + 1) % POSTER_GRID.columns !== 0
          ? { marginRight: POSTER_GRID.gap }
          : undefined
      }
    />
  );
}

function keyExtractor(item: Poster) {
  return `${readFragment(MediaPosterFragment, item).id}`;
}

function renderDiscoverPoster({
  item,
  index,
}: {
  item: Poster;
  index: number;
}) {
  return <DiscoverPoster item={item} index={index} />;
}

export function PosterGrid({
  title,
  results,
  emptyState,
}: {
  title?: string;
  results: PaginatedQuery & { items: readonly (Poster | null)[] };
  emptyState: React.ReactElement;
}) {
  return (
    <PagedList
      paging={results}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator
      ListHeaderComponent={
        title ? <Text style={styles.listHeader}>{title}</Text> : undefined
      }
      data={results.items.filter(notEmpty)}
      numColumns={POSTER_GRID.columns}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListEmptyComponent={emptyState}
      keyExtractor={keyExtractor}
      renderItem={renderDiscoverPoster}
    />
  );
}

const styles = StyleSheet.create({
  content: { gap: POSTER_GRID.gap },
  listHeader: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 20,
    marginBottom: 16,
  },
});
