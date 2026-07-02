# AnimeList Chunk Pagination + Infinite Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Anime tab's first paint fast by fetching `MediaListCollection` in 50-entry chunks, loading further chunks via infinite scroll.

**Architecture:** Add `chunk`/`perChunk`/`hasNextChunk` to the existing `GetAnimeList` query. Merge chunks client-side with `fetchMore` + `updateQuery` (no Apollo typePolicy — merging inside the nested `lists[].entries` shape is simpler as a pure function). Sorting moves server-side (`MediaListSort` title sort matched to locale) because the current client-side `sortBy` would splice appended chunks into the middle of the list and make rows jump mid-scroll. The next chunk number is *derived from data* (`entriesLoaded / perChunk + 1`), not stored in state, so it self-heals when a background `cache-and-network` refetch resets the cache to chunk 1.

**Tech Stack:** Expo / React Native, Apollo Client 3.12.11 (pinned), graphql-codegen (`bun run gql`), bun's built-in test runner (`bun test`), AniList GraphQL API.

## Global Constraints

- Package manager / runner is **bun** (`bun run gql`, `bun run lint`, `bun test`). No new dependencies.
- **Never include Claude/Anthropic attributions in git commits.**
- AniList rate limit is 30 req/min (degraded mode); `RetryLink` in `graphql/client.ts` already handles 429s — do not add extra rate-limit handling.
- Pull-to-refresh pattern (do not break): `RefreshControl.refreshing` binds to `networkStatus === NetworkStatus.refetch`; `onRefresh` is fire-and-forget (never `await refetch()`).
- React Compiler is enabled; the `react-doctor/jsx-no-jsx-as-prop` eslint rule fires on JSX-valued props — pass component references (not inline elements) to `ListFooterComponent` etc.
- `yep/*` is the repo's path alias for the project root (see existing imports).
- The AniList schema already supports this: `MediaListCollection(chunk: Int, perChunk: Int)` args and `hasNextChunk: Boolean` exist in `graphql/generated.ts` (lines ~1550, ~3198).

---

### Task 1: Chunked query + codegen

**Files:**
- Modify: `graphql/queries/AnimeList.graphql`
- Regenerate: `graphql/generated.ts` (via `bun run gql`)

**Interfaces:**
- Produces: `GetAnimeListQueryVariables` gains `sort`, `chunk` (default 1), `perChunk` (default 50); `GetAnimeListQuery["MediaListCollection"]` gains `hasNextChunk?: boolean | null`. Task 2 and Task 3 rely on these generated types.

- [ ] **Step 1: Replace the query file**

Replace the entire contents of `graphql/queries/AnimeList.graphql` with:

```graphql
# Chunked: first paint is one fast 50-entry request; later chunks stream in
# via fetchMore on infinite scroll (app/(tabs)/anime.tsx). Sort is server-side
# so appended chunks keep a stable order.
query GetAnimeList(
  $userId: Int
  $status: MediaListStatus
  $sort: [MediaListSort]
  $chunk: Int = 1
  $perChunk: Int = 50
) {
  MediaListCollection(
    userId: $userId
    type: ANIME
    status: $status
    sort: $sort
    chunk: $chunk
    perChunk: $perChunk
  ) {
    hasNextChunk
    lists {
      status
      name
      isCustomList
      entries {
        id
        media {
          ...AnimeListEntryFragment
        }
      }
    }
  }
}
```

(The old `# ponytail: accepts AniList's 500-entries-per-status cap` comment is intentionally deleted — the cap no longer applies.)

- [ ] **Step 2: Regenerate types**

Run: `bun run gql`
Expected: exits 0; `graphql/generated.ts` changes.

- [ ] **Step 3: Verify generated output**

Run: `grep -n "hasNextChunk" graphql/generated.ts | grep -i "GetAnimeList" ; grep -n "GetAnimeListQueryVariables" -A 8 graphql/generated.ts | head -12`
Expected: `GetAnimeListQuery` type includes `hasNextChunk?: boolean | null`; variables type includes `sort`, `chunk`, `perChunk`.

- [ ] **Step 4: Commit**

```bash
git add graphql/queries/AnimeList.graphql graphql/generated.ts
git commit -m "Add chunk pagination variables to GetAnimeList query"
```

---

### Task 2: Pure chunk-merge helpers (TDD)

**Files:**
- Create: `graphql/animeListChunks.ts`
- Test: `graphql/animeListChunks.test.ts`

**Interfaces:**
- Consumes: `GetAnimeListQuery`, `MediaListSort` types from `graphql/generated.ts` (Task 1) — **`import type` only** so `bun test` never executes Apollo/React code.
- Produces (used verbatim by Task 3):
  - `ANIME_LIST_PER_CHUNK: 50`
  - `mergeAnimeListChunks(prev: GetAnimeListQuery, next: GetAnimeListQuery): GetAnimeListQuery`
  - `nextChunkToRequest(data: GetAnimeListQuery | undefined): number`
  - `titleSortForLocale(locale: string | undefined): MediaListSort`

