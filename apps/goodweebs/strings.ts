import toTitleCase from "title";

export enum StringCase {
  TITLE,
  UPPER,
  LOWER,
  SOURCE,
}

// hi chat
const _en_us = {
  AniListAuthAttribution: "via AniList",
  tagline: "An anime tracking app powered by AniList and Expo.",
  logIn: "Log in",
  signUp: "Sign up",
  anime: "anime",
  airing: "airing",
  history: "history",
  broadcastHistory: "Broadcast history",
  discover: "discover",
  profile: "profile",
  details: "details",
  settings: "settings",
  goodweebs: "Goodweebs",
};

type StringNames = keyof typeof _en_us;

type StringDefinitions = {
  [p in StringNames]: string;
};

export const en_us: StringDefinitions = _en_us;

export function getString(
  stringName: StringNames,
  stringCase: StringCase = StringCase.SOURCE
) {
  const stringText = en_us[stringName];

  switch (stringCase) {
    case StringCase.UPPER:
      return stringText.toLocaleUpperCase();
    case StringCase.LOWER:
      return stringText.toLocaleLowerCase();
    case StringCase.TITLE:
      return toTitleCase(stringText);
    default:
      return stringText;
  }
}
