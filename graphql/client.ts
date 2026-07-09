import { ApolloClient, InMemoryCache, ApolloLink } from "@apollo/client";
import type { Reference } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { HttpLink } from "@apollo/client/link/http";
import { RetryLink } from "@apollo/client/link/retry";
import { getMainDefinition } from "@apollo/client/utilities";
import * as Sentry from "@sentry/react-native";
import { persistCache, LocalStorageWrapper } from "apollo3-cache-persist";
import * as SecureStore from "expo-secure-store";
import * as Updates from "expo-updates";
import Toast from "react-native-root-toast";

import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";
import {
  mergeMediaListPages,
  nextPageForCount,
} from "yep/graphql/animeListPagination";
import { StorageKeys } from "yep/hooks/helpers";

// authLink runs on EVERY GraphQL operation, and a SecureStore read is a
// Keychain (disk + crypto) hit per request — wasted work during
// cache-and-network refreshes and pagination bursts. Mirror the token in
// memory: SecureStore stays the durable copy, this is just the hot path.
// Login/logout paths call primeAccessToken to keep the mirror in sync; the
// lazy read in authLink covers anything that didn't. `undefined` means "not
// read yet", `null` means "read, no token".
let cachedAccessToken: string | null | undefined;

export function primeAccessToken(token: string | null) {
  cachedAccessToken = token;
  // A fresh login is a new auth session: re-arm the auto-logout guard. This
  // matters when Updates.reloadAsync() failed (dev/Expo Go) and the user logs
  // in again in the same JS runtime — without this, a later expired token
  // would never trigger the logout flow.
  if (token) {
    handlingAuthLogout = false;
  }
}

const authLink = setContext(async (_, { headers }) => {
  if (cachedAccessToken === undefined) {
    cachedAccessToken = await SecureStore.getItemAsync(
      ANILIST_ACCESS_TOKEN_STORAGE,
    );
  }

  const Authorization = cachedAccessToken
    ? `Bearer ${cachedAccessToken}`
    : undefined;

  // return the headers to the context so httpLink can read them
  return Authorization
    ? {
        headers: {
          ...headers,
          Authorization,
        },
      }
    : // for some reason, the request gets messed up when Authorization is undefined, so just don't
      // specify the key at all
      {};
});

// AniList's burst limiter sometimes drops a connection without closing it; RN's
// fetch then never settles, which pins RefreshControl spinners forever (and
// Apollo dedupes any re-pull onto the same hung request, so the user can't
// recover). Cap every request at 30s via Promise.race — deliberately WITHOUT
// substituting our own AbortSignal into fetch (replacing RN fetch's signal
// wedges its networking; a raced-out request is simply abandoned). Timeouts
// reject with name "TimeoutError" (NOT "AbortError") so RetryLink retries them
// while caller-initiated aborts (a debounced mutation superseding an in-flight
// one) are still not retried.
function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error("AniList request timed out after 30s");
      error.name = "TimeoutError";
      reject(error);
    }, 30_000);
  });
  const request = fetch(input, init).finally(() => clearTimeout(timer));
  return Promise.race([request, timeout]);
}

const httpLink = new HttpLink({
  uri: "https://graphql.anilist.co",
  fetch: fetchWithTimeout,
  // Apollo Client 3.13+ defaults Accept to
  // "application/graphql-response+json,application/json". AniList's API
  // degrades severely on that header (small queries take ~6s, large ones like
  // the anime list effectively hang), so pin Accept to application/json.
  headers: { accept: "application/json" },
});

