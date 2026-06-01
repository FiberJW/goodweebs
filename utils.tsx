import { yellowDarkA } from "@radix-ui/colors";
import { add } from "date-fns/add";
import { differenceInDays } from "date-fns/differenceInDays";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { fbs } from "fbtee";
import { Text } from "react-native";

import type {
  MediaTitle,
  MediaRelation,
  AnimeFragmentFragment,
  MediaStatus,
  MediaListStatus,
  Maybe,
  FuzzyDate,
} from "./graphql/generated";
import { useLocaleContext } from "./i18n/LocaleContext";

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

function getTitle(
  title: MediaTitle | undefined | null,
  locale?: string,
): string | undefined {
  if (!title) return undefined;

  if (locale === "ja_JP") {
    return title.native ?? title.romaji ?? title.english ?? undefined;
  }

  return title.english ?? title.romaji ?? title.native ?? undefined;
}

export function useGetTitle() {
  const { locale } = useLocaleContext();

  return (title: MediaTitle | undefined | null) => getTitle(title, locale);
}

export function getReadableMediaRelation(mediaRelation: MediaRelation): string {
  switch (mediaRelation) {
    case "ADAPTATION":
      return String(fbs("Adaptation", "Media relation adaptation"));
    case "ALTERNATIVE":
      return String(fbs("Alternative", "Media relation alternative"));
    case "PREQUEL":
      return String(fbs("Prequel", "Media relation prequel"));
    case "PARENT":
      return String(fbs("Parent", "Media relation parent"));
    case "SEQUEL":
      return String(fbs("Sequel", "Media relation sequel"));
    case "CHARACTER":
      return String(fbs("Character", "Media relation character"));
    case "SIDE_STORY":
      return String(fbs("Side story", "Media relation side story"));
    case "SUMMARY":
      return String(fbs("Summary", "Media relation summary"));
    case "SPIN_OFF":
      return String(fbs("Spin off", "Media relation spin off"));
    case "OTHER":
      return String(fbs("Other", "Media relation other"));
    case "SOURCE":
      return String(fbs("Source", "Media relation source"));
    case "COMPILATION":
      return String(fbs("Compilation", "Media relation compilation"));
    case "CONTAINS":
      return String(fbs("Contains", "Media relation contains"));
  }
}

export function getMediaListStatusLabel(status: MediaListStatus): string {
  switch (status) {
    case "CURRENT":
      return String(fbs("Watching", "Media list status watching"));
    case "PAUSED":
      return String(fbs("On hold", "Media list status on hold"));
    case "PLANNING":
      return String(fbs("Plan to watch", "Media list status plan to watch"));
    case "DROPPED":
      return String(fbs("Dropped", "Media list status dropped"));
    case "COMPLETED":
      return String(fbs("Completed", "Media list status completed"));
    case "REPEATING":
      return String(fbs("Repeating", "Media list status repeating"));
  }
}

export function getMediaStatusLabel(status: MediaStatus): string {
  switch (status) {
    case "FINISHED":
      return String(fbs("Finished", "Media status finished"));
    case "RELEASING":
      return String(fbs("Currently releasing", "Media status currently releasing"));
    case "NOT_YET_RELEASED":
      return String(fbs("Not yet released", "Media status not yet released"));
    case "CANCELLED":
      return String(fbs("Cancelled", "Media status cancelled"));
    case "HIATUS":
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
    case "RELEASING":
      return media.nextAiringEpisode
        ? `${String(fbs("EP", "Episode abbreviation"))} ${
            media.nextAiringEpisode?.episode
          } ${String(fbs("airs in", "Airs in status text"))} ${formatDistanceToNow(
            add(now, {
              seconds: media.nextAiringEpisode?.timeUntilAiring ?? 0,
            }),
          )}`
        : String(fbs("Releasing", "Anime status releasing"));
    case "NOT_YET_RELEASED":
      return media.startDate
        ? getDateText(
            media.startDate,
            String(fbs("Starting", "Starting date label")),
          )
        : String(fbs("Not yet released", "Anime status not yet released"));
    case "HIATUS":
      return String(fbs("On hiatus", "Anime status on hiatus"));
    case "FINISHED":
      return media.endDate
        ? getDateText(
            media.endDate,
            String(fbs("Finished", "Finished date label")),
            { highlight: true },
          )
        : String(fbs("Finished", "Anime status finished"));
    case "CANCELLED":
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
