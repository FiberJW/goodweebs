import type { MediaSortField, SortDirection } from "yep/constants";
import type {
  MediaListSort,
  MediaType,
  UserTitleLanguage,
} from "yep/graphql/enums";
import { resolveTitleLanguage } from "yep/titleName";

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

// Cache identity for a root Page container (wired up as the Page keyArgs in
// graphql/client.ts). Paginated lists fetchMore over Page, so a container must
// be ONE cache object per query identity, never per page — pages merge inside
// it (see the field policies) and pageInfo.hasNextPage always reflects the
// newest page. Hence `page` is excluded from every key.
export function pageContainerKey(
  args: Record<string, unknown> | null,
  variables?: Record<string, unknown>,
): string {
  // Activity feeds: one container per scope (profile activity, and the feed's
  // following/global/mine scopes — perPage keeps the 10-row profile strip and
  // the 25-row feed apart).
  if (variables?.activityType != null) {
    return `activities:${variables.activityType}:${variables.userId ?? "global"}:${variables.isFollowing ?? false}:${variables.perPage ?? "default"}`;
  }
  if (variables?.userId != null && variables?.status != null) {
    return `mediaList:${variables.type}:${variables.userId}:${variables.status}:${JSON.stringify(variables.sort ?? null)}`;
  }
  // User search has no `type` variable; keyed explicitly so a future search
  // query that also omits `type` can't silently share its container.
  if (variables?.search != null && variables?.type == null) {
    return `userSearch:${variables.search}`;
  }
  // Search containers are per-type-and-term: pageInfo.hasNextPage
  // must track the term (and not collide with trending's container).
  if (variables?.search != null) {
    return `search:${variables.type}:${variables.search}`;
  }
  // The notifications screen: one container, keyed apart from
  // trending/search so their pageInfo never clobbers each other.
  if (variables?.reset != null) {
    return "notifications";
  }
  // Trending: one container per media type (the discover toggle
  // flips between them, and each paginates independently).
  if (variables?.type != null) {
    return `trending:${variables.type}`;
  }
  return JSON.stringify({ ...args, page: undefined });
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

// Sort titles by the same language getTitle displays (resolveTitleLanguage), so
// a title-sorted list stays alphabetical in whatever language is on screen.
// Literals are spelled out per direction (not "_DESC"-appended) so each stays
// checked against the MediaListSort enum. AniList coalesces null titles to
// romaji when sorting, matching getTitle's fallback closely enough for order.
export function titleSort(
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
// AniList field is BASE (ascending) / BASE_DESC, spelled out so the values stay
// checked against the enum; TITLE delegates to titleSort (viewer-language-aware).
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