// AniList enforces a per-minute rate limit (https://docs.anilist.co/guide/rate-limiting
// — normally 90/min, currently degraded to 30/min) plus a burst limiter. Exceeding
// either returns a 429 with a `Retry-After` header, or drops/truncates the
// connection (surfacing as a "Network request failed" TypeError). RetryLink retries
// those transient failures and honors `Retry-After` so we wait exactly as long as
// AniList asks. Auth (401) and other deterministic 4xx are NOT retried.
const retryLink = new RetryLink({
  delay: (count, _operation, error) => {
    const retryAfterSec = Number(
      (
        error as { response?: { headers?: Headers } } | null
      )?.response?.headers?.get?.("retry-after"),
    );
    if (Number.isFinite(retryAfterSec) && retryAfterSec > 0) {
      // Honor Retry-After (seconds) + small buffer, capped at the 1-min timeout window.
      return Math.min(retryAfterSec * 1000 + 250, 60000);
    }
    // Transient network drop/timeout: exponential backoff with jitter.
    return Math.min(500 * 2 ** (count - 1), 8000) * (1 + Math.random() * 0.2);
  },
  attempts: {
    max: 3, // initial request + 2 retries
    retryIf: (error, operation) => {
      // Intentionally superseded by a newer debounced mutation — never replay.
      if ((error as Error | null)?.name === "AbortError") return false;
      const status = (error as { statusCode?: number } | null)?.statusCode;
      if (status === 429) return true; // rate-limited: not processed, safe for all ops
      if (typeof status === "number") return false; // 401/other 4xx/5xx: don't retry
      // No status code = ambiguous network drop/timeout: the server may have
      // already applied the write, so replaying a non-idempotent mutation
      // (e.g. ToggleFavourite) could double-apply it. Only queries retry here.
      const def = getMainDefinition(operation.query);
      return !(
        def.kind === "OperationDefinition" && def.operation === "mutation"
      );
    },
  },
});

