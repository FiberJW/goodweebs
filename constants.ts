import Constants, { ExecutionEnvironment } from "expo-constants";

import {
  MediaListStatus,
  MediaListSort,
  MediaStatus,
} from "yep/graphql/generated";

// AniList Client IDs and their redirect URIs based on https://docs.expo.dev/guides/authentication/#redirect-uri-patterns
enum AniListClientID {
  DEV = 3549, // exp://localhost:19000/--/*
  EXPO_GO = 3559, // exp://exp.host/@fiberjw/goodweebs
  PROD = 3568, // goodweebs://redirect
}

export const CLIENT_ID = (() => {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return AniListClientID.EXPO_GO;
  }

  if (__DEV__) {
    return AniListClientID.DEV;
  }

  return AniListClientID.PROD;
})();

export const ANILIST_ACCESS_TOKEN_STORAGE = `com.fiberjw.goodweebs.${CLIENT_ID}.access_token`;

export const MediaListStatusWithLabel: {
  label: string;
  value: MediaListStatus;
}[] = [
  { label: "Watching", value: MediaListStatus.Current },
  { label: "On hold", value: MediaListStatus.Paused },
  { label: "Plan to watch", value: MediaListStatus.Planning },
  { label: "Dropped", value: MediaListStatus.Dropped },
  { label: "Completed", value: MediaListStatus.Completed },
];

export const MediaStatusWithLabel: {
  label: string;
  value: MediaStatus;
}[] = [
  { label: "Finished", value: MediaStatus.Finished },
  { label: "Currently releasing", value: MediaStatus.Releasing },
  { label: "Not yet released", value: MediaStatus.NotYetReleased },
  { label: "Cancelled", value: MediaStatus.Cancelled },
];

export const Sorts: { label: string; value: MediaListSort }[] = [
  // { label: "Title", value: MediaListSort.MediaTitleEnglish }, // Currently Bugged https://github.com/AniList/ApiV2-GraphQL-Docs/issues/94
  { label: "Last updated", value: MediaListSort.UpdatedTimeDesc },
  { label: "Highest rated", value: MediaListSort.ScoreDesc },
  { label: "Lowest rated", value: MediaListSort.Score },
];
