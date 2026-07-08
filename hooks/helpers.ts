import {
  MutationFunctionOptions,
  useMutation,
  FetchResult,
  MutationUpdaterFunction,
  DefaultContext,
  ApolloCache,
  TypedDocumentNode,
} from "@apollo/client";
import debounce from "lodash/debounce";
import { useEffect, useRef, useState } from "react";
import { useWindowDimensions } from "react-native";

import { nextPageForCount } from "yep/graphql/animeListPagination";

export function useDebouncedMutation<
  MutationData = any,
  MutationVariables = any,
>({
  mutationDocument,
  makeUpdateFunction,
  refetchQueries,
  wait = 500,
}: {
  mutationDocument: TypedDocumentNode<MutationData, MutationVariables>;
  refetchQueries?: string[];
  makeUpdateFunction?: (
    variables?: MutationVariables,
  ) => MutationUpdaterFunction<
    MutationData,
    MutationVariables,
    DefaultContext,
    ApolloCache<any>
  >;
  wait?: number;
}) {
  const [originalMutation] = useMutation<MutationData, MutationVariables>(
    mutationDocument,
  );

  const [mutationQueue] = useState(() => {
    let abortController: AbortController | null = null;
    // lodash's debounced function returns the *previous* run's result
    // (undefined on the first call), so we can't await it directly. Instead we
    // track the callers awaiting the next run and settle them all together when
    // the coalesced mutation actually resolves/rejects.
    let waiters: {
      resolve: (value: FetchResult<MutationData> | undefined) => void;
      reject: (error: unknown) => void;
    }[] = [];

    const run = debounce(
      async (
        mutationFunc: ({
          variables,
        }: MutationFunctionOptions<MutationData, MutationVariables>) => Promise<
          FetchResult<MutationData>
        >,
        variables?: MutationVariables,
      ) => {
        const controller = new AbortController();
        abortController = controller;
        const settle = waiters;
        waiters = [];
        try {
          const result = await mutationFunc({
            variables,
            context: { fetchOptions: { signal: controller.signal } },
          });
          settle.forEach((w) => w.resolve(result));
        } catch (error) {
          // An aborted request was intentionally superseded, not a failure.
          if (controller.signal.aborted) {
            settle.forEach((w) => w.resolve(undefined));
          } else {
            settle.forEach((w) => w.reject(error));
          }
        }
      },
      wait,
    );

    return {
      abortLatest: () => abortController?.abort(),
      schedule: (
        mutationFunc: ({
          variables,
        }: MutationFunctionOptions<MutationData, MutationVariables>) => Promise<
          FetchResult<MutationData>
        >,
        variables?: MutationVariables,
      ) =>
        new Promise<FetchResult<MutationData> | undefined>(
          (resolve, reject) => {
            waiters.push({ resolve, reject });
            run(mutationFunc, variables);
          },
        ),
    };
  });

  const mutationWithOptimisticUI = async ({
    variables,
    context,
  }: MutationFunctionOptions<MutationData, MutationVariables>) => {
    let update = undefined;

    if (makeUpdateFunction) {
      update = makeUpdateFunction(variables);
    }

    return await originalMutation({
      variables,
      context,
      update,
      refetchQueries,
    });
  };

  return async (newVariables?: MutationVariables) => {
    mutationQueue.abortLatest();
    return await mutationQueue.schedule(
      mutationWithOptimisticUI,
      newVariables,
    );
  };
}

export function useBreakpoints() {
  const { width } = useWindowDimensions();

  const isMobile = width <= 700;

  return { isMobile };
}

export enum StorageKeys {
  HIDE_SCORES_GLOBAL = "HIDE_SCORES_GLOBAL",
  SHOW_SCORE_FOR_MEDIA = "SHOW_SCORE_FOR_MEDIA",
  SHOULD_PERSIST_SCORE_VISIBILITY = "SHOULD_PERSIST_SCORE_VISIBILITY",
  OPT_OUT_CRASH_REPORTING = "OPT_OUT_CRASH_REPORTING",
  OPT_OUT_ANALYTICS = "OPT_OUT_ANALYTICS",
  ANILIST_VIEWER_ID = "ANILIST_VIEWER_ID",
  MEDIA_LIST_SORT_FIELD = "MEDIA_LIST_SORT_FIELD",
  MEDIA_LIST_SORT_DIRECTION = "MEDIA_LIST_SORT_DIRECTION",
}

const defaultValues: { [key in StorageKeys]: any } = {
  [StorageKeys.HIDE_SCORES_GLOBAL]: true,
  [StorageKeys.SHOW_SCORE_FOR_MEDIA]: false,
  [StorageKeys.SHOULD_PERSIST_SCORE_VISIBILITY]: true,
  [StorageKeys.OPT_OUT_CRASH_REPORTING]: false,
  [StorageKeys.OPT_OUT_ANALYTICS]: false,
  [StorageKeys.ANILIST_VIEWER_ID]: null,
  // Sort persists per media type (keyed by the usePersistedState `id`).
  [StorageKeys.MEDIA_LIST_SORT_FIELD]: "UPDATED",
  [StorageKeys.MEDIA_LIST_SORT_DIRECTION]: "DESC",
};

export function usePersistedState<T>(
  key: StorageKeys,
  options?: { id?: string; doNotPersist?: boolean },
): [T, (data: T) => T] {
  const { id, doNotPersist } = options ?? {};
  const storageKey = id ? `${key}:${id}` : key;

  const [storageItem, setStorageItem] = useState<T>(() => {
    if (doNotPersist) return defaultValues[key];
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : defaultValues[key];
  });

  function updateStorageItem(data: T) {
    if (!doNotPersist) localStorage.setItem(storageKey, JSON.stringify(data));
    setStorageItem(data);
    return data;
  }

  return [storageItem, updateStorageItem];
}

// Fire-and-forget infinite-scroll pager shared by the paginated FlatLists
// (anime list, discover search). FlatList can hold a stale onEndReached
// closure (observed live on the anime list: the UI rendered the merged list
// while the callback still computed the page from the previous data), so all
// reads go through a ref written in an effect — not during render — to stay
// React Compiler-safe. Guards on `paused` (pull-refresh state), NOT the
// query's `loading`: it sticks at networkStatus 1 after a skip-flip on mount
// (Apollo 3.12 quirk), which would block fetchMore forever. The cache
// typePolicy (graphql/client.ts) owns the page merge (and drops
// non-contiguous pages from stale races) — no updateQuery, and a duplicate
// page request merges idempotently.
export function useLoadNextPage({
  loadedCount,
  hasNextPage,
  paused,
  perPage,
  fetchMore,
}: {
  loadedCount: number;
  hasNextPage: boolean | null | undefined;
  paused: boolean;
  perPage: number;
  fetchMore: (options: { variables: { page: number } }) => Promise<unknown>;
}) {
  const stateRef = useRef({ loadedCount, hasNextPage, paused });
  const inFlightRef = useRef(false);
  useEffect(() => {
    stateRef.current = { loadedCount, hasNextPage, paused };
  });

  return function loadNextPage() {
    const state = stateRef.current;
    if (inFlightRef.current || state.paused || !state.hasNextPage) return;
    inFlightRef.current = true;
    fetchMore({
      variables: { page: nextPageForCount(state.loadedCount, perPage) },
    })
      .finally(() => {
        inFlightRef.current = false;
      })
      // Swallow the rejection (finally doesn't) — the query hook's
      // error/networkStatus already carries it; unhandled it would redbox.
      .catch(() => {});
  };
}
