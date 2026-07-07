import { useQuery } from "@apollo/client";
import { useRouter } from "expo-router";
import { fbs } from "fbtee";
import React from "react";
import { StyleSheet, View, Text } from "react-native";

import { black15, white12_5, white5, white95 } from "yep/colors";
import { DEFAULT_SCORE_FORMAT } from "yep/constants";
import { graphql, readFragment } from "yep/graphql/tada";
import type { FragmentOf } from "yep/graphql/tada";
import { GetViewer } from "yep/graphql/viewer";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import {
  formatScore,
  getMaxProgress,
  getProgress,
  useGetTitle,
} from "yep/utils";

import { EpisodesBehind } from "../AnimeListItem/EpisodesBehind";
import { ProgressButton } from "../AnimeListItem/ProgressButton";
import { PosterAndTitle } from "../PosterAndTitle";
import { PressableOpacity } from "../PressableOpacity";

export const AnimeListEntryFragment = graphql(`
  fragment AnimeListEntryFragment on Media {
    id
    type
    title {
      romaji
      native
      english
    }
    coverImage {
      large
      medium
    }
    episodes
    chapters
    volumes
    status
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    nextAiringEpisode {
      id
      airingAt
      episode
    }
    mediaListEntry {
      id
      progress
      progressVolumes
      status
      score
    }
  }
`);

type Props = {
  onIncrement: () => void;
  onDecrement: () => void;
  progress: number;
  disabled?: boolean;
  media: FragmentOf<typeof AnimeListEntryFragment>;
  first: boolean;
  last: boolean;
  airingStatus?: React.ReactNode;
  episodesBehind?: number;
  secondaryProgress?: React.ReactNode;
};

export function MediaListItem({
  progress,
  media,
  disabled,
  onIncrement,
  onDecrement,
  first,
  last,
  airingStatus,
  episodesBehind = 0,
  secondaryProgress,
}: Props) {
  const router = useRouter();
  const getTitle = useGetTitle();
  const m = readFragment(AnimeListEntryFragment, media);
  // cache-only: the anime tab already fetched the viewer for the bell badge.
  const { data: viewerData } = useQuery(GetViewer, { fetchPolicy: "cache-only" });
  const scoreFormat =
    viewerData?.Viewer?.mediaListOptions?.scoreFormat ?? DEFAULT_SCORE_FORMAT;

  return (
    <PressableOpacity
      style={[
        styles.container,
        {
          backgroundColor: darkTheme.listItemBackground,
          padding: 12,
          borderTopRightRadius: first ? 16 : undefined,
          borderTopLeftRadius: first ? 16 : undefined,
          borderBottomRightRadius: last ? 16 : undefined,
          borderBottomLeftRadius: last ? 16 : undefined,
        },
      ]}
      activeOpacity={0.7}
      onPress={() => router.push(`/details/${m.id}`)}
    >
      <View>
        {/* medium (~100px) for the 56pt thumbnail instead of large (~230px):
            less network + decode per row while scrolling the list. */}
        <PosterAndTitle
          uri={m.coverImage?.medium ?? m.coverImage?.large ?? ""}
          size="small"
        >
          {m.mediaListEntry?.score ? (
            <View
              style={[
                styles.scoreContainer,
                // The emoji is its own bubble — a white pill behind it just
                // looks like a dirty sticker.
                scoreFormat === "POINT_3" && styles.scoreContainerEmoji,
              ]}
            >
              <Text style={styles.scoreText}>
                {formatScore(m.mediaListEntry.score, scoreFormat)}
              </Text>
            </View>
          ) : null}
        </PosterAndTitle>
        {episodesBehind > 0 ? <EpisodesBehind count={episodesBehind} /> : null}
      </View>
      <View style={styles.titleAndBroadcastColumn}>
        <Text style={styles.title} numberOfLines={2}>
          {getTitle(m.title)}
        </Text>

        <View style={{ alignItems: "flex-start" }}>
          {secondaryProgress ? (
            <Text style={styles.secondaryProgress}>{secondaryProgress}</Text>
          ) : null}

          {airingStatus ? (
            <Text style={styles.broadcastSchedule} numberOfLines={1}>
              {airingStatus}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.progressColumn}>
        <View style={styles.episodeProgressContainer}>
          <Text style={styles.episodeProgress}>
            {getProgress(m, progress)}
          </Text>
        </View>
        {/* Unreleased titles still allow progress edits — early screenings,
            pre-serialization chapters, and AniList data lag are all real. */}
        <View style={styles.progressButtonGroup}>
          <ProgressButton
            disabled={Boolean(disabled) || progress === 0}
            icon={require("yep/assets/icons/progress-decrement.png")}
            accessibilityLabel={String(
              fbs(
                "Decrease progress",
                "Decrease progress button accessibility label",
              ),
            )}
            onPress={() => {
              onDecrement();
            }}
          />
          <ProgressButton
            disabled={Boolean(disabled) || progress === getMaxProgress(m)}
            icon={
              progress === (getMaxProgress(m) ?? 0) - 1
                ? require("yep/assets/icons/progress-complete.png")
                : require("yep/assets/icons/progress-increment.png")
            }
            accessibilityLabel={String(
              progress === (getMaxProgress(m) ?? 0) - 1
                ? fbs(
                    "Complete series",
                    "Complete series button accessibility label",
                  )
                : fbs(
                    "Increase progress",
                    "Increase progress button accessibility label",
                  ),
            )}
            onPress={() => {
              onIncrement();
            }}
          />
        </View>
      </View>
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  broadcastSchedule: {
    color: darkTheme.footnote,
    fontFamily: Manrope.regular,
    fontSize: 12.8,
  },
  container: {
    flexDirection: "row",
    gap: 8,
  },
  episodeProgress: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 16,
    textAlign: "right",
  },
  secondaryProgress: {
    color: darkTheme.footnote,
    fontFamily: Manrope.semiBold,
    fontSize: 12.8,
    textAlign: "right",
  },
  episodeProgressContainer: {
    backgroundColor: white5,
    borderColor: white12_5,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  progressButtonGroup: { flexDirection: "row", gap: 8 },
  progressColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  scoreContainer: {
    backgroundColor: white95,
    borderColor: black15,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    position: "absolute",
    right: 4,
  },
  scoreContainerEmoji: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  scoreText: {
    color: darkTheme.textInverted,
    fontFamily: Manrope.semiBold,
    fontSize: 12.8,
  },
  title: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 16,
  },
  titleAndBroadcastColumn: {
    alignItems: "flex-start",
    flex: 1,
    justifyContent: "space-between",
  },
});
