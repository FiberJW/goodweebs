import { ApolloClient, InMemoryCache, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { HttpLink } from "@apollo/client/link/http";
import { RetryLink } from "@apollo/client/link/retry";
import * as Sentry from "@sentry/react-native";
import { persistCache, LocalStorageWrapper } from "apollo3-cache-persist";
import * as SecureStore from "expo-secure-store";
import * as Updates from "expo-updates";
import Toast from "react-native-root-toast";

import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = await SecureStore.getItemAsync(ANILIST_ACCESS_TOKEN_STORAGE);

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

const httpLink = new HttpLink({
  uri: "https://graphql.anilist.co",
  // Apollo Client 3.13+ defaults Accept to
  // "application/graphql-response+json,application/json". AniList's API
  // degrades severely on that header (small queries take ~6s, large ones like
  // the anime list effectively hang), so pin Accept to application/json.
  headers: { accept: "application/json" },
});

// These embedded value-objects have no `id`, so when the same normalized parent
// (e.g. a Media) is written by two queries selecting different sub-fields —
// AnimeFragment's coverImage { large medium color } vs the lean list/poster
// fragments' coverImage { large } — Apollo would overwrite the cached copy and
// drop the missing fields (and warn). `merge: true` shallow-merges instead, so
// the richer cached data survives a leaner write and the details screen doesn't
// have to refetch color/medium.
// AniList enforces a per-minute rate limit (https://docs.anilist.co/guide/rate-limiting
// — normally 90/min, currently degraded to 30/min) plus a burst limiter. Exceeding
// either returns a 429 with a `Retry-After` header, or drops/truncates the
// connection (surfacing as a "Network request failed" TypeError). RetryLink retries
// those transient failures and honors `Retry-After` so we wait exactly as long as
// AniList asks. Auth (401) and other deterministic 4xx are NOT retried.
const retryLink = new RetryLink({
  delay: (count, _operation, error) => {
    const retryAfterSec = Number(
      (error as { response?: { headers?: Headers } } | null)?.response?.headers?.get?.(
        "retry-after",
      ),
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
    retryIf: (error) => {
      const status = (error as { statusCode?: number } | null)?.statusCode;
      if (status === 429) return true; // rate-limited: back off and retry
      if (typeof status === "number") return false; // 401/other 4xx/5xx: don't retry
      return true; // no status code = transient network failure: retry
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
  typePolicies: {
    Media: { fields: { coverImage: { merge: true } } },
    Character: { fields: { name: { merge: true } } },
  },
});

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
              await Promise.all(
                graphQLErrors.map(async (e) => {
                  Sentry.captureMessage(e.message);

                  console.error("[GraphQL error]:", e);

                  if (
                    e.message.toLowerCase().includes("invalid token") ||
                    // TODO: revisit this auto-logout logic
                    ("status" in e && e.status === 401)
                  ) {
                    await SecureStore.deleteItemAsync(
                      ANILIST_ACCESS_TOKEN_STORAGE,
                    );
                    Toast.show("You've been logged out. Please log in again.", {
                      duration: Toast.durations.LONG,
                      position: Toast.positions.TOP,
                      shadow: true,
                      animation: true,
                      hideOnPress: true,
                      delay: 0,
                    });
                    await Updates.reloadAsync();
                  } else {
                    Toast.show(e.message, {
                      duration: Toast.durations.LONG,
                      position: Toast.positions.TOP,
                      shadow: true,
                      animation: true,
                      hideOnPress: true,
                      delay: 0,
                    });
                  }
                }),
              );
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
          const statusCode = (networkError as { statusCode?: number }).statusCode;
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
