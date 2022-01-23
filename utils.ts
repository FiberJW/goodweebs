import add from "date-fns/add";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import {
  MediaTitle,
  MediaRelation,
  AnimeFragmentFragment,
  MediaStatus,
  Maybe,
  FuzzyDate,
} from "./graphql/generated";

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

const monthMap: { [n: number]: string } = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

export function getTitle(
  title: MediaTitle | undefined | null
): string | undefined {
  if (!title) return undefined;

  return (title.english || title.romaji || title.native) ?? undefined;
}

// for making sure TS exhaustively checks switches
export function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}

export function getReadableMediaRelation(mediaRelation: MediaRelation): string {
  switch (mediaRelation) {
    case MediaRelation.Adaptation:
      return "Adaptation";
    case MediaRelation.Alternative:
      return "Alternative";
    case MediaRelation.Prequel:
      return "Prequel";
    case MediaRelation.Parent:
      return "Parent";
    case MediaRelation.Sequel:
      return "Sequel";
    case MediaRelation.Character:
      return "Character";
    case MediaRelation.SideStory:
      return "Side story";
    case MediaRelation.Summary:
      return "Summary";
    case MediaRelation.SpinOff:
      return "Spin off";
    case MediaRelation.Other:
      return "Other";
    case MediaRelation.Source:
      return "Source";
    case MediaRelation.Compilation:
      return "Compilation";
    case MediaRelation.Contains:
      return "Contains";
  }
}

export function getStartOrEndDateText(
  date: Maybe<
    { __typename?: "FuzzyDate" } & Pick<FuzzyDate, "year" | "month" | "day">
  >,
  dateType?: "Starting" | "Ending"
): string | undefined {
  if (!date) return undefined;

  const _dateType = dateType ? `${dateType}: ` : "";

  if (date.month && date.day && date.year) {
    return `${_dateType}${date.month}/${date.day}/${date.year}`;
  }

  if (date.month && date.year) {
    return `${_dateType}${monthMap[date.month]} ${date.year}`;
  }

  if (date.year) {
    return `${_dateType}${date.year}`;
  }
}

export function getAiringStatusText(
  media: AnimeFragmentFragment,
  now: Date
): string | undefined {
  switch (media.status) {
    case MediaStatus.Releasing:
      return media.nextAiringEpisode
        ? `EP ${media.nextAiringEpisode?.episode} airs in ${formatDistanceToNow(
            add(now, {
              seconds: media.nextAiringEpisode?.timeUntilAiring ?? 0,
            })
          )}`
        : "Releasing";
    case MediaStatus.NotYetReleased:
      return media.startDate
        ? getStartOrEndDateText(media.startDate, "Starting")
        : undefined;
    case MediaStatus.Hiatus:
      return "On hiatus";
    case MediaStatus.Finished:
    case MediaStatus.Cancelled:
      return media.startDate
        ? getStartOrEndDateText(media.startDate, "Ending")
        : undefined;
  }
}

export function getProgress(media: AnimeFragmentFragment, progress: number) {
  return media.episodes ? `${progress}/${media.episodes} EP` : `${progress} EP`;
}
