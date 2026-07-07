import React from "react";

import { readFragment } from "yep/graphql/tada";
import type { FragmentOf } from "yep/graphql/tada";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { getAiringStatusText, getVolumesProgress } from "yep/utils";

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

export function MangaListItem({
  progress,
  media,
  disabled,
  onIncrement,
  onDecrement,
  first,
  last,
}: Props) {
  const { locale } = useLocaleContext();
  const m = readFragment(AnimeListEntryFragment, media);

  return (
    <MediaListItem
      progress={progress}
      media={media}
      disabled={disabled}
      onIncrement={onIncrement}
      onDecrement={onDecrement}
      first={first}
      last={last}
      airingStatus={getAiringStatusText(m, locale)}
      secondaryProgress={getVolumesProgress(m)}
    />
  );
}
