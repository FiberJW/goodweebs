import { yellowDarkA } from "@radix-ui/colors";
import type { Locale } from "date-fns";
import { differenceInDays } from "date-fns/differenceInDays";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { ja } from "date-fns/locale/ja";
import { fbs } from "fbtee";
import { Platform, Text } from "react-native";

import type { AnimeListEntryFragment } from "yep/components/MediaListItem";
import type { MediaSortField } from "yep/constants";
import type {
  MediaListStatus,
  MediaRelation,
  MediaStatus,
  MediaType,
  ScoreFormat,
} from "yep/graphql/enums";
import type { ResultOf } from "yep/graphql/tada";
import { fakeName } from "yep/screenshotMode";

import { useLocaleContext } from "./i18n/LocaleContext";

// Matches AniList's own display: denominator for point scales, a star for the
// 5-star scale, and smiley faces (not numbers) for the 3-point scale.
export function formatScore(score: number, format: ScoreFormat): string {
  switch (format) {
    case "POINT_100":
      return `${score}/100`;
    case "POINT_10_DECIMAL":
    case "POINT_10":
      return `${score}/10`;
    case "POINT_5":
      return `${score}/5 ★`;
    case "POINT_3":
      return ["—", "🙁", "😐", "🙂"][score] ?? "🙂";
  }
}

// iOS 26+ ships the liquid-glass system chrome (native tab bar morphing into
// the search field, glass headers). Older iOS keeps our in-screen equivalents.
export const isLiquidGlass =
  Platform.OS === "ios" && Number.parseInt(String(Platform.Version), 10) >= 26;

export function notEmpty<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}

// fbtee translates the labels around dates, but date-fns and toLocaleDateString
// need the locale passed explicitly — without it ja_JP users get English
// relative times ("3 days ago") and US date order (M/D/Y).
const dateFnsLocales: { [locale: string]: Locale } = { ja_JP: ja };

export function getDateFnsLocale(locale?: string): Locale | undefined {
  return locale ? dateFnsLocales[locale] : undefined;
}

function toBcp47(locale?: string): string {
  return locale?.replace("_", "-") ?? "en-US";
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

// getTitle runs on titles from many fragments, but every one selects the same
// { romaji english native }. Derive the shape from AnimeListEntryFragment's title
// selection (schema-anchored, so a MediaTitle change surfaces here at compile
// time) rather than hand-writing it. Partial keeps callers that type these fields
// optionally (profile favourites, notification rows) assignable.
type TitleInput =
  | Partial<NonNullable<ResultOf<typeof AnimeListEntryFragment>["title"]>>
  | null
  | undefined;

function getTitle(title: TitleInput, locale?: string): string | undefined {
  if (!title) return undefined;

  if (locale === "ja_JP") {
    return title.native ?? title.romaji ?? title.english ?? undefined;
  }

  return title.english ?? title.romaji ?? title.native ?? undefined;
}

export function useGetTitle() {
  const { locale } = useLocaleContext();

  return (title: TitleInput) => fakeName(getTitle(title, locale));
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
    default: {
      // AniList adds relation values over time; an unhandled one would render
      // as undefined. Humanize the raw enum ("SIDE_STORY" -> "Side story").
      const raw = String(mediaRelation).replace(/_/g, " ").toLowerCase();
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    }
  }
}

export function getMediaListStatusLabel(
  status: MediaListStatus,
  mediaType: MediaType | null | undefined = "ANIME",
): string {
  const isManga = mediaType === "MANGA";
  switch (status) {
    case "CURRENT":
      return isManga
        ? String(fbs("Reading", "Media list status reading"))
        : String(fbs("Watching", "Media list status watching"));
    case "PAUSED":
      return String(fbs("On hold", "Media list status on hold"));
    case "PLANNING":
      return isManga
        ? String(fbs("Plan to read", "Media list status plan to read"))
        : String(fbs("Plan to watch", "Media list status plan to watch"));
    case "DROPPED":
      return String(fbs("Dropped", "Media list status dropped"));
    case "COMPLETED":
      return String(fbs("Completed", "Media list status completed"));
    case "REPEATING":
      return isManga
        ? String(fbs("Rereading", "Media list status rereading"))
        : String(fbs("Repeating", "Media list status repeating"));
  }
}

export function getMediaSortFieldLabel(field: MediaSortField): string {
  switch (field) {
    case "TITLE":
      return String(fbs("Title", "Media list sort by title"));
    case "SCORE":
      return String(fbs("Score", "Media list sort by score"));
    case "PROGRESS":
      return String(fbs("Progress", "Media list sort by progress"));
    case "POPULARITY":
      return String(fbs("Popularity", "Media list sort by popularity"));
    case "UPDATED":
      return String(fbs("Last updated", "Media list sort by last updated"));
    case "ADDED":
      return String(fbs("Date added", "Media list sort by date added"));
    case "STARTED":
      return String(fbs("Start date", "Media list sort by start date"));
    case "FINISHED":
      return String(fbs("Finish date", "Media list sort by finish date"));
    case "VOLUME_PROGRESS":
      return String(fbs("Volume progress", "Media list sort by volume progress"));
  }
}

