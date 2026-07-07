# Notifications Screen — Design

**Date:** 2026-07-07
**Status:** Approved

## Summary

A screen listing the viewer's AniList anime notifications — airing episodes and
related-media additions — each row linking to the anime's details screen.
Opened from a bell icon in the Anime tab header, with an unread-count badge.

Out of scope: follow/social notifications, manga notifications, push
notifications, per-item mark-as-read, notification settings.

## Route & entry point

- New stack screen `app/notifications.tsx`, registered in the root layout's
  `Stack.Protected` (logged-in) group with the same header styling as
  `settings`.
- The Anime tab's `Header` gets a `rightSlot` bell (`PressableOpacity` +
  icon) that pushes `/notifications`. Hidden when `!accessToken` (guests have
  no notifications).
- No bell asset exists yet: add `assets/icons/navigation/bell.png`
  (@1x/@2x/@3x), same monochrome style and 24pt render size as
  `settings-gear.png`, tinted white like the Profile header's gear.

## Data

New `graphql/queries/Notifications.graphql`:

```graphql
query GetNotifications($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      hasNextPage
    }
    notifications(
      type_in: [AIRING, RELATED_MEDIA_ADDITION]
      resetNotificationCount: true
    ) {
      ... on AiringNotification {
        id
        episode
        contexts
        createdAt
        media {
          id
          type
          title {
            romaji
            native
            english
          }
          coverImage {
            medium
            large
          }
        }
      }
      ... on RelatedMediaAdditionNotification {
        id
        context
        createdAt
        media {
          id
          type
          title {
            romaji
            native
            english
          }
          coverImage {
            medium
            large
          }
        }
      }
    }
  }
}
```

- `resetNotificationCount: true` on every fetch (pages 2+ re-resetting is
  harmless).
- Cache: add a `notifications` field policy on `Page` in `graphql/client.ts`
  with the same append-merge + contiguity-guard pattern as `mediaList` and
  `media`, `keyArgs: ["type_in"]`. The existing `Query.Page` container
  keyArgs function's default branch already keys this container correctly.
- Pagination via the shared `useLoadNextPage`; pull-to-refresh bound to
  `networkStatus === NetworkStatus.refetch` with fire-and-forget `refetch`
  (the established pattern).

## UI

- `FlatList` of rows. Each row:
  - Poster thumbnail: `PosterAndTitle` size `tiny` with `coverImage.medium`.
  - Text assembled from AniList's `contexts` (airing: episode number spliced
    between context fragments) or `context` (related addition), with the
    locale-aware title from `useGetTitle`.
  - Relative timestamp from `createdAt` via `formatDistanceToNow` with the
    date-fns locale (matches the ja_JP localization work).
  - Tap → `router.push(\`/details/${media.id}\`)`.
- Client-side filtering: drop rows with `media.type !== "ANIME"`
  (related-media additions can reference manga) and rows with null media.
- Empty state: existing `EmptyState` component. First-load state: plain
  `ActivityIndicator` (no new skeleton component in v1). Failed first load:
  `EmptyState` with the error message (same shape as details/character
  screens); network errors also surface via the global onError toast.

## Unread badge & reset

- Add `unreadNotificationCount` to the existing `GetViewer` query.
- The bell shows a small count badge when the cached count is `> 0`.
- Opening the screen resets the server count (query arg above); on mount the
  screen also `cache.modify`s the viewer's `unreadNotificationCount` to `0`
  so the badge clears immediately without refetching the viewer.

## i18n

- New UI labels (screen title, empty-state copy) go through `fbs` as usual.
- AniList's `contexts`/`context` strings are English-only API data; v1
  renders them as-is (the official AniList apps do the same).

## Verification

- `bunx tsc --noEmit`, eslint, and `bun run gql` (codegen) all clean.
- Drive the flow in the iOS simulator with the test account: badge shows,
  screen lists notifications, tapping a row lands on the right details
  screen, badge clears after opening.
