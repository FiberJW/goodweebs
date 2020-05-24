import { MediaListStatus } from "yep/graphql/generated";

export const ANILIST_ACCESS_TOKEN_STORAGE = `com.goodweebs.app.access_token`;

export enum AniListClientID {
  SIMULATOR = 3549,
}

export const STATUSES: { label: string; value: MediaListStatus }[] = [
  { label: "Watching", value: MediaListStatus.Current },
  { label: "On Hold", value: MediaListStatus.Paused },
  { label: "Plan to Watch", value: MediaListStatus.Planning },
  { label: "Dropped", value: MediaListStatus.Dropped },
  { label: "Completed", value: MediaListStatus.Completed },
];
