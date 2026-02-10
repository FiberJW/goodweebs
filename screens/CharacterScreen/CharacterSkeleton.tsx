import React from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonShimmerBlock } from "yep/components/SkeletonShimmerBlock";

const DETAILS_POSTER_WIDTH = 128;
const DETAILS_POSTER_HEIGHT = Math.round(DETAILS_POSTER_WIDTH * 1.4285714286);

export function CharacterSkeleton() {
  return (
    <>
      <View style={styles.posterContainer}>
        <SkeletonShimmerBlock
          borderRadius={8}
          height={DETAILS_POSTER_HEIGHT}
          width={DETAILS_POSTER_WIDTH}
        />
      </View>

      <SkeletonShimmerBlock borderRadius={6} height={16} width={160} />
      <SkeletonShimmerBlock
        borderRadius={6}
        height={14}
        style={styles.line}
        width="94%"
      />
      <SkeletonShimmerBlock
        borderRadius={6}
        height={14}
        style={styles.line}
        width="100%"
      />
      <SkeletonShimmerBlock
        borderRadius={6}
        height={14}
        style={styles.line}
        width="90%"
      />
      <SkeletonShimmerBlock
        borderRadius={6}
        height={14}
        style={styles.line}
        width="84%"
      />
      <SkeletonShimmerBlock
        borderRadius={6}
        height={14}
        style={styles.line}
        width="72%"
      />
    </>
  );
}

const styles = StyleSheet.create({
  line: {
    marginTop: 8,
  },
  posterContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
});
