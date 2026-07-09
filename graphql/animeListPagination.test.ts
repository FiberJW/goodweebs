import { describe, expect, test } from "bun:test";

import {
  ANIME_LIST_PER_PAGE,
  mediaSortValue,
  mergeMediaListPages,
  nextPageForCount,
  pageContainerKey,
  titleSort,
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

describe("pageContainerKey", () => {
  test("feed scopes get distinct containers (never cross-contaminate)", () => {
    const key = (variables: Record<string, unknown>) =>
      pageContainerKey(null, variables);
    const following = key({
      activityType: "MEDIA_LIST",
      isFollowing: true,
      page: 1,
      perPage: 25,
    });
    const global = key({ activityType: "MEDIA_LIST", page: 1, perPage: 25 });
    const personal = key({
      activityType: "MEDIA_LIST",
      page: 1,
      perPage: 25,
      userId: 42,
    });
    const profileStrip = key({
      activityType: "MEDIA_LIST",
      page: 1,
      perPage: 10,
      userId: 42,
    });
    expect(new Set([following, global, personal, profileStrip]).size).toBe(4);
  });

  test("page number never changes a container's identity", () => {
    expect(
      pageContainerKey(null, { activityType: "MEDIA_LIST", page: 3, perPage: 25 }),
    ).toBe(
      pageContainerKey(null, { activityType: "MEDIA_LIST", page: 1, perPage: 25 }),
    );
    expect(pageContainerKey({ page: 2 }, {})).toBe(
      pageContainerKey({ page: 1 }, {}),
    );
  });

  test("user search (no type variable) is keyed apart from media search and trending", () => {
    const userSearch = pageContainerKey(null, { search: "guts" });
    const mediaSearch = pageContainerKey(null, { search: "guts", type: "ANIME" });
    const trending = pageContainerKey(null, { type: "ANIME" });
    expect(new Set([userSearch, mediaSearch, trending]).size).toBe(3);
  });

  test("media lists key on user, status, and sort; notifications stand alone", () => {
    const list = (sort: string[]) =>
      pageContainerKey(null, {
        sort,
        status: "CURRENT",
        type: "ANIME",
        userId: 42,
      });
    expect(list(["SCORE_DESC"])).not.toBe(list(["UPDATED_TIME_DESC"]));
    expect(pageContainerKey(null, { reset: true })).toBe("notifications");
  });
});

describe("titleSort", () => {
  test("no account preference falls back to the device locale", () => {
    expect(titleSort("ja_JP", null, "ASC")).toBe("MEDIA_TITLE_NATIVE");
    expect(titleSort("en_US", null, "ASC")).toBe("MEDIA_TITLE_ENGLISH");
    expect(titleSort(undefined, undefined, "ASC")).toBe("MEDIA_TITLE_ENGLISH");
  });

  test("account preference wins over locale, per direction", () => {
    // en_US locale would sort by english; the ROMAJI account setting overrides.
    expect(titleSort("en_US", "ROMAJI", "ASC")).toBe("MEDIA_TITLE_ROMAJI");
    expect(titleSort("en_US", "NATIVE", "DESC")).toBe("MEDIA_TITLE_NATIVE_DESC");
    // Stylised variants collapse to their base.
    expect(titleSort("ja_JP", "ENGLISH_STYLISED", "ASC")).toBe(
      "MEDIA_TITLE_ENGLISH",
    );
  });

  test("mediaSortValue routes TITLE through the viewer language", () => {
    expect(mediaSortValue("TITLE", "ASC", "en_US", "NATIVE")).toBe(
      "MEDIA_TITLE_NATIVE",
    );
    // Non-title fields ignore locale/language.
    expect(mediaSortValue("SCORE", "DESC", "ja_JP", "NATIVE")).toBe(
      "SCORE_DESC",
    );
  });
});
