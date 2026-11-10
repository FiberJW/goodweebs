import type { Locale } from "date-fns";
import { differenceInDays } from "date-fns/differenceInDays";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { ja } from "date-fns/locale/ja";
import { fbs } from "fbtee";
import { Platform } from "react-native";

import type {
  MediaListStatus,
  MediaRelation,
  MediaStatus,
  MediaType,
} from "yep/graphql/enums";

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

type FuzzyDateInput =
  | { year?: number | null; month?: number | null; day?: number | null }
  | null
  | undefined;

function toJsDate(date: FuzzyDateInput) {
  return date?.year && date.month && date.day
    ? new Date(date.year, date.month - 1, date.day)
    : undefined;
}

export function isRecentDate(date: FuzzyDateInput) {
  const jsDate = toJsDate(date);
  if (!jsDate) return false;
  const daysAgo = differenceInDays(new Date(), jsDate);
  return daysAgo >= 0 && daysAgo <= 30;
}

export function getDateText(
  date: FuzzyDateInput,
  dateType?: string,
  locale?: string,
): string | undefined {
  const jsDate = toJsDate(date);
  if (jsDate && isRecentDate(date)) {
    const relativeTime = formatDistanceToNow(jsDate, {
      addSuffix: true,
      locale: getDateFnsLocale(locale),
    });
    return dateType ? `${dateType} ${relativeTime}` : relativeTime;
  }

  const prefix = dateType ? `${dateType}: ` : "";
  // The locale's date order, not M/D/Y: ja-JP reads 2026/7/7.
  if (jsDate) return `${prefix}${jsDate.toLocaleDateString(toBcp47(locale))}`;
  if (date?.month && date.year) {
    return `${prefix}${getMonthName(date.month)} ${date.year}`;
  }
  if (date?.year) return `${prefix}${date.year}`;
}

export function getTimeAgo(unixSeconds: number, locale?: string) {
  return formatDistanceToNow(new Date(unixSeconds * 1000), {
    addSuffix: true,
    locale: getDateFnsLocale(locale),
  });
}

// airingAt, not timeUntilAiring: an absolute timestamp stays right however
// stale the cached response is.
export function getNextEpisodeText(
  nextAiringEpisode: { airingAt: number; episode: number },
  locale?: string,
) {
  return `${String(
    fbs("EP", "Episode abbreviation for next episode"),
  )} ${nextAiringEpisode.episode} ${String(
    fbs("airs in", "Next episode airs in label"),
  )} ${formatDistanceToNow(new Date(nextAiringEpisode.airingAt * 1000), {
    locale: getDateFnsLocale(locale),
  })}`;
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
