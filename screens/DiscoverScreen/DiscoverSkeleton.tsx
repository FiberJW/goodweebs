import React from "react";
import { StyleSheet, View } from "react-native";

import { POSTER_GRID, usePosterSize } from "yep/components/PosterAndTitle";
import { SkeletonShimmerBlock } from "yep/components/SkeletonShimmerBlock";

export function DiscoverSkeletonGrid() {
  const { width: posterWidth, height: posterHeight } = usePosterSize("large");
  const items = Array.from({ length: 12 }, (_, index) => ({
    id: `discover-skeleton-${index}`,
    hasRightSpacing: (index + 1) % POSTER_GRID.columns !== 0,
  }));
  const primaryTitleWidth = Math.round(posterWidth * 0.82);
  const secondaryTitleWidth = Math.round(posterWidth * 0.56);
  const headerWidth = Math.max(160, Math.round(posterWidth * 2.2));

  return (
    <View>
      <SkeletonShimmerBlock
        borderRadius={6}
        height={24}
        style={styles.header}
        width={headerWidth}
      />

      <View style={styles.grid}>
        {items.map((item) => (
          <View
            key={item.id}
            style={[
              styles.tile,
              {
                width: posterWidth,
              },
              item.hasRightSpacing ? styles.withRightSpacing : null,
            ]}
          >
            <SkeletonShimmerBlock
              borderRadius={8}
              height={posterHeight}
              width={posterWidth}
            />
            <SkeletonShimmerBlock
              borderRadius={4}
              height={12}
              style={styles.primaryTitle}
              width={primaryTitleWidth}
            />
            <SkeletonShimmerBlock
              borderRadius={4}
              height={12}
              style={styles.secondaryTitle}
              width={secondaryTitleWidth}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  header: {
    marginBottom: 16,
  },
  primaryTitle: {
    marginTop: 8,
  },
  secondaryTitle: {
    marginTop: 6,
  },
  tile: {
    alignItems: "center",
    marginBottom: POSTER_GRID.gap,
  },
  withRightSpacing: {
    marginRight: POSTER_GRID.gap,
  },
});
