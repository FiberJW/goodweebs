import type { GetAnimeListQuery, MediaListSort } from "./generated";

export const ANIME_LIST_PER_CHUNK = 50;

type ListGroup = NonNullable<
  NonNullable<GetAnimeListQuery["MediaListCollection"]>["lists"]
>[number];

function groupKey(group: NonNullable<ListGroup>) {
  return group.status ?? group.name ?? "";
}

// AniList chunks the user's raw entries; the non-custom status groups hold
// exactly those entries (custom lists only duplicate them), so the loaded
// non-custom count tells us which chunk to request next. Deriving it from
// data (instead of tracking state) self-heals when a background
// cache-and-network refetch resets the cache to chunk 1.
export function nextChunkToRequest(data: GetAnimeListQuery | undefined): number {
  const loaded = (data?.MediaListCollection?.lists ?? []).reduce(
    (sum, group) =>
      group && !group.isCustomList ? sum + (group.entries ?? []).length : sum,
    0,
  );
  return Math.floor(loaded / ANIME_LIST_PER_CHUNK) + 1;
}

export function mergeAnimeListChunks(
  prev: GetAnimeListQuery,
  next: GetAnimeListQuery,
): GetAnimeListQuery {
  if (!prev.MediaListCollection) return next;
  if (!next.MediaListCollection) return prev;

  const merged = (prev.MediaListCollection.lists ?? []).map((group) =>
    group ? { ...group, entries: [...(group.entries ?? [])] } : group,
  );

  const byKey = new Map<string, NonNullable<ListGroup>>();
  for (const g of merged) {
    if (g) byKey.set(groupKey(g), g);
  }

  for (const group of next.MediaListCollection.lists ?? []) {
    if (!group) continue;
    const existing = byKey.get(groupKey(group));
    if (!existing) {
      merged.push(group);
      byKey.set(groupKey(group), group);
      continue;
    }
    const seen = new Set((existing.entries ?? []).map((e) => e?.id));
    existing.entries = [
      ...(existing.entries ?? []),
      ...(group.entries ?? []).filter((e) => !e || !seen.has(e.id)),
    ];
  }

  return {
    ...next,
    MediaListCollection: { ...next.MediaListCollection, lists: merged },
  };
}

// Matches getTitle's display fallback (utils.tsx): ja_JP shows native titles,
// everyone else shows english ?? romaji.
export function titleSortForLocale(locale: string | undefined): MediaListSort {
  return locale === "ja_JP" ? "MEDIA_TITLE_NATIVE" : "MEDIA_TITLE_ENGLISH";
}
