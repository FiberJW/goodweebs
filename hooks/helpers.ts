import {
  MutationFunctionOptions,
  useMutation,
  FetchResult,
  MutationUpdaterFunction,
  DefaultContext,
  ApolloCache,
} from "@apollo/client";
import { DocumentNode } from "graphql";
import debounce from "lodash/debounce";
import { useState } from "react";
import { useWindowDimensions } from "react-native";

export function useDebouncedMutation<
  MutationData = any,
  MutationVariables = any,
>({
  mutationDocument,
  makeUpdateFunction,
  refetchQueries,
  wait = 500,
}: {
  mutationDocument: DocumentNode;
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
}

const defaultValues: { [key in StorageKeys]: any } = {
  [StorageKeys.HIDE_SCORES_GLOBAL]: true,
  [StorageKeys.SHOW_SCORE_FOR_MEDIA]: false,
  [StorageKeys.SHOULD_PERSIST_SCORE_VISIBILITY]: true,
  [StorageKeys.OPT_OUT_CRASH_REPORTING]: false,
  [StorageKeys.OPT_OUT_ANALYTICS]: false,
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
