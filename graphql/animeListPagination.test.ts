import { describe, expect, test } from "bun:test";

import {
  ANIME_LIST_PER_PAGE,
  mergeMediaListPages,
  nextPageToRequest,
  titleSortForLocale,
} from "./animeListPagination";
import type { GetAnimeListQuery } from "./generated";


function entry(id: number) {
  return { id, media: null };
}

function page(ids: number[], hasNextPage = false): GetAnimeListQuery {
  return {
    Page: {
      pageInfo: { hasNextPage },
      mediaList: ids.map(entry),
    },
  } as GetAnimeListQuery;
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

describe("nextPageToRequest", () => {
  test("is 1 with no data", () => {
    expect(nextPageToRequest(undefined)).toBe(1);
  });

  test("advances once a full page is loaded", () => {
    const ids = Array.from({ length: ANIME_LIST_PER_PAGE }, (_, i) => i + 1);
    expect(nextPageToRequest(page(ids))).toBe(2);
  });

  test("stays on the current page while it is partially loaded", () => {
    expect(nextPageToRequest(page([1, 2, 3]))).toBe(1);
  });
});

describe("titleSortForLocale", () => {
  test("ja_JP sorts by native title, everything else by english", () => {
    expect(titleSortForLocale("ja_JP")).toBe("MEDIA_TITLE_NATIVE");
    expect(titleSortForLocale("en_US")).toBe("MEDIA_TITLE_ENGLISH");
    expect(titleSortForLocale(undefined)).toBe("MEDIA_TITLE_ENGLISH");
  });
});
