import React from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonShimmerBlock } from "yep/components/SkeletonShimmerBlock";

const DETAILS_POSTER_WIDTH = 128;
const DETAILS_POSTER_HEIGHT = Math.round(DETAILS_POSTER_WIDTH * 1.4285714286);

type InfoCellProps = {
  labelWidth: number;
  valueWidth: number;
};

function InfoCell({ labelWidth, valueWidth }: InfoCellProps) {
  return (
    <View style={styles.infoCell}>
      <SkeletonShimmerBlock borderRadius={4} height={12} width={labelWidth} />
      <SkeletonShimmerBlock borderRadius={4} height={16} width={valueWidth} />
    </View>
  );
}

type StepperRowProps = {
  labelWidth: number;
};

function StepperRow({ labelWidth }: StepperRowProps) {
  return (
    <View style={styles.stepperRow}>
      <View style={styles.stepperLabel}>
        <SkeletonShimmerBlock borderRadius={4} height={24} width={24} />
        <SkeletonShimmerBlock borderRadius={6} height={16} width={labelWidth} />
      </View>
      <View style={styles.stepperControl}>
        <SkeletonShimmerBlock borderRadius={24} height={48} width={48} />
        <SkeletonShimmerBlock
          borderRadius={4}
          height={16}
          style={styles.stepperCount}
          width={32}
        />
        <SkeletonShimmerBlock borderRadius={24} height={48} width={48} />
      </View>
    </View>
  );
}

export function DetailsSkeleton() {
  return (
    <>
      <View style={styles.posterAndInfoContainer}>
        <SkeletonShimmerBlock
          borderRadius={8}
          height={DETAILS_POSTER_HEIGHT}
          style={styles.poster}
          width={DETAILS_POSTER_WIDTH}
        />
        <View style={styles.infoTable}>
          <View style={styles.infoRow}>
            <InfoCell labelWidth={54} valueWidth={72} />
            <InfoCell labelWidth={54} valueWidth={88} />
          </View>
          <View style={styles.infoRow}>
            <InfoCell labelWidth={54} valueWidth={66} />
            <InfoCell labelWidth={54} valueWidth={78} />
          </View>
          <View style={styles.infoRow}>
            <InfoCell labelWidth={54} valueWidth={62} />
            <InfoCell labelWidth={54} valueWidth={82} />
          </View>
        </View>
      </View>

      <SkeletonShimmerBlock
        borderRadius={100}
        height={40}
        style={styles.primaryButton}
        width="100%"
      />

      <StepperRow labelWidth={72} />
      <StepperRow labelWidth={92} />

      <View style={styles.descriptionSection}>
        <SkeletonShimmerBlock borderRadius={6} height={16} width={110} />
        <SkeletonShimmerBlock
          borderRadius={6}
          height={14}
          style={styles.descriptionLine}
          width="96%"
        />
        <SkeletonShimmerBlock
          borderRadius={6}
          height={14}
          style={styles.descriptionLine}
          width="100%"
        />
        <SkeletonShimmerBlock
          borderRadius={6}
          height={14}
          style={styles.descriptionLine}
          width="88%"
        />
        <SkeletonShimmerBlock
          borderRadius={6}
          height={14}
          style={styles.descriptionLine}
          width="74%"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  descriptionLine: {
    marginTop: 8,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  infoCell: {
    flex: 1,
    gap: 4,
  },
  infoRow: {
    columnGap: 12,
    flexDirection: "row",
  },
  infoTable: {
    flex: 1,
    justifyContent: "space-between",
  },
  poster: {
    marginRight: 16,
  },
  posterAndInfoContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  primaryButton: {
    marginBottom: 16,
  },
  stepperControl: {
    alignItems: "center",
    flexDirection: "row",
  },
  stepperCount: {
    marginHorizontal: 8,
  },
  stepperLabel: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  stepperRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
});
