import React from "react";
import { StyleSheet, View } from "react-native";

import { usePosterSize } from "yep/components/PosterAndTitle";
import { SkeletonShimmerBlock } from "yep/components/SkeletonShimmerBlock";

export function CharacterSkeleton() {
  const poster = usePosterSize("details");
  return (
    <>
      <View style={styles.posterContainer}>
        <SkeletonShimmerBlock
          borderRadius={8}
          height={poster.height}
          width={poster.width}
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
