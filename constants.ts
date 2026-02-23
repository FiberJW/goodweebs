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
  value: MediaListStatus;
}[] = [
  { value: MediaListStatus.Current },
  { value: MediaListStatus.Paused },
  { value: MediaListStatus.Planning },
  { value: MediaListStatus.Dropped },
  { value: MediaListStatus.Completed },
];

export const MediaStatusWithLabel: {
  value: MediaStatus;
}[] = [
  { value: MediaStatus.Finished },
  { value: MediaStatus.Releasing },
  { value: MediaStatus.NotYetReleased },
  { value: MediaStatus.Cancelled },
];

export const Sorts: { value: MediaListSort }[] = [
  { value: MediaListSort.UpdatedTimeDesc },
  { value: MediaListSort.ScoreDesc },
  { value: MediaListSort.Score },
];
