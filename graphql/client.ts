import { ApolloClient, InMemoryCache, ApolloLink } from "@apollo/client";
import type { FieldPolicy, Reference } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { HttpLink } from "@apollo/client/link/http";
import { RetryLink } from "@apollo/client/link/retry";
import { getMainDefinition } from "@apollo/client/utilities";
import * as Sentry from "@sentry/react-native";
import { CachePersistor, LocalStorageWrapper } from "apollo3-cache-persist";

import {
  mergeMediaListPages,
  nextPageForCount,
  pageContainerKey,
} from "yep/graphql/animeListPagination";
import {
  getAccessToken,
  getSession,
  sessionLoaded,
  signOut,
  subscribeToSession,
} from "yep/session";
import { showToast } from "yep/toast";

const authLink = setContext(async (_, { headers }) => {
  await sessionLoaded;
  const token = getAccessToken();
  const Authorization = token ? `Bearer ${token}` : undefined;

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

// Append-merge for paginated pages. `page` lives on the parent Page field, so
// the reset signal comes from the operation variables: page 1 (or absent — a
// refetch/term change) replaces the list. Doing this at the cache layer (not
// fetchMore's updateQuery) keeps merges correct when a background
// cache-and-network refetch races an in-flight fetchMore, and dedupe makes
// repeated pages idempotent.
function appendPage(keyArgs: string[]): FieldPolicy<unknown[]> {
  return {
    keyArgs,
    merge(existing, incoming, { variables, readField }) {
      if (!existing || (variables?.page ?? 1) <= 1) return incoming;
      // A deep page can land AFTER a racing page-1 refetch already reset the
      // container (pull-to-refresh while fetchMore is in flight). Appending it
      // would leave a silent gap (rows 101-150 right after row 50), so drop
      // any page that isn't the next contiguous one.
      if (
        (variables?.page ?? 1) !==
        nextPageForCount(existing.length, variables?.perPage)
      ) {
        return existing;
      }
      return mergeMediaListPages(existing, incoming, (entry) =>
        readField("id", entry as Reference),
      );
    },
  };
}

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
    ActivityUnion: ["ListActivity"],
    NotificationUnion: [
      "AiringNotification",
      "RelatedMediaAdditionNotification",
    ],
  },
  typePolicies: {
    Query: {
      fields: {
        // One cache container per query identity, never per page — see
        // pageContainerKey (extracted so the key scheme is unit-testable).
        Page: {
          keyArgs: (args, { variables }) => pageContainerKey(args, variables),
          merge: true,
        },
      },
    },
    Page: {
      fields: {
        mediaList: appendPage(["userId", "type", "status", "sort"]),
        notifications: appendPage(["type_in"]),
        activities: appendPage(["userId", "isFollowing", "type", "sort"]),
        users: appendPage(["search", "sort"]),
        media: appendPage([
          "search",
          "type",
          "sort",
          "format_in",
          "format_not_in",
          "isAdult",
        ]),
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

function isAuthError(error: { message: string }) {
  return (
    error.message.toLowerCase().includes("invalid token") ||
    ("status" in error && error.status === 401)
  );
}

export async function createClient() {
  const persistor = new CachePersistor({
    cache,
    storage: new LocalStorageWrapper(localStorage),
  });
  // A failed cache restore must not block startup — fall back to an
  // in-memory-only cache so the app still boots.
  try {
    await persistor.restore();
  } catch (error) {
    Sentry.captureException(error);
    console.error("[Cache persistence failed]:", error);
  }

  const client = new ApolloClient({
    link: ApolloLink.from([
      // Must return undefined: the error link treats a returned value as a
      // retry Observable.
      onError(({ graphQLErrors, networkError }) => {
        for (const error of graphQLErrors ?? []) {
          Sentry.captureMessage(error.message);
          console.error("[GraphQL error]:", error);
          if (!isAuthError(error)) showToast(error.message);
        }
        if (
          graphQLErrors?.some(isAuthError) &&
          getSession().status === "signedIn"
        ) {
          signOut().catch(console.error);
          showToast("You've been logged out. Please log in again.");
        }

        if (networkError && networkError.name !== "AbortError") {
          // RetryLink already gave up, so AniList is still rate-limiting.
          if ((networkError as { statusCode?: number }).statusCode === 429) {
            showToast(
              "AniList is rate-limiting requests. Please wait a moment and try again.",
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
  client.onClearStore(() => persistor.purge());

  let previousToken = getAccessToken();
  subscribeToSession(() => {
    const token = getAccessToken();
    // clearStore, not resetStore: resetStore refetches every active query
    // unauthenticated and sprays error toasts over the login screen.
    if (previousToken && !token) client.clearStore().catch(() => {});
    previousToken = token;
  });

  return client;
}
