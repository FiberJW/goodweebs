import { StackNavigationProp } from "@react-navigation/stack";
import { formatDistanceToNow, add } from "date-fns";
import React from "react";
import { StyleSheet } from "react-native";

import {
  AnimeFragmentFragment,
  MediaStatus,
  MediaListStatus,
} from "yep/graphql/generated";
import { useNow } from "yep/hooks/helpers";
import { RootStackParamList } from "yep/navigation";
import { darkTheme } from "yep/themes";

import { PressableOpacity } from "../PressableOpacity";

import { ProgressButton } from "./ProgressButton";
import {
  Poster,
  TitleAndBroadcastColumn,
  Title,
  BroadcastSchedule,
  ProgressColumn,
  EpisodeProgress,
  ProgressButtonGroup,
  Spacer,
  ProgressButtonSpacer,
  EpisodesBehind,
} from "./styles";

type Props = {
  onIncrement: () => void;
  onDecrement: () => void;
  progress: number;
  disabled?: boolean;
  media: AnimeFragmentFragment;
  navigation: StackNavigationProp<RootStackParamList>;
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

  return (
    <PressableOpacity
      style={styles.container}
      borderRadius={8}
      activeOpacity={0.7}
      onPress={() => navigation.navigate("Details", { id: media.id })}
    >
      <Poster
        resizeMode="cover"
        source={{
          uri: media.coverImage?.large ?? "",
        }}
      >
        {isAiringAndCurrentlyWatching ? (
          <EpisodesBehind count={episodesBehind} />
        ) : null}
      </Poster>
      <Spacer />
      <TitleAndBroadcastColumn>
        <Title numberOfLines={2}>
          {media.title?.english || media.title?.romaji || media.title?.native}
        </Title>
        {media.status === MediaStatus.Releasing ? (
          <BroadcastSchedule numberOfLines={1}>
            EP {media.nextAiringEpisode?.episode} airs in{" "}
            {formatDistanceToNow(
              add(now, {
                seconds: media.nextAiringEpisode?.timeUntilAiring ?? 0,
              })
            )}
          </BroadcastSchedule>
        ) : media.status === MediaStatus.NotYetReleased ? (
          media.startDate?.month !== null &&
          media.startDate?.month !== undefined && (
            <BroadcastSchedule numberOfLines={1}>
              Starting: {media.startDate?.month}/{media.startDate?.month}/
              {media.startDate?.year}
            </BroadcastSchedule>
          )
        ) : (
          <BroadcastSchedule numberOfLines={1}>
            Ended: {media.endDate?.month}/{media.endDate?.month}/
            {media.endDate?.year}
          </BroadcastSchedule>
        )}
      </TitleAndBroadcastColumn>
      <Spacer />
      <ProgressColumn>
        <EpisodeProgress>
          {progress}/{media.episodes ?? "?"}
        </EpisodeProgress>
        <ProgressButtonGroup>
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
          <ProgressButtonSpacer />
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
        </ProgressButtonGroup>
      </ProgressColumn>
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: darkTheme.listItemBackground,
    flexDirection: "row",
    padding: 8,
  },
});
