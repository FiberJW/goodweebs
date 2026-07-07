import { fbs } from "fbtee";
import React from "react";
import { FlatList, RefreshControl, StyleSheet, Text } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { ListFooterSpinner } from "yep/components/ListFooterSpinner";
import type { MediaPosterFragmentFragment } from "yep/graphql/generated";
import { DiscoverPoster } from "yep/screens/DiscoverScreen/DiscoverPoster";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

type Props = {
  data: MediaPosterFragmentFragment[];
  searchTerm: string;
  loading: boolean;
  isFetchingMore: boolean;
  isRefetching: boolean;
  onEndReached: () => void;
  onRefresh: () => void;
};

type ItemWithId = { id: number };

function keyExtractor(item: ItemWithId) {
  return `${item.id}`;
}

function renderDiscoverPoster({
  item,
  index,
}: {
  item: MediaPosterFragmentFragment;
  index: number;
}) {
  return <DiscoverPoster item={item} index={index} />;
}

export function DiscoverSearchResults({
  data,
  searchTerm,
  loading,
  isFetchingMore,
  isRefetching,
  onEndReached,
  onRefresh,
}: Props) {
  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      // An element (not an inline component) so FlatList doesn't remount it on
      // every data change.
      ListHeaderComponent={
        <Text style={styles.listHeader}>
          {String(
            fbs(
              ["Search results for: ", fbs.param("searchTerm", searchTerm)],
              "Search results header",
            ),
          )}
        </Text>
      }
      data={data}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetchingMore ? <ListFooterSpinner /> : null}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListEmptyComponent={() =>
        loading ? null : (
          <EmptyState
            title={String(fbs("No search results", "No search results title"))}
            description={String(
              fbs(
                "You may have misspelled what you were looking for, or this title isn't listed on AniList.",
                "No search results description",
              ),
            )}
          />
        )
      }
      // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop -- RefreshControl must be a live element; React Compiler memoizes it
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={onRefresh}
          tintColor={darkTheme.text}
          titleColor={darkTheme.text}
        />
      }
      numColumns={3}
      keyExtractor={keyExtractor}
      renderItem={renderDiscoverPoster}
    />
  );
}

const styles = StyleSheet.create({
  content: { gap: 16 },
  listHeader: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 20,
    marginBottom: 16,
  },
});
