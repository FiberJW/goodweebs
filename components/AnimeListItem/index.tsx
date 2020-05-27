import React from "react";

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
  maxEpisodes: number;
  progress: number;
  title: string;
  posterURL: string;
  isAiring: boolean;
  nextEpisodeDate: string; // Date String
};

export function AnimeListItem() {
  return (
    <Container>
      <Poster
        source={{
          uri:
            "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx104462-KrVWRvPcR7ci.jpg",
        }}
      >
        <PosterGradient colors={["transparent", "rgba(0,0,0,0.5)"]}>
          <BroadcastIcon source={require("yep/assets/icons/broadcast.png")} />
        </PosterGradient>
      </Poster>
      <Spacer />
      <TitleAndBroadcastColumn>
        <Title numberOfLines={2}>A Certain Scientific Railgun T</Title>
        <BroadcastSchedule numberOfLines={1}>
          New EP in 7 days
        </BroadcastSchedule>
      </TitleAndBroadcastColumn>
      <Spacer />
      <ProgressColumn>
        <EpisodeProgress>EP: 0/25</EpisodeProgress>
        <ProgressButtonGroup>
          <ProgressButton
            icon={require("yep/assets/icons/progress-decrement.png")}
            onPress={() => {}}
          />
          <ProgressButtonSpacer />
          <ProgressButton
            icon={require("yep/assets/icons/progress-increment.png")}
            onPress={() => {}}
          />
        </ProgressButtonGroup>
      </ProgressColumn>
    </Container>
  );
}
