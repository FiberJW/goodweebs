import Constants, { ExecutionEnvironment } from "expo-constants";

import type { MediaListStatus } from "yep/graphql/generated";

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
  { value: "CURRENT" },
  { value: "PAUSED" },
  { value: "PLANNING" },
  { value: "DROPPED" },
  { value: "COMPLETED" },
];
