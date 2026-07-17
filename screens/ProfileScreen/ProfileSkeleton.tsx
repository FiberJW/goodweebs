import React from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonShimmerBlock } from "yep/components/SkeletonShimmerBlock";

const PROFILE_POSTER_WIDTH = 89.6;
const PROFILE_POSTER_HEIGHT = Math.round(PROFILE_POSTER_WIDTH * 1.4285714286);
// Mirrors the real stat row: total anime, days watched, total manga.
const STAT_SKELETONS = [
  { id: "total-anime", width: 84 },
  { id: "days-watched", width: 98 },
  { id: "total-manga", width: 84 },
];

type Props = {
  itemCount?: number;
};

export function ProfileSkeleton({ itemCount = 4 }: Props) {
  const items = Array.from({ length: itemCount }, (_, index) => ({
    id: `profile-skeleton-${index}`,
    isLast: index === itemCount - 1,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.userCard}>
        <View style={styles.userRow}>
          <SkeletonShimmerBlock borderRadius={24} height={48} width={48} />
          <SkeletonShimmerBlock borderRadius={6} height={24} width={140} />
        </View>
        <View style={styles.statsRow}>
          {STAT_SKELETONS.map(({ id, width }) => (
            <View key={id} style={styles.stat}>
              <SkeletonShimmerBlock
                borderRadius={4}
                height={12}
                width={width}
              />
              <SkeletonShimmerBlock
                borderRadius={6}
                height={24}
                style={styles.statValue}
                width={60}
              />
            </View>
          ))}
        </View>
      </View>

      <View>
        <SkeletonShimmerBlock
          borderRadius={6}
          height={26}
          style={styles.sectionHeader}
          width={190}
        />
        <View style={styles.horizontalList}>
          {items.map((item) => (
            <View
              key={`anime-${item.id}`}
              style={!item.isLast ? styles.withRightSpacing : null}
            >
              <SkeletonShimmerBlock
                borderRadius={8}
                height={PROFILE_POSTER_HEIGHT}
                width={PROFILE_POSTER_WIDTH}
              />
              <SkeletonShimmerBlock
                borderRadius={4}
                height={12}
                style={styles.posterTitle}
                width={72}
              />
            </View>
          ))}
        </View>
      </View>

      <View>
        <SkeletonShimmerBlock
          borderRadius={6}
          height={26}
          style={styles.sectionHeader}
          width={230}
        />
        <View style={styles.horizontalList}>
          {items.map((item) => (
            <View
              key={`character-${item.id}`}
              style={!item.isLast ? styles.withRightSpacing : null}
            >
              <SkeletonShimmerBlock
                borderRadius={8}
                height={PROFILE_POSTER_HEIGHT}
                width={PROFILE_POSTER_WIDTH}
              />
              <SkeletonShimmerBlock
                borderRadius={4}
                height={12}
                style={styles.posterTitle}
                width={76}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  horizontalList: {
    flexDirection: "row",
  },
  posterTitle: {
    marginTop: 8,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  stat: {
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statValue: {
    marginTop: 4,
  },
  userCard: {
    borderRadius: 16,
    gap: 20,
    overflow: "hidden",
    padding: 16,
  },
  userRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  withRightSpacing: {
    marginRight: 8,
  },
});
