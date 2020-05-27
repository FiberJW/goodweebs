import { StackNavigationProp } from "@react-navigation/stack";
import { formatDistanceToNow, add } from "date-fns";
import React from "react";

import { AnimeFragmentFragment, MediaStatus } from "yep/graphql/generated";
import { RootStackParamList } from "yep/navigation";

import {
  Container,
  Poster,
  TitleAndBroadcastColumn,
  Title,
  BroadcastSchedule,
  ProgressColumn,
  EpisodeProgress,
  ProgressButtonGroup,
  ProgressButton,
  Spacer,
  ProgressButtonSpacer,
} from "./styles";

type Props = {
  onIncrement: () => void;
  onDecrement: () => void;
  progress: number;
  media: AnimeFragmentFragment;
  navigation: StackNavigationProp<RootStackParamList>;
};

export function AnimeListItem({
  progress,
  media,
  onIncrement,
  onDecrement,
  navigation,
}: Props) {
  return (
    <Container
      activeOpacity={0.7}
      onPress={() => navigation.navigate("Details")}
    >
      <Poster
        resizeMode="cover"
        source={{
          uri: media.coverImage?.extraLarge ?? "",
        }}
      />
      <Spacer />
      <TitleAndBroadcastColumn>
        <Title numberOfLines={2}>
          {media.title?.english || media.title?.romaji || media.title?.native}
        </Title>
        {media.status === MediaStatus.Releasing ? (
          <BroadcastSchedule numberOfLines={1}>
            EP {media.nextAiringEpisode?.episode} airs in{" "}
            {formatDistanceToNow(
              add(new Date(), {
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
              media.status === MediaStatus.NotYetReleased || progress === 0
            }
            icon={require("yep/assets/icons/progress-decrement.png")}
            onPress={onDecrement}
          />
          <ProgressButtonSpacer />
          <ProgressButton
            disabled={
              media.status === MediaStatus.NotYetReleased ||
              progress === (media.episodes ?? 0)
            }
            icon={
              progress === (media.episodes ?? 0) - 1
                ? require("yep/assets/icons/progress-complete.png")
                : require("yep/assets/icons/progress-increment.png")
            }
            onPress={onIncrement}
          />
        </ProgressButtonGroup>
      </ProgressColumn>
    </Container>
  );
}
