import type { GetAnimeListQuery, MediaListSort } from "./generated";

export const ANIME_LIST_PER_PAGE = 50;


// The next page is derived from how many entries are loaded (instead of
// tracked in state), so it self-heals when a refetch or status change resets
// the cache back to page 1.
export function nextPageToRequest(
  data: GetAnimeListQuery | undefined,
): number {
  const loaded = (data?.Page?.mediaList ?? []).length;
  return Math.floor(loaded / ANIME_LIST_PER_PAGE) + 1;
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
// everyone else shows english ?? romaji.
export function titleSortForLocale(locale: string | undefined): MediaListSort {
  return locale === "ja_JP" ? "MEDIA_TITLE_NATIVE" : "MEDIA_TITLE_ENGLISH";
}