// These embedded value-objects have no `id`, so when the same normalized parent
// (e.g. a Media) is written by two queries selecting different sub-fields —
// AnimeFragment's coverImage { large medium color } vs the lean list/poster
// fragments' coverImage { large } — Apollo would overwrite the cached copy and
// drop the missing fields (and warn). `merge: true` shallow-merges instead, so
// the richer cached data survives a leaner write and the details screen doesn't
// have to refetch color/medium.
const cache = new InMemoryCache({
  // The notifications list is a union (NotificationUnion); the cache needs
  // the concrete object types to match inline fragments on reads. Only the
  // members we query are listed — add more if the query grows.
  possibleTypes: {
    NotificationUnion: [
      "AiringNotification",
      "RelatedMediaAdditionNotification",
    ],
  },
  typePolicies: {
    Query: {
      fields: {
        // Paginated lists (the anime list, discover trending) fetchMore over
        // Page, so a Page container must be ONE cache object per query
        // identity, never per page — pages merge inside it (see the field
        // policies below) and pageInfo.hasNextPage always reflects the newest
        // page. Hence `page` is excluded from every container key.
        Page: {
          keyArgs: (args, { variables }) => {
            if (variables?.userId != null && variables?.status != null) {
              return `mediaList:${variables.type}:${variables.userId}:${variables.status}:${JSON.stringify(variables.sort ?? null)}`;
            }
            // Search containers are per-type-and-term: pageInfo.hasNextPage
            // must track the term (and not collide with trending's container).
            if (variables?.search != null) {
              return `search:${variables.type}:${variables.search}`;
            }
            // The notifications screen: one container, keyed apart from
            // trending/search so their pageInfo never clobbers each other.
            if (variables?.reset != null) {
              return "notifications";
            }
            // Trending: one container per media type (the discover toggle
            // flips between them, and each paginates independently).
            if (variables?.type != null) {
              return `trending:${variables.type}`;
            }
            return JSON.stringify({ ...args, page: undefined });
          },
          merge: true,
        },
      },
    },
    Page: {
      fields: {
        // Append-merge for paginated pages. `page` lives on the parent Page
        // field, so the reset signal comes from the operation variables:
        // page 1 (or absent — a refetch/term change) replaces the list.
        // Doing this at the cache layer (not fetchMore's updateQuery) keeps
        // merges correct when a background cache-and-network refetch races an
        // in-flight fetchMore, and dedupe makes repeated pages idempotent.
        mediaList: {
          keyArgs: ["userId", "type", "status", "sort"],
          merge(existing, incoming, { variables, readField }) {
            if (!existing || (variables?.page ?? 1) <= 1) return incoming;
            // A deep page can land AFTER a racing page-1 refetch already reset
            // the container (pull-to-refresh while fetchMore is in flight).
            // Appending it would leave a silent gap (rows 101-150 right after
            // row 50), so drop any page that isn't the next contiguous one.
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
        users: {
          keyArgs: ["search", "sort"],
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
        // Same append-merge for Page.media (discover trending and search).
        media: {
          keyArgs: [
            "search",
            "type",
            "sort",
            "format_in",
            "format_not_in",
            "isAdult",
          ],
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
      },
    },
    Media: { fields: { coverImage: { merge: true } } },
    Character: { fields: { name: { merge: true }, image: { merge: true } } },
    User: { fields: { statistics: { merge: true } } },
    UserStatisticTypes: {
      fields: { anime: { merge: true }, manga: { merge: true } },
    },
  },
});

// A single response can carry several "invalid token" errors (one per failed
// field), and more can arrive from concurrent operations. The auto-logout
// must run once per session, not once per error — otherwise N errors mean N
// toasts and N reloadAsync calls racing each other.
let handlingAuthLogout = false;

function isAuthError(error: { message: string }) {
  return (
    error.message.toLowerCase().includes("invalid token") ||
    ("status" in error && error.status === 401)
  );
}

export async function createClient() {
  // A failed cache restore must not block startup — fall back to an
  // in-memory-only cache so the app still boots.
  try {
    await persistCache({
      cache,
      storage: new LocalStorageWrapper(localStorage),
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("[Cache persistence failed]:", error);
  }

  return new ApolloClient({
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        // Keep this handler synchronous (returning undefined): Apollo's error
        // link treats any truthy return as a retry Observable. The async work
        // is fire-and-forget inside a void IIFE.
        if (graphQLErrors)
          void (async () => {
            try {
              for (const e of graphQLErrors) {
                Sentry.captureMessage(e.message);
                console.error("[GraphQL error]:", e);
                if (!isAuthError(e)) {
                  Toast.show(e.message, {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.TOP,
                    shadow: true,
                    animation: true,
                    hideOnPress: true,
                    delay: 0,
                  });
                }
              }

              if (graphQLErrors.some(isAuthError) && !handlingAuthLogout) {
                handlingAuthLogout = true;
                // Clear the memory mirror first so in-flight and queued
                // operations stop attaching the dead token immediately.
                primeAccessToken(null);
                await SecureStore.deleteItemAsync(ANILIST_ACCESS_TOKEN_STORAGE);
                // Matches the Settings logout: a stale viewer id would
                // fetch the previous user's list on the next login.
                localStorage.removeItem(StorageKeys.ANILIST_VIEWER_ID);
                Toast.show("You've been logged out. Please log in again.", {
                  duration: Toast.durations.LONG,
                  position: Toast.positions.TOP,
                  shadow: true,
                  animation: true,
                  hideOnPress: true,
                  delay: 0,
                });
                // Throws in dev/Expo Go builds (no embedded update); the
                // token is already cleared above, so the session is dead
                // either way — the guard stays set to keep later auth errors
                // from re-toasting and re-deleting.
                await Updates.reloadAsync();
              }
            } catch (error) {
              Sentry.captureException(error);
              console.error("[GraphQL error handler failed]:", error);
            }
          })();
        if (networkError) {
          if (networkError.name === "AbortError") {
            // ignore abort errors
            return;
          }

          // Reaches here only after RetryLink has exhausted its retries, so a
          // surviving 429 means AniList is still rate-limiting us — tell the user.
          const statusCode = (networkError as { statusCode?: number })
            .statusCode;
          if (statusCode === 429) {
            Toast.show(
              "AniList is rate-limiting requests. Please wait a moment and try again.",
              {
                duration: Toast.durations.LONG,
                position: Toast.positions.TOP,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 0,
              },
            );
          }

          Sentry.captureException(networkError);
          console.error(`[Network error]: ${networkError}`);
        }
      }),
      retryLink,
      authLink.concat(httpLink),
    ]),
    cache,
  });
}
