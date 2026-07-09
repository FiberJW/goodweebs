import type { AnimeListEntryFragment } from "yep/components/MediaListItem";
import type {
  UserStaffNameLanguage,
  UserTitleLanguage,
} from "yep/graphql/enums";
import type { ResultOf } from "yep/graphql/tada";

// Pure title/name resolution, split out from utils.tsx so it stays free of
// React Native imports and can be unit-tested directly (see titleName.test.ts).

// getTitle runs on titles from many fragments, but every one selects the same
// { romaji english native }. Derive the shape from AnimeListEntryFragment's title
// selection (schema-anchored, so a MediaTitle change surfaces here at compile
// time) rather than hand-writing it. Partial keeps callers that type these fields
// optionally (profile favourites, notification rows) assignable.
export type TitleInput =
  | Partial<NonNullable<ResultOf<typeof AnimeListEntryFragment>["title"]>>
  | null
  | undefined;

// The one place the effective title language is decided, shared by display
// (getTitle) and list sorting (animeListPagination) so they never disagree.
// The signed-in user's AniList preference wins (stylised variants collapse to
// their base — the app only fetches non-stylised fields); with no preference
// (guest / not yet set) fall back to the device locale.
export function resolveTitleLanguage(
  locale: string | undefined,
  titleLanguage: UserTitleLanguage | null | undefined,
): "ROMAJI" | "ENGLISH" | "NATIVE" {
  switch (titleLanguage) {
    case "ROMAJI":
    case "ROMAJI_STYLISED":
      return "ROMAJI";
    case "ENGLISH":
    case "ENGLISH_STYLISED":
      return "ENGLISH";
    case "NATIVE":
    case "NATIVE_STYLISED":
      return "NATIVE";
  }
  return locale === "ja_JP" ? "NATIVE" : "ENGLISH";
}

export function getTitle(
  title: TitleInput,
  locale?: string,
  titleLanguage?: UserTitleLanguage | null,
): string | undefined {
  if (!title) return undefined;

  switch (resolveTitleLanguage(locale, titleLanguage)) {
    case "ROMAJI":
      return title.romaji ?? title.english ?? title.native ?? undefined;
    case "ENGLISH":
      return title.english ?? title.romaji ?? title.native ?? undefined;
    case "NATIVE":
      return title.native ?? title.romaji ?? title.english ?? undefined;
  }
}

// Character/staff names have no English form on AniList — only romaji (`full`)
// and `native` — so the name-language preference is a two-way switch.
export type NameInput =
  | { full?: string | null; native?: string | null }
  | null
  | undefined;

export function getName(
  name: NameInput,
  staffNameLanguage?: UserStaffNameLanguage | null,
): string | undefined {
  if (!name) return undefined;

  // ROMAJI_WESTERN reorders the same romaji parts AniList already bakes into
  // `full`, so it maps to `full` too.
  return staffNameLanguage === "NATIVE"
    ? (name.native ?? name.full ?? undefined)
    : (name.full ?? name.native ?? undefined);
}
