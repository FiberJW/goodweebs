# Goal prompt: AnimeList chunk pagination + infinite scroll

Copy-paste this to a fresh Claude Code session in the goodweebs repo:

---

Implement the plan at `docs/superpowers/plans/2026-07-03-animelist-chunk-pagination.md` task-by-task using the superpowers:executing-plans skill (or superpowers:subagent-driven-development).

**Goal:** The Anime tab currently fetches the user's entire AniList `MediaListCollection` for a status in one request (up to 500 entries), which makes first load slow for big lists. Change it to fetch 50-entry chunks — first chunk on mount, later chunks via infinite scroll (`onEndReached` → `fetchMore` + `updateQuery`), with server-side title sort so appended chunks never reshuffle the list.

**Success criteria:**
- `bun test graphql/animeListChunks.test.ts` passes (new pure-helper tests).
- `bun run lint` and `bunx tsc --noEmit` are clean.
- Manual QA per Task 4 of the plan (temporarily shrink `ANIME_LIST_PER_CHUNK` to 3, drive the simulator with the serve-sim skill, test account `goodweebstester`): fast first paint, footer spinner + append on scroll, stable order, pull-to-refresh resets to chunk 1, status-chip switching works.

**Constraints (also in the plan's Global Constraints — read them first):**
- bun for everything; no new dependencies; no Claude/Anthropic attribution in commits.
- Don't break the RefreshControl pattern: `refreshing` binds to `networkStatus === NetworkStatus.refetch`, `onRefresh` is fire-and-forget.
- Pass component references (not inline JSX) to `ListFooterComponent` — the `react-doctor/jsx-no-jsx-as-prop` rule is active.
- The plan contains exact code for every step; follow it, and honor the "Accepted tradeoffs" section at the bottom — those are deliberate, don't fix them.
