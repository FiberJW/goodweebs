import { describe, expect, test } from "bun:test";

import {
  ANIME_LIST_PER_PAGE,
  mergeMediaListPages,
  nextPageForCount,
  titleSortForLocale,
} from "./animeListPagination";


function entry(id: number) {
  return { id, media: null };
}


describe("mergeMediaListPages", () => {
  test("appends the next page's entries in order", () => {
    expect(
      mergeMediaListPages([entry(1), entry(2)], [entry(3), entry(4)]).map(
        (e) => e.id,
      ),
    ).toEqual([1, 2, 3, 4]);
  });

  test("dedupes entries repeated across pages", () => {
    expect(
      mergeMediaListPages([entry(1), entry(2)], [entry(2), entry(3)]).map(
        (e) => e.id,
      ),
    ).toEqual([1, 2, 3]);
  });

  test("treats missing existing as empty", () => {
    expect(mergeMediaListPages(undefined, [entry(1)]).map((e) => e.id)).toEqual(
      [1],
    );
  });

  test("uses the injected entryId accessor (cache References)", () => {
    const ref = (id: number) => ({ __ref: `MediaList:${id}` });
    const idOf = (e: unknown) => (e as { __ref: string }).__ref;
    expect(
      mergeMediaListPages([ref(1)], [ref(1), ref(2)], idOf).map(
        (e) => e.__ref,
      ),
    ).toEqual(["MediaList:1", "MediaList:2"]);
  });
});

describe("nextPageForCount", () => {
  test("matches the page sequence for exact multiples", () => {
    expect(nextPageForCount(0)).toBe(1);
    expect(nextPageForCount(ANIME_LIST_PER_PAGE)).toBe(2);
    expect(nextPageForCount(ANIME_LIST_PER_PAGE * 2)).toBe(3);
  });

  test("rejects a stale deep page after a refetch reset (contiguity guard)", () => {
    // Container was reset to page 1 (50 rows) by pull-to-refresh; a late
    // page-3 response must not be treated as the next contiguous page.
    expect(nextPageForCount(ANIME_LIST_PER_PAGE)).not.toBe(3);
  });
});

describe("titleSortForLocale", () => {
  test("ja_JP sorts by native title, everything else by english", () => {
    expect(titleSortForLocale("ja_JP")).toBe("MEDIA_TITLE_NATIVE");
    expect(titleSortForLocale("en_US")).toBe("MEDIA_TITLE_ENGLISH");
    expect(titleSortForLocale(undefined)).toBe("MEDIA_TITLE_ENGLISH");
  });
});
