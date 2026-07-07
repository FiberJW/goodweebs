# Notifications Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `/notifications` stack screen listing AniList AIRING + RELATED_MEDIA_ADDITION notifications (anime only), opened from a badged bell in the Anime tab header, each row linking to `/details/[id]`.

**Architecture:** One new paginated GraphQL query over `Page.notifications` reusing the existing cache-merge pagination machinery (`mergeMediaListPages`, `useLoadNextPage`, `networkStatus`-driven refresh). One new stack route + a bell `rightSlot` in the Anime tab's `Header`. Union types require adding `possibleTypes` to the Apollo cache.

**Tech Stack:** Expo Router (stack screen), Apollo Client 3.12 + graphql-codegen, fbtee i18n, date-fns locale from `yep/utils`.

**Spec:** `docs/superpowers/specs/2026-07-07-notifications-screen-design.md`

## Global Constraints

- Work on branch `notifications-screen` off `senpai`.
- Bump `version` in `app.config.ts` from `0.0.31` to `0.0.32` (repo convention: one patch bump per PR).
- All user-facing strings through `fbs(...)` with a description (fbtee).
- Imports use the `yep/` alias; follow existing eslint import order.
- No new dependencies.
- Verify each task with `bunx tsc --noEmit` and targeted `bunx eslint <files>`.
- Never use `git commit` without running the verification steps of the task first.

---

### Task 1: GraphQL documents + codegen

**Files:**
- Create: `graphql/queries/Notifications.graphql`
- Modify: `graphql/queries/Viewer.graphql` (add `unreadNotificationCount`)
- Generated: `graphql/generated.ts`, `graphql.schema.json` (via `bun run gql`)

**Interfaces:**
- Produces: `useGetNotificationsQuery`, `GetNotificationsQuery`, `GetNotificationsQueryVariables` generated types/hooks; `Viewer.unreadNotificationCount` on `GetViewerQuery`.

- [ ] **Step 1: Create the query document**

`graphql/queries/Notifications.graphql`:

```graphql
query GetNotifications($page: Int, $perPage: Int, $reset: Boolean) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      hasNextPage
    }
    notifications(
      type_in: [AIRING, RELATED_MEDIA_ADDITION]
      resetNotificationCount: $reset
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

(`$reset` is a variable, not a literal, so the cache keyArgs function can
detect this query by `variables.reset != null` — see Task 2.)

- [ ] **Step 2: Add the unread count to GetViewer**

In `graphql/queries/Viewer.graphql`, add one field to the Viewer selection
(after `bannerImage`):

```graphql
    unreadNotificationCount
```

- [ ] **Step 3: Run codegen**

Run: `bun run gql`
Expected: all `Generate` steps succeed; `graphql/generated.ts` gains `useGetNotificationsQuery`.

- [ ] **Step 4: Typecheck + commit**

Run: `bunx tsc --noEmit` → clean.

```bash
git add graphql/queries/Notifications.graphql graphql/queries/Viewer.graphql graphql/generated.ts graphql.schema.json
git commit -m "Add GetNotifications query and viewer unread count"
```

---

### Task 2: Apollo cache — union possibleTypes + notifications pagination

**Files:**
- Modify: `graphql/client.ts` (InMemoryCache config)

**Interfaces:**
- Consumes: `mergeMediaListPages`, `nextPageForCount` from `yep/graphql/animeListPagination` (already imported in the file).
- Produces: cached, append-merged `Page.notifications` under a stable `"notifications"` container key; inline-fragment reads on `NotificationUnion` work.

- [ ] **Step 1: Add possibleTypes to the InMemoryCache config**

The cache has never stored a union before. Without `possibleTypes`, Apollo
cannot match `... on AiringNotification` fragments when reading from cache.
Add to the `new InMemoryCache({ ... })` options, alongside `typePolicies`:

```ts
  // The notifications list is a union (NotificationUnion); the cache needs
  // the concrete object types to match inline fragments on reads. Only the
  // members we query are listed — add more if the query grows.
  possibleTypes: {
    NotificationUnion: [
      "AiringNotification",
      "RelatedMediaAdditionNotification",
    ],
  },
