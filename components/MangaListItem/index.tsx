import React from "react";

import type { AnimeListEntryFragmentFragment } from "yep/graphql/generated";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { getAiringStatusText, getVolumesProgress } from "yep/utils";

import { MediaListItem } from "../MediaListItem";

type Props = {
  onIncrement: () => void;
  onDecrement: () => void;
  progress: number;
  disabled?: boolean;
  media: AnimeListEntryFragmentFragment;
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

  return (
    <MediaListItem
      progress={progress}
      media={media}
      disabled={disabled}
      onIncrement={onIncrement}
      onDecrement={onDecrement}
      first={first}
      last={last}
      airingStatus={getAiringStatusText(media, locale)}
      secondaryProgress={getVolumesProgress(media)}
    />
  );
}
