import { fbs } from "fbtee";
import React from "react";
import { FlatList, RefreshControl, StyleSheet, Text } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { ListFooterSpinner } from "yep/components/ListFooterSpinner";
import type {
  MediaPosterFragmentFragment,
  MediaType,
} from "yep/graphql/generated";
import { DiscoverPoster } from "yep/screens/DiscoverScreen/DiscoverPoster";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

type Props = {
  data: MediaPosterFragmentFragment[];
  mediaType: MediaType;
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

export function DiscoverTrendingResults({
  data,
  mediaType,
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
      ListHeaderComponent={
        data.length ? (
          <Text style={styles.listHeader}>
            {mediaType === "MANGA"
              ? String(fbs("Trending manga", "Trending manga list header"))
              : String(fbs("Trending anime", "Trending anime list header"))}
          </Text>
        ) : null
      }
      data={data}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetchingMore ? <ListFooterSpinner /> : null}
      numColumns={3}
      ListEmptyComponent={() =>
        loading ? null : (
          <EmptyState
            title={String(
              fbs("Unexpected loading error", "Trending loading error title"),
            )}
            description={String(
              fbs(
                "Swipe down to try again",
                "Trending loading error description",
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
