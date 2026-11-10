import { fbs } from "fbtee";

import type {
  MediaListSort,
  MediaType,
  UserTitleLanguage,
} from "yep/graphql/enums";
import { setting } from "yep/storage";
import { resolveTitleLanguage } from "yep/titleName";

// Fields, not raw MediaListSort values: TITLE depends on the viewer's title
// language, and the ASC/DESC split is resolved at query time.
type MediaSortField =
  | "TITLE"
  | "SCORE"
  | "PROGRESS"
  | "POPULARITY"
  | "UPDATED"
  | "ADDED"
  | "STARTED"
  | "FINISHED"
  | "VOLUME_PROGRESS"; // manga only

type SortDirection = "ASC" | "DESC";

export const SortSettings = {
  field: setting<MediaSortField>("MEDIA_LIST_SORT_FIELD", "UPDATED"),
  direction: setting<SortDirection>("MEDIA_LIST_SORT_DIRECTION", "DESC"),
};

// AniList coalesces null titles to romaji when sorting, which matches
// getTitle's fallback closely enough for order.
function titleSort(
  locale: string | undefined,
  titleLanguage: UserTitleLanguage | null | undefined,
  direction: SortDirection,
): MediaListSort {
  switch (resolveTitleLanguage(locale, titleLanguage)) {
    case "ROMAJI":
      return direction === "DESC"
        ? "MEDIA_TITLE_ROMAJI_DESC"
        : "MEDIA_TITLE_ROMAJI";
    case "ENGLISH":
      return direction === "DESC"
        ? "MEDIA_TITLE_ENGLISH_DESC"
        : "MEDIA_TITLE_ENGLISH";
    case "NATIVE":
      return direction === "DESC"
        ? "MEDIA_TITLE_NATIVE_DESC"
        : "MEDIA_TITLE_NATIVE";
  }
}

export function mediaSortFields(mediaType: MediaType): MediaSortField[] {
  const fields: MediaSortField[] = [
    "TITLE",
    "SCORE",
    "PROGRESS",
    "POPULARITY",
    "UPDATED",
    "ADDED",
    "STARTED",
    "FINISHED",
  ];
  return mediaType === "MANGA" ? [...fields, "VOLUME_PROGRESS"] : fields;
}

export function naturalSortDirection(field: MediaSortField): SortDirection {
  return field === "TITLE" ? "ASC" : "DESC";
}

// The server sorts, so paginated pages keep a stable order.
export function mediaSortValue(
  field: MediaSortField,
  direction: SortDirection,
  locale: string | undefined,
  titleLanguage: UserTitleLanguage | null | undefined,
): MediaListSort {
  const ascending: Record<MediaSortField, MediaListSort> = {
    TITLE: titleSort(locale, titleLanguage, "ASC"),
    SCORE: "SCORE",
    PROGRESS: "PROGRESS",
    POPULARITY: "MEDIA_POPULARITY",
    UPDATED: "UPDATED_TIME",
    ADDED: "ADDED_TIME",
    STARTED: "STARTED_ON",
    FINISHED: "FINISHED_ON",
    VOLUME_PROGRESS: "PROGRESS_VOLUMES",
  };
  const descending: Record<MediaSortField, MediaListSort> = {
    TITLE: titleSort(locale, titleLanguage, "DESC"),
    SCORE: "SCORE_DESC",
    PROGRESS: "PROGRESS_DESC",
    POPULARITY: "MEDIA_POPULARITY_DESC",
    UPDATED: "UPDATED_TIME_DESC",
    ADDED: "ADDED_TIME_DESC",
    STARTED: "STARTED_ON_DESC",
    FINISHED: "FINISHED_ON_DESC",
    VOLUME_PROGRESS: "PROGRESS_VOLUMES_DESC",
  };
  return direction === "DESC" ? descending[field] : ascending[field];
}

export function getMediaSortFieldLabel(field: MediaSortField): string {
  switch (field) {
    case "TITLE":
      return String(fbs("Title", "Media list sort by title"));
    case "SCORE":
      return String(fbs("Score", "Media list sort by score"));
    case "PROGRESS":
      return String(fbs("Progress", "Media list sort by progress"));
    case "POPULARITY":
      return String(fbs("Popularity", "Media list sort by popularity"));
    case "UPDATED":
      return String(fbs("Last updated", "Media list sort by last updated"));
    case "ADDED":
      return String(fbs("Date added", "Media list sort by date added"));
    case "STARTED":
      return String(fbs("Start date", "Media list sort by start date"));
    case "FINISHED":
      return String(fbs("Finish date", "Media list sort by finish date"));
    case "VOLUME_PROGRESS":
      return String(
        fbs("Volume progress", "Media list sort by volume progress"),
      );
  }
}
