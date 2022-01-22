import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { formatDistanceToNow, add } from "date-fns";
import React from "react";
import { StyleSheet, View, Text } from "react-native";

import {
  AnimeFragmentFragment,
  MediaStatus,
  MediaListStatus,
} from "yep/graphql/generated";
import { useNow } from "yep/hooks/helpers";
import { RootStackParamList, TabParamList } from "yep/navigation";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { getAiringStatusText, getTitle } from "yep/utils";

import { PosterAndTitle } from "../PosterAndTitle";
import { PressableOpacity } from "../PressableOpacity";

import { EpisodesBehind } from "./EpisodesBehind";
import { ProgressButton } from "./ProgressButton";

type Props = {
  onIncrement: () => void;
  onDecrement: () => void;
  progress: number;
  disabled?: boolean;
  media: AnimeFragmentFragment;
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, "Anime">,
    StackNavigationProp<RootStackParamList>
  >;
};

export function AnimeListItem({
  progress,
  media,
  disabled,
  onIncrement,
  onDecrement,
  navigation,
}: Props) {
  const now = useNow();

  const isAiringAndCurrentlyWatching =
    media.status === MediaStatus.Releasing &&
    media.mediaListEntry?.status === MediaListStatus.Current;

  const episodesBehind =
    isAiringAndCurrentlyWatching &&
    media.nextAiringEpisode?.episode !== undefined
      ? media.nextAiringEpisode.episode - 1 - progress
      : 0;

  const airingStatus = getAiringStatusText(media, now);

  return (
    <PressableOpacity
      style={styles.container}
      borderRadius={8}
      activeOpacity={0.7}
      onPress={() => navigation.navigate("Details", { id: media.id })}
    >
      <PosterAndTitle uri={media.coverImage?.large ?? ""} size="small" disabled>
        {isAiringAndCurrentlyWatching ? (
          <EpisodesBehind count={episodesBehind} />
        ) : null}
      </PosterAndTitle>
      <View style={styles.spacer} />
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
      <View style={styles.spacer} />
      <View style={styles.progressColumn}>
        <Text style={styles.episodeProgress}>
          {media.episodes ? `${progress}/${media.episodes}` : progress}
        </Text>
        <View style={styles.progressButtonGroup}>
          <ProgressButton
            disabled={
              disabled ||
              media.status === MediaStatus.NotYetReleased ||
              progress === 0
            }
            icon={require("yep/assets/icons/progress-decrement.png")}
            onPress={() => {
              onDecrement();
            }}
          />
          <View style={styles.progressButtonSpacer} />
          <ProgressButton
            disabled={
              disabled ||
              media.status === MediaStatus.NotYetReleased ||
              progress === media.episodes
            }
            icon={
              progress === (media.episodes ?? 0) - 1
                ? require("yep/assets/icons/progress-complete.png")
                : require("yep/assets/icons/progress-increment.png")
            }
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
    backgroundColor: darkTheme.listItemBackground,
    flexDirection: "row",
    padding: 8,
  },
  episodeProgress: {
    color: darkTheme.text,
    fontFamily: Manrope.extraLight,
    fontSize: 20,
    textAlign: "right",
  },
  progressButtonGroup: { flexDirection: "row" },
  progressButtonSpacer: { width: 8 },
  progressColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  spacer: {
    width: 8,
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