- [ ] **Step 1: Write the failing tests**

Create `graphql/animeListChunks.test.ts`:

```ts
import { describe, expect, test } from "bun:test";

import type { GetAnimeListQuery } from "./generated";

import {
  ANIME_LIST_PER_CHUNK,
  mergeAnimeListChunks,
  nextChunkToRequest,
  titleSortForLocale,
} from "./animeListChunks";

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test graphql/animeListChunks.test.ts`
Expected: FAIL — `Cannot find module './animeListChunks'` (or equivalent resolve error).

- [ ] **Step 3: Write the implementation**

Create `graphql/animeListChunks.ts`:

```ts
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

  for (const group of next.MediaListCollection.lists ?? []) {
    if (!group) continue;
    const existing = merged.find((g) => g && groupKey(g) === groupKey(group));
    if (!existing) {
      merged.push(group);
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test graphql/animeListChunks.test.ts`
Expected: PASS — 8 tests.

- [ ] **Step 5: Lint and commit**

```bash
bun run lint
git add graphql/animeListChunks.ts graphql/animeListChunks.test.ts
git commit -m "Add chunk-merge helpers for anime list pagination"
```

---

### Task 3: Wire infinite scroll into the Anime tab

**Files:**
- Modify: `app/(tabs)/anime.tsx`

**Interfaces:**
- Consumes: `ANIME_LIST_PER_CHUNK`, `mergeAnimeListChunks`, `nextChunkToRequest`, `titleSortForLocale` from `yep/graphql/animeListChunks` (Task 2); regenerated `useGetAnimeListQuery` (Task 1).

- [ ] **Step 1: Update imports**

In `app/(tabs)/anime.tsx`:

Remove:
```ts
import sortBy from "lodash/sortBy";
```

Change the react-native import to include `ActivityIndicator`:
```ts
import {
  ActivityIndicator,
  RefreshControl,
  View,
  StyleSheet,
  Text,
  FlatList,
} from "react-native";
```

Add (alongside the other `yep/` imports):
```ts
import {
  ANIME_LIST_PER_CHUNK,
  mergeAnimeListChunks,
  nextChunkToRequest,
  titleSortForLocale,
} from "yep/graphql/animeListChunks";
import { useLocaleContext } from "yep/i18n/LocaleContext";
```

- [ ] **Step 2: Add a module-level footer spinner component**

Add above `export default function Anime()` (a component reference, not an inline JSX prop, so `react-doctor/jsx-no-jsx-as-prop` stays quiet):

```tsx
function ListFooterSpinner() {
  return (
    <ActivityIndicator color={darkTheme.text} style={styles.footerSpinner} />
  );
}
```

And add to the `StyleSheet.create` block at the bottom of the file:

```ts
footerSpinner: {
  paddingVertical: 16,
},
```

- [ ] **Step 3: Pass sort/perChunk variables and grab fetchMore**

Inside `Anime()`, replace the `const getTitle = useGetTitle();` line (line 92 — its only consumer was the `sortBy` callback removed in Step 4) with:

```ts
const { locale } = useLocaleContext();
```

Also remove `useGetTitle` from the `yep/utils` import, keeping `getMediaListStatusLabel` and `notEmpty`.

Replace the `useGetAnimeListQuery` call (currently lines 99–112) with:

```ts
const {
  loading: loadingAnimeList,
  data: animeListData,
  refetch,
  fetchMore,
  networkStatus,
} = useGetAnimeListQuery({
  skip: !viewerData?.Viewer?.id || !accessToken,
  variables: {
    userId: viewerData?.Viewer?.id,
    status,
    sort: [titleSortForLocale(locale)],
    perChunk: ANIME_LIST_PER_CHUNK,
  },
  fetchPolicy: "cache-and-network",
  notifyOnNetworkStatusChange: true,
});
```

