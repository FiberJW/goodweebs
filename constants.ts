import Constants, { ExecutionEnvironment } from "expo-constants";

import type { MediaListStatus, ScoreFormat } from "yep/graphql/enums";

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

export const DEFAULT_SCORE_FORMAT: ScoreFormat = "POINT_10";

// Stepper bounds/step per AniList score format; the server stores raw 0–100
// and interprets `score` in the viewer's format, so no client-side conversion.
// ponytail: POINT_10_DECIMAL steps by 0.5, not 0.1 — 0.1 makes the stepper unusable.
export const ScoreFormatConfig: Record<
  ScoreFormat,
  { max: number; step: number }
> = {
  POINT_100: { max: 100, step: 1 },
  POINT_10_DECIMAL: { max: 10, step: 0.5 },
  POINT_10: { max: 10, step: 1 },
  POINT_5: { max: 5, step: 1 },
  POINT_3: { max: 3, step: 1 },
};

export const MediaListStatusWithLabel: {
  value: MediaListStatus;
}[] = [
  { value: "CURRENT" },
  { value: "PAUSED" },
  { value: "PLANNING" },
  { value: "DROPPED" },
  { value: "COMPLETED" },
];

// Sort is a field + a direction. The action sheet picks the field; a separate
// toggle flips the direction. Fields (not raw MediaListSort values) because
// TITLE is locale-aware and the enum's ASC/DESC split is resolved at query
// time — see mediaSortValue / mediaSortFields in graphql/animeListPagination.
export type MediaSortField =
  | "TITLE"
  | "SCORE"
  | "PROGRESS"
  | "POPULARITY"
  | "UPDATED"
  | "ADDED"
  | "STARTED"
  | "FINISHED"
  | "VOLUME_PROGRESS"; // manga only

export type SortDirection = "ASC" | "DESC";
