import { useRouter } from "expo-router";
import { fbs } from "fbtee";
import React from "react";
import { StyleSheet, View, Text } from "react-native";

import { black15, white12_5, white5, white95 } from "yep/colors";
import { DEFAULT_SCORE_FORMAT } from "yep/constants";
import { useGetViewerQuery } from "yep/graphql/generated";
import type { AnimeListEntryFragmentFragment } from "yep/graphql/generated";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import {
  formatScore,
  getAiringStatusText,
  getProgress,
  useGetTitle,
} from "yep/utils";

import { PosterAndTitle } from "../PosterAndTitle";
import { PressableOpacity } from "../PressableOpacity";

import { EpisodesBehind } from "./EpisodesBehind";
import { ProgressButton } from "./ProgressButton";

type Props = {
  onIncrement: () => void;
  onDecrement: () => void;
  progress: number;
  disabled?: boolean;
  media: AnimeListEntryFragmentFragment;
  first: boolean;
  last: boolean;
};

export function AnimeListItem({
  progress,
  media,
  disabled,
  onIncrement,
  onDecrement,
  first,
  last,
}: Props) {
  const router = useRouter();
  const getTitle = useGetTitle();
  const { locale } = useLocaleContext();
  // cache-only: the anime tab already fetched the viewer for the bell badge.
  const { data: viewerData } = useGetViewerQuery({ fetchPolicy: "cache-only" });
  const scoreFormat =
    viewerData?.Viewer?.mediaListOptions?.scoreFormat ?? DEFAULT_SCORE_FORMAT;

  const isAiringAndCurrentlyWatching =
    media.status === "RELEASING" && media.mediaListEntry?.status === "CURRENT";

  const episodesBehind =
    isAiringAndCurrentlyWatching &&
    media.nextAiringEpisode?.episode !== undefined
      ? media.nextAiringEpisode.episode - 1 - progress
      : 0;

  const airingStatus = getAiringStatusText(media, locale);

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
      onPress={() => router.push(`/details/${media.id}`)}
    >
      <View>
        {/* medium (~100px) for the 56pt thumbnail instead of large (~230px):
            less network + decode per row while scrolling the list. */}
        <PosterAndTitle
          uri={media.coverImage?.medium ?? media.coverImage?.large ?? ""}
          size="small"
        >
          {media.mediaListEntry?.score ? (
            <View
              style={[
                styles.scoreContainer,
                // The emoji is its own bubble — a white pill behind it just
                // looks like a dirty sticker.
                scoreFormat === "POINT_3" && styles.scoreContainerEmoji,
              ]}
            >
              <Text style={styles.scoreText}>
                {formatScore(media.mediaListEntry.score, scoreFormat)}
              </Text>
            </View>
          ) : null}
        </PosterAndTitle>
        {isAiringAndCurrentlyWatching ? (
          <EpisodesBehind count={episodesBehind} />
        ) : null}
      </View>
      <View style={styles.titleAndBroadcastColumn}>
        <Text style={styles.title} numberOfLines={2}>
          {getTitle(media.title)}
        </Text>

        {airingStatus ? (
          <Text style={styles.broadcastSchedule} numberOfLines={1}>
            {airingStatus}
          </Text>
        ) : null}
      </View>
      <View style={styles.progressColumn}>
        <View style={styles.episodeProgressContainer}>
          <Text style={styles.episodeProgress}>
            {getProgress(media, progress)}
          </Text>
        </View>
        {media.status !== "NOT_YET_RELEASED" ? (
          <View style={styles.progressButtonGroup}>
            <ProgressButton
              disabled={Boolean(disabled) || progress === 0}
              icon={require("yep/assets/icons/progress-decrement.png")}
              accessibilityLabel={String(
                fbs(
                  "Decrease episode progress",
                  "Decrease episode progress button accessibility label",
                ),
              )}
              onPress={() => {
                onDecrement();
              }}
            />
            <ProgressButton
              disabled={Boolean(disabled) || progress === media.episodes}
              icon={
                progress === (media.episodes ?? 0) - 1
                  ? require("yep/assets/icons/progress-complete.png")
                  : require("yep/assets/icons/progress-increment.png")
              }
              accessibilityLabel={String(
                progress === (media.episodes ?? 0) - 1
                  ? fbs(
                      "Complete series",
                      "Complete series button accessibility label",
                    )
                  : fbs(
                      "Increase episode progress",
                      "Increase episode progress button accessibility label",
                    ),
              )}
              onPress={() => {
                onIncrement();
              }}
            />
          </View>
        ) : null}
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
