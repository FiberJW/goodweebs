import type { MediaSortField, SortDirection } from "yep/constants";
import type { MediaListSort, MediaType } from "yep/graphql/enums";

export const ANIME_LIST_PER_PAGE = 50;


// The next page is derived from how many entries are loaded (instead of
// tracked in state), so it self-heals when a refetch or status change resets
// the cache back to page 1. Ceil (not floor): when a page merge nets fewer
// than perPage new entries (an entry shifted across a page boundary between
// fetches, so dedupe dropped a duplicate), floor would re-request the same
// page forever; ceil advances past it, guaranteeing progress.
export function nextPageForCount(
  loaded: number,
  perPage: number = ANIME_LIST_PER_PAGE,
): number {
  return Math.ceil(loaded / perPage) + 1;
}

// Cache-layer page merge for Page.mediaList (wired up in graphql/client.ts).
// `entryId` is injectable because inside Apollo's cache the entries are
// normalized References ({ __ref: "MediaList:123" }), not plain objects — the
// typePolicy passes a readField-based accessor. Dedupes by entry id so a
// repeated page fetch is idempotent.
export function mergeMediaListPages<T>(
  existing: readonly T[] | null | undefined,
  incoming: readonly T[],
  entryId: (entry: unknown) => unknown = (e) =>
    (e as { id?: number } | null)?.id,
): T[] {
  const merged = [...(existing ?? [])];
  const seen = new Set(merged.map((e) => entryId(e)));
  for (const entry of incoming) {
    const id = entryId(entry);
    if (id == null || !seen.has(id)) {
      merged.push(entry);
      seen.add(id);
    }
  }
  return merged;
}

// Matches getTitle's display fallback (utils.tsx): ja_JP shows native titles,
// everyone else shows english ?? romaji. AniList coalesces null titles to
// romaji server-side when sorting (verified against the live API), so
// MEDIA_TITLE_ENGLISH already sorts by english ?? romaji.
export function titleSortForLocale(locale: string | undefined): MediaListSort {
  return locale === "ja_JP" ? "MEDIA_TITLE_NATIVE" : "MEDIA_TITLE_ENGLISH";
}

// Fields offered in the sort sheet, in display order. Volume progress is
// manga-only (anime has no volumes).
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

// Direction a field defaults to when first picked: title reads A→Z, everything
// else is more useful highest/newest-first. The toggle flips from here.
export function naturalSortDirection(field: MediaSortField): SortDirection {
  return field === "TITLE" ? "ASC" : "DESC";
}

// The server does the sorting (paginated pages must keep a stable order). Each
// AniList field is BASE (ascending) / BASE_DESC; both are spelled out (rather
// than string-appending "_DESC") so the values stay checked against the enum.
// TITLE's base is locale-aware.
export function mediaSortValue(
  field: MediaSortField,
  direction: SortDirection,
  locale: string | undefined,
): MediaListSort {
  const ascending: Record<MediaSortField, MediaListSort> = {
    TITLE: titleSortForLocale(locale),
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
    TITLE:
      locale === "ja_JP"
        ? "MEDIA_TITLE_NATIVE_DESC"
        : "MEDIA_TITLE_ENGLISH_DESC",
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