(Do not pass `chunk` — the query's `$chunk: Int = 1` default covers the base request, and `refetch`/status changes therefore always restart at chunk 1. The existing `onRefresh` call `refetch({ userId, status })` also stays as-is: Apollo merges partial refetch variables over the current ones, so `sort`/`perChunk` are preserved.)

- [ ] **Step 4: Replace the client-side sort with the server-sorted flatMap**

Replace the `const list = sortBy(...)` block (currently lines 114–124) with:

```ts
// A user with custom lists or "Split completed list by format" gets several
// groups back; merge the non-custom ones (custom lists duplicate entries that
// already live in a status group) instead of showing an arbitrary lists[0].
// Sort is server-side (title sort matching the locale) so chunks appended by
// fetchMore keep a stable order — a client re-sort would reshuffle rows
// mid-scroll. ponytail: split-completed users see per-format groups
// concatenated rather than one merged A–Z; client-merge after the last chunk
// if anyone complains.
const list = (animeListData?.MediaListCollection?.lists ?? []).flatMap(
  (group) =>
    group && !group.isCustomList
      ? (group.entries ?? []).filter(notEmpty)
      : [],
);
```

- [ ] **Step 5: Add the fetch-more handler**

Add after the `const isRefetching = ...` line:

```ts
const hasNextChunk = Boolean(
  animeListData?.MediaListCollection?.hasNextChunk,
);
const isFetchingMore = networkStatus === NetworkStatus.fetchMore;

// Fire-and-forget, like onRefresh — never awaited.
function loadNextChunk() {
  if (!hasNextChunk || isFetchingMore || refreshing) return;
  fetchMore({
    variables: { chunk: nextChunkToRequest(animeListData) },
    updateQuery: (prev, { fetchMoreResult }) =>
      fetchMoreResult ? mergeAnimeListChunks(prev, fetchMoreResult) : prev,
  });
}
```

- [ ] **Step 6: Hook up the outer FlatList**

On the **outer** `FlatList` (the one with `data={listRows}`, not the horizontal status-chip list), add three props next to `renderItem`:

```tsx
onEndReached={loadNextChunk}
onEndReachedThreshold={0.5}
ListFooterComponent={isFetchingMore ? ListFooterSpinner : null}
```

- [ ] **Step 7: Lint and type-check**

Run: `bun run lint && bunx tsc --noEmit`
Expected: both exit 0 (the pre-existing `react-doctor/jsx-no-jsx-as-prop` suppression on RefreshControl is unchanged; no new warnings).

- [ ] **Step 8: Commit**

```bash
git add "app/(tabs)/anime.tsx"
git commit -m "Load anime list in chunks with infinite scroll"
```

---

### Task 4: Manual verification on the simulator

**Files:**
- Temporarily modify (then revert): `graphql/animeListChunks.ts` (`ANIME_LIST_PER_CHUNK`)

The test account `goodweebstester` has small lists, so chunking won't trigger at 50. Use the serve-sim skill (see the `serve-sim-qa-driving-gotchas` memory: WS script for taps/drags; the dev bubble intercepts touches).

- [ ] **Step 1: Shrink the chunk size for testing**

In `graphql/animeListChunks.ts`, temporarily set:
```ts
export const ANIME_LIST_PER_CHUNK = 3;
```

- [ ] **Step 2: Run the QA pass**

Start the app on the iOS simulator (`serve-sim` skill), log in as `goodweebstester` if needed, then verify on the Anime tab:

1. First paint shows only the first 3 entries of the CURRENT list quickly (no full-list wait).
2. Scrolling to the bottom shows the footer spinner and appends the next 3; repeat until `hasNextChunk` is exhausted; no duplicate-key warnings in the logs.
3. Row order is stable while chunks append (no reshuffle) and matches the displayed titles alphabetically. **If entries with a null English title cluster wrongly** (AniList's `MEDIA_TITLE_ENGLISH` null ordering vs. our `english ?? romaji` display fallback), change `titleSortForLocale` to return `MEDIA_TITLE_ROMAJI` for non-`ja_JP` locales, update its test, and re-verify.
4. Pull-to-refresh resets to the first chunk, spinner clears on its own, and scrolling re-loads chunk 2.
5. Switching status chips resets to chunk 1 of the new status; switching back re-shows the cached list instantly, then background-refreshes to chunk 1 (list may shrink to one chunk — expected).
6. The title-count label reflects loaded entries (undercounts while `hasNextChunk` — accepted).

- [ ] **Step 3: Revert the chunk size**

Restore `export const ANIME_LIST_PER_CHUNK = 50;` and run `bun test graphql/animeListChunks.test.ts` (PASS expected).

- [ ] **Step 4: Commit anything that changed during verification**

Only if step 2's sort caveat forced the `MEDIA_TITLE_ROMAJI` change:

```bash
git add graphql/animeListChunks.ts graphql/animeListChunks.test.ts
git commit -m "Sort anime list by romaji title for non-Japanese locales"
```

---

## Accepted tradeoffs (do not "fix" these)

- **Count label undercounts** while more chunks remain — AniList gives no cheap total for `MediaListCollection`.
- **Split-completed users** see per-format groups concatenated (each internally sorted) instead of one merged A–Z list.
- **Tab revisit** background-refetches chunk 1 only, dropping deeper chunks until the user scrolls again — standard infinite-scroll behavior.
- **No prefetch of chunk 2** — add only if first-paint-then-pause feels bad in real use.
