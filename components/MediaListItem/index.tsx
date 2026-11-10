import { yellowDarkA } from "@radix-ui/colors";
import { useRouter } from "expo-router";
import { fbs } from "fbtee";
import React from "react";
import { StyleSheet, View, Text } from "react-native";

import { black15, white12_5, white5, white95 } from "yep/colors";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { useEntryCounter } from "yep/graphql/mediaListEntry";
import {
  graphql,
  readFragment,
  type FragmentOf,
  type ResultOf,
} from "yep/graphql/tada";
import { useGetTitle, useViewer } from "yep/graphql/viewer";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { formatScore, isEmojiScore } from "yep/score";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import {
  getDateText,
  getMaxProgress,
  getMediaStatusLabel,
  getNextEpisodeText,
  isRecentDate,
} from "yep/utils";

import { EpisodesBehind } from "./EpisodesBehind";
import { ProgressButton } from "./ProgressButton";

export const MediaListItemFragment = graphql(`
  fragment MediaListItemFragment on Media {
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

type Media = ResultOf<typeof MediaListItemFragment>;

function getAiringStatusText(media: Media, locale: string) {
  switch (media.status) {
    case "RELEASING":
      return media.nextAiringEpisode
        ? getNextEpisodeText(media.nextAiringEpisode, locale)
        : String(fbs("Releasing", "Anime status releasing"));
    case "NOT_YET_RELEASED":
      return media.startDate
        ? getDateText(
            media.startDate,
            String(fbs("Starting", "Starting date label")),
            locale,
          )
        : getMediaStatusLabel(media.status);
    case "HIATUS":
      return getMediaStatusLabel(media.status);
    case "FINISHED":
      return media.endDate
        ? getDateText(
            media.endDate,
            String(fbs("Finished", "Finished date label")),
            locale,
          )
        : getMediaStatusLabel(media.status);
    case "CANCELLED":
      return media.endDate
        ? getDateText(
            media.endDate,
            String(fbs("Cancelled", "Cancelled date label")),
            locale,
          )
        : getMediaStatusLabel(media.status);
  }
}

function getProgressText(media: Media, progress: number) {
  const unit =
    media.type === "MANGA"
      ? String(fbs("CH", "Chapter abbreviation in progress text"))
      : String(fbs("EP", "Episode abbreviation in progress text"));
  const maxProgress = getMaxProgress(media);
  return maxProgress
    ? `${progress}/${maxProgress} ${unit}`
    : `${progress} ${unit}`;
}

function getVolumesText(media: Media) {
  const unit = String(fbs("volumes read", "Volume progress text"));
  const progressVolumes = media.mediaListEntry?.progressVolumes ?? 0;
  return media.volumes
    ? `${progressVolumes}/${media.volumes} ${unit}`
    : `${progressVolumes} ${unit}`;
}

export function MediaListItem({
  media: maskedMedia,
}: {
  media: FragmentOf<typeof MediaListItemFragment>;
}) {
  const router = useRouter();
  const getTitle = useGetTitle();
  const { locale } = useLocaleContext();
  const { scoreFormat } = useViewer();
  const media = readFragment(MediaListItemFragment, maskedMedia);
  const entry = media.mediaListEntry;
  const progress = useEntryCounter({
    entryId: entry?.id,
    field: "progress",
    value: entry?.progress ?? 0,
    max: getMaxProgress(media),
  });
  const episodesBehind =
    media.status === "RELEASING" &&
    entry?.status === "CURRENT" &&
    media.nextAiringEpisode
      ? media.nextAiringEpisode.episode - 1 - progress.value
      : 0;
  const airingStatus = getAiringStatusText(media, locale);

  return (
    <PressableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => router.push(`/details/${media.id}`)}
    >
      <View>
        {/* medium (~100px) instead of large (~230px): less network and decode
            per row while scrolling. */}
        <PosterAndTitle
          uri={media.coverImage?.medium ?? media.coverImage?.large ?? ""}
          size="small"
        >
          {entry?.score ? (
            <View
              style={[
                styles.scoreContainer,
                isEmojiScore(scoreFormat) && styles.scoreContainerEmoji,
              ]}
            >
              <Text style={styles.scoreText}>
                {formatScore(entry.score, scoreFormat)}
              </Text>
            </View>
          ) : null}
        </PosterAndTitle>
        {episodesBehind > 0 ? <EpisodesBehind count={episodesBehind} /> : null}
      </View>
      <View style={styles.titleAndBroadcastColumn}>
        <Text style={styles.title} numberOfLines={2}>
          {getTitle(media.title)}
        </Text>

        <View style={{ alignItems: "flex-start" }}>
          {media.type === "MANGA" ? (
            <Text style={styles.secondaryProgress}>
              {getVolumesText(media)}
            </Text>
          ) : null}

          {airingStatus ? (
            <Text
              style={[
                styles.broadcastSchedule,
                media.status === "FINISHED" &&
                  isRecentDate(media.endDate) &&
                  styles.recentlyFinished,
              ]}
              numberOfLines={1}
            >
              {airingStatus}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.progressColumn}>
        <View style={styles.episodeProgressContainer}>
          <Text style={styles.episodeProgress}>
            {getProgressText(media, progress.value)}
          </Text>
        </View>
        <View style={styles.progressButtonGroup}>
          <ProgressButton
            disabled={!progress.canDecrement}
            icon={require("yep/assets/icons/progress-decrement.png")}
            accessibilityLabel={String(
              fbs(
                "Decrease progress",
                "Decrease progress button accessibility label",
              ),
            )}
            onPress={progress.decrement}
          />
          <ProgressButton
            disabled={!progress.canIncrement}
            icon={
              progress.nextCompletes
                ? require("yep/assets/icons/progress-complete.png")
                : require("yep/assets/icons/progress-increment.png")
            }
            accessibilityLabel={String(
              progress.nextCompletes
                ? fbs(
                    "Complete series",
                    "Complete series button accessibility label",
                  )
                : fbs(
                    "Increase progress",
                    "Increase progress button accessibility label",
                  ),
            )}
            onPress={progress.increment}
          />
        </View>
      </View>
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  recentlyFinished: { color: yellowDarkA.yellowA10 },
  broadcastSchedule: {
    color: darkTheme.footnote,
    fontFamily: Manrope.regular,
    fontSize: 12.8,
  },
  container: {
    backgroundColor: darkTheme.listItemBackground,
    flexDirection: "row",
    gap: 8,
    padding: 12,
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
