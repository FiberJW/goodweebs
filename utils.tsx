import { yellowDarkA } from "@radix-ui/colors";
import { add } from "date-fns/add";
import { differenceInDays } from "date-fns/differenceInDays";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { fbs } from "fbtee";
import { Text } from "react-native";

import {
  MediaTitle,
  MediaRelation,
  AnimeFragmentFragment,
  MediaStatus,
  MediaListStatus,
  Maybe,
  FuzzyDate,
} from "./graphql/generated";

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

function getMonthName(month: number): string {
  switch (month) {
    case 1:
      return String(fbs("January", "Month name January"));
    case 2:
      return String(fbs("February", "Month name February"));
    case 3:
      return String(fbs("March", "Month name March"));
    case 4:
      return String(fbs("April", "Month name April"));
    case 5:
      return String(fbs("May", "Month name May"));
    case 6:
      return String(fbs("June", "Month name June"));
    case 7:
      return String(fbs("July", "Month name July"));
    case 8:
      return String(fbs("August", "Month name August"));
    case 9:
      return String(fbs("September", "Month name September"));
    case 10:
      return String(fbs("October", "Month name October"));
    case 11:
      return String(fbs("November", "Month name November"));
    case 12:
      return String(fbs("December", "Month name December"));
    default:
      return "";
  }
}

export function getTitle(
  title: MediaTitle | undefined | null
): string | undefined {
  if (!title) return undefined;

  return title.english ?? title.romaji ?? title.native ?? undefined;
}

// for making sure TS exhaustively checks switches
export function assertUnreachable(_x: never): never {
  throw new Error("Didn't expect to get here");
}

export function getReadableMediaRelation(mediaRelation: MediaRelation): string {
  switch (mediaRelation) {
    case MediaRelation.Adaptation:
      return String(fbs("Adaptation", "Media relation adaptation"));
    case MediaRelation.Alternative:
      return String(fbs("Alternative", "Media relation alternative"));
    case MediaRelation.Prequel:
      return String(fbs("Prequel", "Media relation prequel"));
    case MediaRelation.Parent:
      return String(fbs("Parent", "Media relation parent"));
    case MediaRelation.Sequel:
      return String(fbs("Sequel", "Media relation sequel"));
    case MediaRelation.Character:
      return String(fbs("Character", "Media relation character"));
    case MediaRelation.SideStory:
      return String(fbs("Side story", "Media relation side story"));
    case MediaRelation.Summary:
      return String(fbs("Summary", "Media relation summary"));
    case MediaRelation.SpinOff:
      return String(fbs("Spin off", "Media relation spin off"));
    case MediaRelation.Other:
      return String(fbs("Other", "Media relation other"));
    case MediaRelation.Source:
      return String(fbs("Source", "Media relation source"));
    case MediaRelation.Compilation:
      return String(fbs("Compilation", "Media relation compilation"));
    case MediaRelation.Contains:
      return String(fbs("Contains", "Media relation contains"));
  }
}

export function getMediaListStatusLabel(status: MediaListStatus): string {
  switch (status) {
    case MediaListStatus.Current:
      return String(fbs("Watching", "Media list status watching"));
    case MediaListStatus.Paused:
      return String(fbs("On hold", "Media list status on hold"));
    case MediaListStatus.Planning:
      return String(fbs("Plan to watch", "Media list status plan to watch"));
    case MediaListStatus.Dropped:
      return String(fbs("Dropped", "Media list status dropped"));
    case MediaListStatus.Completed:
      return String(fbs("Completed", "Media list status completed"));
    case MediaListStatus.Repeating:
      return String(fbs("Repeating", "Media list status repeating"));
  }
}

export function getMediaStatusLabel(status: MediaStatus): string {
  switch (status) {
    case MediaStatus.Finished:
      return String(fbs("Finished", "Media status finished"));
    case MediaStatus.Releasing:
      return String(fbs("Currently releasing", "Media status currently releasing"));
    case MediaStatus.NotYetReleased:
      return String(fbs("Not yet released", "Media status not yet released"));
    case MediaStatus.Cancelled:
      return String(fbs("Cancelled", "Media status cancelled"));
    case MediaStatus.Hiatus:
      return String(fbs("On hiatus", "Media status on hiatus"));
  }
}

export function getDateText(
  date: Maybe<
    { __typename?: "FuzzyDate" } & Pick<FuzzyDate, "year" | "month" | "day">
  >,
  dateType?: string,
  options?: { highlight?: boolean },
): React.ReactNode | string | undefined {
  if (!date) return undefined;

  if (date.month && date.day && date.year) {
    const jsDate = new Date(date.year, date.month - 1, date.day); // month is 0-indexed in JS Date
    const now = new Date();

    // show a relative date if the date is within the last 30 days
    const daysDifference = differenceInDays(now, jsDate);
    if (daysDifference >= 0 && daysDifference <= 30) {
      const relativeTime = formatDistanceToNow(jsDate, { addSuffix: true });
      // For relative dates, use dateType without colon for more natural text
      const dateText = dateType ? `${dateType} ${relativeTime}` : relativeTime;

      if (options?.highlight) {
        return <Text style={{ color: yellowDarkA.yellowA10 }}>{dateText}</Text>;
      }

      return dateText;
    }

    // For absolute dates, use colon format
    return `${dateType ? `${dateType}: ` : ""}${date.month}/${date.day}/${date.year}`;
  }

  // For partial dates (month/year or year only), always use colon format
  const _dateType = dateType ? `${dateType}: ` : "";

  if (date.month && date.year) {
    return `${_dateType}${getMonthName(date.month)} ${date.year}`;
  }

  if (date.year) {
    return `${_dateType}${date.year}`;
  }
}

export function getAiringStatusText(
  media: AnimeFragmentFragment,
  now: Date
): React.ReactNode | string | undefined {
  switch (media.status) {
    case MediaStatus.Releasing:
      return media.nextAiringEpisode
        ? `${String(fbs("EP", "Episode abbreviation"))} ${
            media.nextAiringEpisode?.episode
          } ${String(fbs("airs in", "Airs in status text"))} ${formatDistanceToNow(
            add(now, {
              seconds: media.nextAiringEpisode?.timeUntilAiring ?? 0,
            }),
          )}`
        : String(fbs("Releasing", "Anime status releasing"));
    case MediaStatus.NotYetReleased:
      return media.startDate
        ? getDateText(
            media.startDate,
            String(fbs("Starting", "Starting date label")),
          )
        : String(fbs("Not yet released", "Anime status not yet released"));
    case MediaStatus.Hiatus:
      return String(fbs("On hiatus", "Anime status on hiatus"));
    case MediaStatus.Finished:
      return media.endDate
        ? getDateText(
            media.endDate,
            String(fbs("Finished", "Finished date label")),
            { highlight: true },
          )
        : String(fbs("Finished", "Anime status finished"));
    case MediaStatus.Cancelled:
      return media.endDate
        ? getDateText(
            media.endDate,
            String(fbs("Cancelled", "Cancelled date label")),
          )
        : String(fbs("Cancelled", "Anime status cancelled"));
  }
}

export function getProgress(media: AnimeFragmentFragment, progress: number) {
  const episodeAbbreviation = String(
    fbs("EP", "Episode abbreviation in progress text"),
  );

  return media.episodes
    ? `${progress}/${media.episodes} ${episodeAbbreviation}`
    : `${progress} ${episodeAbbreviation}`;
}