```

- [ ] **Step 2: Key the notifications Page container**

In the `Query.fields.Page.keyArgs` function, before the default
`JSON.stringify` return, add:

```ts
            // The notifications screen: one container, keyed apart from
            // trending/search so their pageInfo never clobbers each other.
            if (variables?.reset != null) {
              return "notifications";
            }
```

- [ ] **Step 3: Add the Page.notifications merge policy**

In `typePolicies.Page.fields`, alongside `mediaList` and `media`:

```ts
        // Same append-merge as mediaList/media: page 1 replaces, deeper
        // pages must be contiguous, dedupe by id.
        notifications: {
          keyArgs: ["type_in"],
          merge(existing, incoming, { variables, readField }) {
            if (!existing || (variables?.page ?? 1) <= 1) return incoming;
            if (
              (variables?.page ?? 1) !==
              nextPageForCount(existing.length, variables?.perPage)
            ) {
              return existing;
            }
            return mergeMediaListPages(
              existing as unknown[],
              incoming as unknown[],
              (entry) => readField("id", entry as Reference),
            );
          },
        },
```

- [ ] **Step 4: Typecheck, lint, commit**

Run: `bunx tsc --noEmit && bunx eslint graphql/client.ts` → clean.

```bash
git add graphql/client.ts
git commit -m "Cache notifications pages with union possibleTypes"
```

---

### Task 3: Pure notification-text helper + test

**Files:**
- Create: `screens/NotificationsScreen/notificationText.ts`
- Test: `screens/NotificationsScreen/notificationText.test.ts`

**Interfaces:**
- Produces: `getNotificationText(notification, title): string` where
  `notification` is `{ __typename?: string; episode?: number | null; contexts?: (string | null)[] | null; context?: string | null }`.

- [ ] **Step 1: Write the failing test**

`screens/NotificationsScreen/notificationText.test.ts` (bun:test, mirrors
`graphql/animeListPagination.test.ts` conventions):

```ts
import { describe, expect, test } from "bun:test";

import { getNotificationText } from "./notificationText";

