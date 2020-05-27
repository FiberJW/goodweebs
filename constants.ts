import Constants from "expo-constants";

import { MediaListStatus, MediaListSort } from "yep/graphql/generated";

enum AniListClientID {
  SIMULATOR = 3549,
  CLIENT = 3559,
  PROD = 3568,
}

export const CLIENT_ID = (() => {
  if (Constants.appOwnership === "standalone") {
    return AniListClientID.PROD;
  }

  if (__DEV__) {
    if (!Constants.isDevice) return AniListClientID.SIMULATOR;
    return AniListClientID.CLIENT;
  }

  return AniListClientID.CLIENT;
})();

export const ANILIST_ACCESS_TOKEN_STORAGE = `com.fiberjw.goodweebs.${CLIENT_ID}.access_token`;

export const Statuses: { label: string; value: MediaListStatus }[] = [
  { label: "Watching", value: MediaListStatus.Current },
  { label: "On Hold", value: MediaListStatus.Paused },
  { label: "Plan to Watch", value: MediaListStatus.Planning },
  { label: "Dropped", value: MediaListStatus.Dropped },
  { label: "Completed", value: MediaListStatus.Completed },
];

export const Sorts: { label: string; value: MediaListSort }[] = [
  // { label: "Title", value: MediaListSort.MediaTitleEnglish }, // Currently Bugged https://github.com/AniList/ApiV2-GraphQL-Docs/issues/94
  { label: "Last Updated", value: MediaListSort.UpdatedTimeDesc },
  { label: "Highest Rated", value: MediaListSort.ScoreDesc },
  { label: "Lowest Rated", value: MediaListSort.Score },
];
