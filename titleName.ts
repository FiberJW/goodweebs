import type {
  UserStaffNameLanguage,
  UserTitleLanguage,
} from "yep/graphql/enums";

export type TitleInput =
  | {
      romaji?: string | null;
      english?: string | null;
      native?: string | null;
    }
  | null
  | undefined;

// Stylised variants collapse to their base: the app only fetches
// non-stylised fields. With no preference (guest), the device locale decides.
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
  return resolveNameLanguage(staffNameLanguage) === "NATIVE"
    ? (name.native ?? name.full ?? undefined)
    : (name.full ?? name.native ?? undefined);
}

// ROMAJI_WESTERN reorders the same romaji parts AniList already bakes into
// `full`, so it reads as ROMAJI.
export function resolveNameLanguage(
  staffNameLanguage: UserStaffNameLanguage | null | undefined,
): "ROMAJI" | "NATIVE" {
  return staffNameLanguage === "NATIVE" ? "NATIVE" : "ROMAJI";
}
