import React from "react";
import { format, add } from "date-fns";
import { AnimeFragmentFragment, MediaStatus } from "yep/graphql/generated";

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
  PosterGradient,
  BroadcastIcon,
} from "./styles";

type Props = {
  onIncrement: () => void;
  onDecrement: () => void;
  onComplete: () => void;
  progress: number;
  media: AnimeFragmentFragment;
};

export function AnimeListItem({ progress, media }: Props) {
  return (
    <Container activeOpacity={0.7}>
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
            Next EP:{" "}
            {format(
              new Date((media.nextAiringEpisode?.airingAt ?? 0) * 1000),
              "M/d/yy HH:mm"
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
            disabled={progress === 0}
            icon={require("yep/assets/icons/progress-decrement.png")}
            onPress={() => {}}
          />
          <ProgressButtonSpacer />
          <ProgressButton
            disabled={progress === (media.episodes ?? 0)}
            icon={
              progress === (media.episodes ?? 0) - 1
                ? require("yep/assets/icons/progress-complete.png")
                : require("yep/assets/icons/progress-increment.png")
            }
            onPress={() => {}}
          />
        </ProgressButtonGroup>
      </ProgressColumn>
    </Container>
  );
}
