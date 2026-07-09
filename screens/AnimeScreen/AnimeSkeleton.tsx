import React from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonShimmerBlock } from "yep/components/SkeletonShimmerBlock";
import { darkTheme } from "yep/themes";

type Props = {
  rowCount?: number;
};

export function AnimeSkeleton({ rowCount = 8 }: Props) {
  const rows = Array.from({ length: rowCount }, (_, index) => ({
    id: `anime-skeleton-${index}`,
    isLast: index === rowCount - 1,
  }));

  return (
    <View style={styles.list}>
      {rows.map((row) => (
        <View key={row.id}>
          <View style={styles.row}>
            <SkeletonShimmerBlock borderRadius={8} height={80} width={56} />
            <View style={styles.titleColumn}>
              <SkeletonShimmerBlock borderRadius={4} height={16} width="86%" />
              <SkeletonShimmerBlock
                borderRadius={4}
                height={13}
                style={styles.subTitle}
                width="62%"
              />
            </View>
            <View style={styles.progressColumn}>
              <SkeletonShimmerBlock borderRadius={8} height={30} width={84} />
              <View style={styles.progressButtons}>
                <SkeletonShimmerBlock
                  borderRadius={100}
                  height={32}
                  width={48}
                />
                <SkeletonShimmerBlock
                  borderRadius={100}
                  height={32}
                  width={48}
                />
              </View>
            </View>
          </View>
          {!row.isLast ? <View style={styles.divider} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    backgroundColor: darkTheme.listItemBorder,
    height: StyleSheet.hairlineWidth,
  },
  list: {
    backgroundColor: darkTheme.listItemBackground,
    borderRadius: 16,
    overflow: "hidden",
  },
  progressButtons: {
    flexDirection: "row",
    gap: 8,
  },
  progressColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: 104,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  subTitle: {
    marginTop: 8,
  },
  titleColumn: {
    flex: 1,
    justifyContent: "space-between",
  },
});
