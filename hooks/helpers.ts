import {
  MutationFunctionOptions,
  useMutation,
  FetchResult,
  PureQueryOptions,
  MutationUpdaterFunction,
  DefaultContext,
  ApolloCache,
} from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DocumentNode } from "graphql";
import { debounce } from "lodash";
import { useRef, useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";

export function useNow(interval: "second" | "minute" = "minute") {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const handle = setInterval(
      () => setNow(new Date()),
      interval === "second" ? 1 * 1000 : 60 * 1000
    );

    return () => clearInterval(handle);
  }, [interval]);

  return now;
}

export function useDebouncedMutation<
  MutationData = any,
  MutationVariables = any,
>({
  mutationDocument,
  makeUpdateFunction,
  wait = 500,
  refetchQueries,
}: {
  mutationDocument: DocumentNode;
  makeUpdateFunction?: (
    variables?: MutationVariables
  ) => MutationUpdaterFunction<
    MutationData,
    MutationVariables,
    DefaultContext,
    ApolloCache<any>
  >;
  wait?: number;
  refetchQueries?: PureQueryOptions[];
}) {
  const [originalMutation] = useMutation<MutationData, MutationVariables>(
    mutationDocument
  );

  const abortController = useRef<AbortController>(null);
  const debouncedMutation = useRef(
    debounce(
      async (
        mutationFunc: ({
          variables,
        }: MutationFunctionOptions<MutationData, MutationVariables>) => Promise<
          FetchResult<MutationData>
        >,
        variables?: MutationVariables
      ) => {
        const controller = new AbortController();
        abortController.current = controller;
        await mutationFunc({
          variables,
          context: { fetchOptions: { signal: controller.signal } },
        });
      },
      wait
    )
  );

  const abortLatest = () => abortController.current?.abort();

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
      awaitRefetchQueries: refetchQueries ? true : undefined,
    });
  };

  return async (newVariables?: MutationVariables) => {
    abortLatest();
    return await debouncedMutation.current(
      mutationWithOptimisticUI,
      newVariables
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
  options?: { id?: string; doNotPersist?: boolean }
): [T, (data: T) => T] {
  const [storageItem, setStorageItem] = useState<T>(defaultValues[key]);

  const { id, doNotPersist } = options ?? {};

  const storageKey = id ? `${key}:${id}` : key;

  function updateStorageItem(data: T) {
    if (!doNotPersist) AsyncStorage.setItem(storageKey, JSON.stringify(data));
    setStorageItem(data);

    return data;
  }

  useEffect(
    function setValueFromStorage() {
      async function getStorageItem() {
        if (doNotPersist) return storageItem;

        const data = await AsyncStorage.getItem(storageKey);

        if (data) {
          const parsedData = JSON.parse(data);

          setStorageItem(parsedData);
        }
      }

      if (!doNotPersist) getStorageItem();
    },
    [doNotPersist, storageKey, storageItem]
  );

  return [storageItem, updateStorageItem];
}
