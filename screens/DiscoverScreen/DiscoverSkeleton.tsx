import React from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonShimmerBlock } from "yep/components/SkeletonShimmerBlock";

type DiscoverSkeletonGridProps = {
  posterWidth: number;
  posterHeight: number;
  itemCount?: number;
  showHeader?: boolean;
};

export function DiscoverSkeletonGrid({
  posterWidth,
  posterHeight,
  itemCount = 12,
  showHeader = true,
}: DiscoverSkeletonGridProps) {
  const items = Array.from({ length: itemCount }, (_, index) => ({
    id: `discover-skeleton-${index}`,
    hasRightSpacing: (index + 1) % 3 !== 0,
  }));
  const primaryTitleWidth = Math.round(posterWidth * 0.82);
  const secondaryTitleWidth = Math.round(posterWidth * 0.56);
  const headerWidth = Math.max(160, Math.round(posterWidth * 2.2));

  return (
    <View>
      {showHeader ? (
        <SkeletonShimmerBlock
          borderRadius={6}
          height={24}
          style={styles.header}
          width={headerWidth}
        />
      ) : null}
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
    marginBottom: 16,
  },
  withRightSpacing: {
    marginRight: 16,
  },
});