describe("getNotificationText", () => {
  test("splices episode and title into airing contexts", () => {
    expect(
      getNotificationText(
        {
          __typename: "AiringNotification",
          episode: 5,
          contexts: ["Episode ", " of ", " aired."],
        },
        "Frieren",
      ),
    ).toBe("Episode 5 of Frieren aired.");
  });

  test("appends related-media context to the title", () => {
    expect(
      getNotificationText(
        {
          __typename: "RelatedMediaAdditionNotification",
          context: " was recently added to the site.",
        },
        "Frieren S2",
      ),
    ).toBe("Frieren S2 was recently added to the site.");
  });

  test("survives null contexts", () => {
    expect(
      getNotificationText(
        { __typename: "AiringNotification", episode: 2, contexts: null },
        "X",
      ),
    ).toBe("Episode 2 of X aired.");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `bun test screens/NotificationsScreen/notificationText.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`screens/NotificationsScreen/notificationText.ts`:

```ts
// AniList ships notification copy as string fragments: airing rows as
// `contexts` (["Episode ", " of ", " aired."]) with the episode and media
// title spliced between them, related-addition rows as a single trailing
// `context`. API copy is English-only; only the title is localized.
type NotificationTextSource = {
  __typename?: string;
  episode?: number | null;
  contexts?: (string | null)[] | null;
  context?: string | null;
};

export function getNotificationText(
  notification: NotificationTextSource,
  title: string,
): string {
  if (notification.__typename === "AiringNotification") {
    const [before, between, after] = notification.contexts ?? [
      "Episode ",
      " of ",
      " aired.",
    ];
    return `${before ?? ""}${notification.episode ?? ""}${between ?? ""}${title}${after ?? ""}`;
  }

  return `${title}${notification.context ?? " was recently added to the site."}`;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `bun test screens/NotificationsScreen/notificationText.test.ts`
Expected: 3 pass.

- [ ] **Step 5: Commit**

```bash
git add screens/NotificationsScreen
git commit -m "Add notification text assembly helper"
```

---

### Task 4: Bell icon asset

**Files:**
- Create: `assets/icons/navigation/bell.png`, `bell@2x.png`, `bell@3x.png`

**Interfaces:**
- Produces: monochrome white bell glyph on transparent background, 24pt
  (24/48/72 px), tintable like `settings-gear.png`.

- [ ] **Step 1: Generate the PNGs**

No Pillow available — write a one-off stdlib script to the scratchpad that
rasterizes a bell (dome = clipped circle, lip = rounded bar, clapper = small
circle) into an alpha mask and emits PNGs with `zlib` + manual chunk
encoding, then run it:

```python
# scratchpad/make_bell.py — stdlib-only PNG writer
import struct, zlib, math

def chunk(tag, data):
    c = struct.pack(">I", len(data)) + tag + data
    return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

def bell_alpha(size):
    px = [[0.0] * size for _ in range(size)]
    s = size / 24.0  # design in a 24pt grid
    def put(x, y, a):
        if 0 <= x < size and 0 <= y < size:
            px[y][x] = max(px[y][x], min(1.0, a))
    def fill_circle(cx, cy, r):
        for y in range(size):
            for x in range(size):
                d = math.hypot(x - cx * s, y - cy * s) / s
                if d <= r:
                    put(x, y, 1.0)
                elif d <= r + 0.7:
                    put(x, y, (r + 0.7 - d) / 0.7)
    def fill_rect(x0, y0, x1, y1):
        for y in range(int(y0 * s), int(y1 * s) + 1):
            for x in range(int(x0 * s), int(x1 * s) + 1):
                put(x, y, 1.0)
    fill_circle(12, 10, 6.5)          # dome
    fill_rect(5.5, 10, 18.5, 16.5)    # body sides down to the lip
    fill_rect(4.5, 15.5, 19.5, 17.5)  # lip bar
    fill_circle(12, 19.5, 1.8)        # clapper
    fill_rect(11, 3.5, 13, 5)         # top nub
    return px

for scale, name in ((1, "bell.png"), (2, "bell@2x.png"), (3, "bell@3x.png")):
    size = 24 * scale
    alpha = bell_alpha(size)
    raw = b""
    for row in alpha:
        raw += b"\x00" + b"".join(
            bytes((255, 255, 255, int(a * 255))) for a in row
        )
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw))
        + chunk(b"IEND", b"")
    )
    open(f"assets/icons/navigation/{name}", "wb").write(png)
print("done")
```

Run: `python3 <scratchpad>/make_bell.py` from the repo root.
Expected: three files created; visually inspect with the Read tool (renders
images) — a recognizable bell silhouette.

- [ ] **Step 2: Commit**

```bash
git add assets/icons/navigation/bell.png assets/icons/navigation/bell@2x.png assets/icons/navigation/bell@3x.png
git commit -m "Add bell icon asset"
```

---

### Task 5: Notifications screen + route

**Files:**
- Create: `app/notifications.tsx`
- Create: `screens/NotificationsScreen/NotificationRow.tsx`
- Modify: `app/_layout.tsx` (register the route in the Protected group)

**Interfaces:**
- Consumes: `useGetNotificationsQuery`, `useGetViewerQuery` (Task 1),
  `getNotificationText` (Task 3), `useLoadNextPage` from `yep/hooks/helpers`,
  `getDateFnsLocale`, `notEmpty`, `useGetTitle` from `yep/utils`,
  `EmptyState`, `PosterAndTitle`, `PressableOpacity`.
- Produces: route `/notifications`.

- [ ] **Step 1: Row component**

`screens/NotificationsScreen/NotificationRow.tsx`:

```tsx
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { getDateFnsLocale, useGetTitle } from "yep/utils";

import { getNotificationText } from "./notificationText";

export type NotificationRowData = {
  id: number;
  createdAt?: number | null;
  episode?: number | null;
  contexts?: (string | null)[] | null;
  context?: string | null;
  __typename?: string;
  media: {
    id: number;
    title?: Parameters<ReturnType<typeof useGetTitle>>[0];
    coverImage?: { medium?: string | null; large?: string | null } | null;
  };
};

export function NotificationRow({ item }: { item: NotificationRowData }) {
  const router = useRouter();
  const getTitle = useGetTitle();
  const { locale } = useLocaleContext();

  return (
    <PressableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => router.push(`/details/${item.media.id}`)}
    >
      <PosterAndTitle
        size="tiny"
        uri={item.media.coverImage?.medium ?? item.media.coverImage?.large ?? ""}
      />
      <View style={styles.textColumn}>
        <Text style={styles.text} numberOfLines={3}>
          {getNotificationText(item, getTitle(item.media.title) ?? "")}
        </Text>
        {item.createdAt ? (
          <Text style={styles.timestamp} numberOfLines={1}>
            {formatDistanceToNow(new Date(item.createdAt * 1000), {
              addSuffix: true,
              locale: getDateFnsLocale(locale),
            })}
          </Text>
        ) : null}
      </View>
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: darkTheme.listItemBackground,
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  text: {
    color: darkTheme.text,
    fontFamily: Manrope.regular,
    fontSize: 14.4,
  },
  textColumn: {
    flex: 1,
    gap: 4,
  },
  timestamp: {
    color: darkTheme.footnote,
    fontFamily: Manrope.regular,
    fontSize: 12.8,
  },
});
```

- [ ] **Step 2: Screen**

`app/notifications.tsx`:

```tsx
import { NetworkStatus, useApolloClient } from "@apollo/client";
import { fbs } from "fbtee";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "yep/components/EmptyState";
import {
  useGetNotificationsQuery,
  useGetViewerQuery,
} from "yep/graphql/generated";
import { useLoadNextPage } from "yep/hooks/helpers";
import {
  NotificationRow,
  NotificationRowData,
} from "yep/screens/NotificationsScreen/NotificationRow";
import { darkTheme } from "yep/themes";
import { notEmpty } from "yep/utils";

const NOTIFICATIONS_PER_PAGE = 25;

function keyExtractor(item: NotificationRowData) {
  return `${item.id}`;
}

function renderNotification({ item }: { item: NotificationRowData }) {
  return <NotificationRow item={item} />;
}

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const { cache } = useApolloClient();
  const { data: viewerData } = useGetViewerQuery({ fetchPolicy: "cache-only" });
  const viewerId = viewerData?.Viewer?.id;

  const { data, loading, error, refetch, fetchMore, networkStatus } =
    useGetNotificationsQuery({
      variables: { page: 1, perPage: NOTIFICATIONS_PER_PAGE, reset: true },
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    });

  // The query resets the server-side count; zero the cached viewer count too
  // so the bell badge clears without refetching the whole viewer.
  useEffect(() => {
    if (viewerId) {
      cache.modify({
        id: cache.identify({ __typename: "User", id: viewerId }),
        fields: { unreadNotificationCount: () => 0 },
      });
    }
  }, [cache, viewerId]);

  const isRefetching = networkStatus === NetworkStatus.refetch;
  const isFetchingMore = networkStatus === NetworkStatus.fetchMore;

  const loadNextPage = useLoadNextPage({
    loadedCount: (data?.Page?.notifications ?? []).length,
    hasNextPage: data?.Page?.pageInfo?.hasNextPage,
    paused: isRefetching,
    perPage: NOTIFICATIONS_PER_PAGE,
    fetchMore,
  });

  // Anime only: related-media additions can reference manga, and rows
  // without media have nothing to link to.
  const rows = (data?.Page?.notifications ?? [])
    .filter(notEmpty)
    .filter(
      (n): n is NotificationRowData =>
        "media" in n && n.media?.type === "ANIME" && n.media?.id != null,
    );

  return (
    <View style={styles.container}>
      {!data && loading ? (
        <ActivityIndicator
          color={darkTheme.text}
          size="large"
          style={styles.loading}
        />
      ) : !data && error ? (
        <EmptyState
          title={String(
            fbs("Could not load notifications", "Notifications error title"),
          )}
          description={error.message}
        />
      ) : (
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            gap: 8,
            padding: 16,
            paddingBottom: insets.bottom + 16,
          }}
          showsVerticalScrollIndicator={false}
          data={rows}
          keyExtractor={keyExtractor}
          renderItem={renderNotification}
          ListEmptyComponent={
            <EmptyState
              title={String(
                fbs("No notifications", "Notifications empty state title"),
              )}
              description={String(
                fbs(
                  "Airing episodes and newly added related anime will show up here.",
                  "Notifications empty state description",
                ),
              )}
            />
          }
          // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop -- RefreshControl must be a live element; React Compiler memoizes it
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                refetch({ page: 1 }).catch(() => {});
              }}
              tintColor={darkTheme.text}
              titleColor={darkTheme.text}
            />
          }
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore ? (
              <ActivityIndicator color={darkTheme.text} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1 },
});
```

- [ ] **Step 3: Register the route**

In `app/_layout.tsx`, inside `<Stack.Protected guard={canBrowse}>` after the
`settings` screen, add (screen title via fbs, same options shape as
`settings`):

```tsx
              <Stack.Screen
                name="notifications"
                options={{
                  title: String(
                    fbs("Notifications", "Notifications screen title"),
                  ),
                  headerTitleStyle: {
                    fontFamily: Manrope.semiBold,
                    fontSize: 16,
                    color: darkTheme.text,
                  },
                  headerBackButtonDisplayMode: "minimal",
                }}
              />
```

- [ ] **Step 4: Typecheck, lint, commit**

Run: `bunx tsc --noEmit && bunx eslint app/notifications.tsx app/_layout.tsx screens/NotificationsScreen` → clean.

```bash
git add app/notifications.tsx app/_layout.tsx screens/NotificationsScreen/NotificationRow.tsx
git commit -m "Add notifications screen"
```

---

### Task 6: Bell + unread badge in the Anime tab header

**Files:**
- Modify: `app/(tabs)/anime.tsx` (Header rightSlot)

**Interfaces:**
- Consumes: `viewerData?.Viewer?.unreadNotificationCount` (already queried in
  this file via `useGetViewerQuery`), `bell.png` (Task 4), route
  `/notifications` (Task 5).

- [ ] **Step 1: Add the bell button**

In `app/(tabs)/anime.tsx`:

Add imports: `Image` from `expo-image`, `PressableOpacity` from
`yep/components/PressableOpacity`, `white` from `yep/colors`.

Compute below `viewerData`:

```tsx
  const unreadCount = viewerData?.Viewer?.unreadNotificationCount ?? 0;
```

Replace `<Header label={...} />` with:

```tsx
      <Header
        label={String(fbs("Anime", "Anime tab header label"))}
        rightSlot={
          accessToken ? (
            <PressableOpacity
              onPress={() => router.push("/notifications")}
              accessibilityRole="button"
              accessibilityLabel={String(
                fbs("Notifications", "Notifications button accessibility label"),
              )}
            >
              <Image
                style={{ tintColor: white, height: 24, width: 24 }}
                source={require("yep/assets/icons/navigation/bell.png")}
              />
              {unreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText} numberOfLines={1}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              ) : null}
            </PressableOpacity>
          ) : undefined
        }
      />
```

Add styles:

```ts
  badge: {
    alignItems: "center",
    backgroundColor: darkTheme.accent,
    borderRadius: 9,
    justifyContent: "center",
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    position: "absolute",
    right: -8,
    top: -6,
  },
  badgeText: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 10,
  },
```

- [ ] **Step 2: Bump the app version**

`app.config.ts`: `version: "0.0.31"` → `version: "0.0.32"`.

- [ ] **Step 3: Typecheck, lint, test, commit**

Run: `bunx tsc --noEmit && bunx eslint "app/(tabs)/anime.tsx" && bun test` → clean.

```bash
git add "app/(tabs)/anime.tsx" app.config.ts
git commit -m "Add badged notifications bell to the anime tab header"
```

---

### Task 7: Simulator verification + PR

**Files:** none (verification + PR)

- [ ] **Step 1: Drive the flow in the iOS simulator**

Use the expo-sim-build-serve-sim skill / existing dev build with the
`goodweebstester` account. Verify:
- Bell renders in the Anime tab header (badge if unread > 0).
- Tapping the bell opens the Notifications screen with rows.
- Tapping a row opens the correct anime details screen.
- Pull-to-refresh spins and settles; badge is 0 after reopening the tab.
- Capture a screenshot of the notifications screen for the PR.

- [ ] **Step 2: Push branch + open PR**

```bash
git push -u origin notifications-screen
gh pr create --base senpai --title "Add notifications screen" --body "<summary + screenshot + spec link>"
```

No AI attribution in the PR body (user rule).
