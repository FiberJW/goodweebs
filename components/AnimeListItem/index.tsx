import React from "react";

import { readFragment } from "yep/graphql/tada";
import type { FragmentOf } from "yep/graphql/tada";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { getAiringStatusText } from "yep/utils";

import { AnimeListEntryFragment, MediaListItem } from "../MediaListItem";

type Props = {
  onIncrement: () => void;
  onDecrement: () => void;
  progress: number;
  disabled?: boolean;
  media: FragmentOf<typeof AnimeListEntryFragment>;
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
  const { locale } = useLocaleContext();
  const unmaskedMedia = readFragment(AnimeListEntryFragment, media);
  const isAiringAndCurrentlyWatching =
    unmaskedMedia.status === "RELEASING" &&
    unmaskedMedia.mediaListEntry?.status === "CURRENT";
  const episodesBehind =
    isAiringAndCurrentlyWatching &&
    unmaskedMedia.nextAiringEpisode?.episode !== undefined
      ? unmaskedMedia.nextAiringEpisode.episode - 1 - progress
      : 0;

  return (
    <MediaListItem
      progress={progress}
      media={media}
      disabled={disabled}
      onIncrement={onIncrement}
      onDecrement={onDecrement}
      first={first}
      last={last}
      airingStatus={getAiringStatusText(unmaskedMedia, locale)}
      episodesBehind={episodesBehind}
    />
  );
}
