import { MediaListStatus, MediaListSort } from "yep/graphql/generated";

export const ANILIST_ACCESS_TOKEN_STORAGE = `com.goodweebs.app.access_token`;

export enum AniListClientID {
  SIMULATOR = 3549,
  CLIENT = 3559,
}

export const Statuses: { label: string; value: MediaListStatus }[] = [
  { label: "Watching", value: MediaListStatus.Current },
  { label: "On Hold", value: MediaListStatus.Paused },
  { label: "Plan to Watch", value: MediaListStatus.Planning },
  { label: "Dropped", value: MediaListStatus.Dropped },
  { label: "Completed", value: MediaListStatus.Completed },
];

export const Sorts: { label: string; value: MediaListSort }[] = [
  { label: "Title", value: MediaListSort.MediaTitleEnglish },
  { label: "Highest Rated", value: MediaListSort.ScoreDesc },
  { label: "Lowest Rated", value: MediaListSort.Score },
  { label: "Last Updated", value: MediaListSort.UpdatedTimeDesc },
];