export function getMediaStatusLabel(status: MediaStatus): string {
  switch (status) {
    case "FINISHED":
      return String(fbs("Finished", "Media status finished"));
    case "RELEASING":
      return String(
        fbs("Currently releasing", "Media status currently releasing"),
      );
    case "NOT_YET_RELEASED":
      return String(fbs("Not yet released", "Media status not yet released"));
    case "CANCELLED":
      return String(fbs("Cancelled", "Media status cancelled"));
    case "HIATUS":
      return String(fbs("On hiatus", "Media status on hiatus"));
  }
}

// Same rationale as TitleInput: dates are always selected as { year month day };
// derive from AnimeListEntryFragment's startDate selection.
type FuzzyDateInput =
  | Partial<NonNullable<ResultOf<typeof AnimeListEntryFragment>["startDate"]>>
  | null
  | undefined;

export function getDateText(
  date: FuzzyDateInput,
  dateType?: string,
  options?: { highlight?: boolean; locale?: string },
): React.ReactNode | string | undefined {
  if (!date) return undefined;

  if (date.month && date.day && date.year) {
    const jsDate = new Date(date.year, date.month - 1, date.day); // month is 0-indexed in JS Date
    const now = new Date();

    // show a relative date if the date is within the last 30 days
    const daysDifference = differenceInDays(now, jsDate);
    if (daysDifference >= 0 && daysDifference <= 30) {
      const relativeTime = formatDistanceToNow(jsDate, {
        addSuffix: true,
        locale: getDateFnsLocale(options?.locale),
      });
      // For relative dates, use dateType without colon for more natural text
      const dateText = dateType ? `${dateType} ${relativeTime}` : relativeTime;

      if (options?.highlight) {
        return <Text style={{ color: yellowDarkA.yellowA10 }}>{dateText}</Text>;
      }

      return dateText;
    }

    // For absolute dates, use colon format — and the locale's date order,
    // not hardcoded M/D/Y (ja-JP reads 2026/7/7).
    return `${dateType ? `${dateType}: ` : ""}${jsDate.toLocaleDateString(
      toBcp47(options?.locale),
    )}`;
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
  media: ResultOf<typeof AnimeListEntryFragment>,
  locale?: string,
): React.ReactNode | string | undefined {
  switch (media.status) {
    case "RELEASING":
      // airingAt is an absolute timestamp, so the countdown stays correct no
      // matter how stale the cached response is (timeUntilAiring was only
      // right at fetch time).
      return media.nextAiringEpisode?.airingAt
        ? `${String(fbs("EP", "Episode abbreviation"))} ${
            media.nextAiringEpisode?.episode
          } ${String(fbs("airs in", "Airs in status text"))} ${formatDistanceToNow(
            new Date(media.nextAiringEpisode.airingAt * 1000),
            { locale: getDateFnsLocale(locale) },
          )}`
        : String(fbs("Releasing", "Anime status releasing"));
    case "NOT_YET_RELEASED":
      return media.startDate
        ? getDateText(
            media.startDate,
            String(fbs("Starting", "Starting date label")),
            { locale },
          )
        : String(fbs("Not yet released", "Anime status not yet released"));
    case "HIATUS":
      return String(fbs("On hiatus", "Anime status on hiatus"));
    case "FINISHED":
      return media.endDate
        ? getDateText(
            media.endDate,
            String(fbs("Finished", "Finished date label")),
            { highlight: true, locale },
          )
        : String(fbs("Finished", "Anime status finished"));
    case "CANCELLED":
      return media.endDate
        ? getDateText(
            media.endDate,
            String(fbs("Cancelled", "Cancelled date label")),
            { locale },
          )
        : String(fbs("Cancelled", "Anime status cancelled"));
  }
}

// Where a progress counter tops out: chapters for manga, episodes for anime.
// null/undefined means AniList doesn't know the total (ongoing series).
export function getMaxProgress(
  media:
    | {
        type?: MediaType | null;
        episodes?: number | null;
        chapters?: number | null;
      }
    | null
    | undefined,
): number | null | undefined {
  return media?.type === "MANGA" ? media?.chapters : media?.episodes;
}

// Manga-only companion to getProgress: volume progress straight from the
// cache (the list row's steppers only drive chapters, so no optimistic value).
export function getVolumesProgress(
  media: ResultOf<typeof AnimeListEntryFragment>,
) {
  const volumeAbbreviation = String(
    fbs("volumes read", "Volume progress text"),
  );
  const progressVolumes = media.mediaListEntry?.progressVolumes ?? 0;

  return media.volumes
    ? `${progressVolumes}/${media.volumes} ${volumeAbbreviation}`
    : `${progressVolumes} ${volumeAbbreviation}`;
}

export function getProgress(
  media: ResultOf<typeof AnimeListEntryFragment>,
  progress: number,
) {
  const unitAbbreviation =
    media.type === "MANGA"
      ? String(fbs("CH", "Chapter abbreviation in progress text"))
      : String(fbs("EP", "Episode abbreviation in progress text"));
  const maxProgress = getMaxProgress(media);

  return maxProgress
    ? `${progress}/${maxProgress} ${unitAbbreviation}`
    : `${progress} ${unitAbbreviation}`;
}
