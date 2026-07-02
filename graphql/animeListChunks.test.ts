import { describe, expect, test } from "bun:test";

import {
  ANIME_LIST_PER_CHUNK,
  mergeAnimeListChunks,
  nextChunkToRequest,
  titleSortForLocale,
} from "./animeListChunks";
import type { GetAnimeListQuery } from "./generated";


function entry(id: number) {
  return { id, media: null };
}

function chunk(
  groups: {
    status?: string | null;
    name?: string | null;
    isCustomList?: boolean;
    ids: number[];
  }[],
  hasNextChunk = false,
): GetAnimeListQuery {
  return {
    MediaListCollection: {
      hasNextChunk,
      lists: groups.map((g) => ({
        status: (g.status ?? null) as never,
        name: g.name ?? null,
        isCustomList: g.isCustomList ?? false,
        entries: g.ids.map(entry),
      })),
    },
  } as GetAnimeListQuery;
}

describe("mergeAnimeListChunks", () => {
  test("appends next chunk's entries to the matching status group, in order", () => {
    const prev = chunk([{ status: "CURRENT", ids: [1, 2] }], true);
    const next = chunk([{ status: "CURRENT", ids: [3, 4] }], false);
    const merged = mergeAnimeListChunks(prev, next);
    expect(
      merged.MediaListCollection?.lists?.[0]?.entries?.map((e) => e?.id),
    ).toEqual([1, 2, 3, 4]);
  });

  test("hasNextChunk comes from the newest chunk", () => {
    const prev = chunk([{ status: "CURRENT", ids: [1] }], true);
    const next = chunk([{ status: "CURRENT", ids: [2] }], false);
    expect(
      mergeAnimeListChunks(prev, next).MediaListCollection?.hasNextChunk,
    ).toBe(false);
  });

  test("dedupes entries repeated across chunks", () => {
    const prev = chunk([{ status: "CURRENT", ids: [1, 2] }]);
    const next = chunk([{ status: "CURRENT", ids: [2, 3] }]);
    expect(
      mergeAnimeListChunks(prev, next).MediaListCollection?.lists?.[0]?.entries?.map(
        (e) => e?.id,
      ),
    ).toEqual([1, 2, 3]);
  });

  test("appends groups that only appear in a later chunk", () => {
    const prev = chunk([{ status: "COMPLETED", ids: [1] }]);
    const next = chunk([
      { status: "COMPLETED", ids: [2] },
      { status: null, name: "Faves", isCustomList: true, ids: [2] },
    ]);
    const merged = mergeAnimeListChunks(prev, next);
    expect(merged.MediaListCollection?.lists).toHaveLength(2);
    expect(merged.MediaListCollection?.lists?.[1]?.name).toBe("Faves");
  });
});

describe("nextChunkToRequest", () => {
  test("is 1 with no data", () => {
    expect(nextChunkToRequest(undefined)).toBe(1);
  });

  test("advances once a full chunk of non-custom entries is loaded", () => {
    const ids = Array.from({ length: ANIME_LIST_PER_CHUNK }, (_, i) => i + 1);
    const data = chunk([
      { status: "CURRENT", ids },
      // Custom lists duplicate entries; they must not skew the chunk math.
      { status: null, name: "Faves", isCustomList: true, ids },
    ]);
    expect(nextChunkToRequest(data)).toBe(2);
  });

  test("stays on the current chunk while it is partially loaded", () => {
    expect(nextChunkToRequest(chunk([{ status: "CURRENT", ids: [1, 2, 3] }]))).toBe(1);
  });
});

describe("titleSortForLocale", () => {
  test("ja_JP sorts by native title, everything else by english", () => {
    expect(titleSortForLocale("ja_JP")).toBe("MEDIA_TITLE_NATIVE");
    expect(titleSortForLocale("en_US")).toBe("MEDIA_TITLE_ENGLISH");
    expect(titleSortForLocale(undefined)).toBe("MEDIA_TITLE_ENGLISH");
  });
});
