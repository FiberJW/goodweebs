import {
  MutationFunctionOptions,
  useMutation,
  FetchResult,
  MutationUpdaterFn,
  PureQueryOptions,
} from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DocumentNode } from "graphql";
import { debounce } from "lodash";
import { useRef, useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";

export function useDidMountEffect(func: () => void, deps: any[]) {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps);
}

export function useNow(interval: "second" | "minute" = "minute") {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const handle = setInterval(
      () => setNow(new Date()),
      interval === "second" ? 1 * 1000 : 60 * 1000
    );

    return () => clearInterval(handle);
  }, []);

  return now;
}

export function useDebouncedMutation<
  MutationData = any,
  MutationVariables = any
>({
  mutationDocument,
  makeUpdateFunction,
  wait = 250,
  refetchQueries,
}: {
  mutationDocument: DocumentNode;
  makeUpdateFunction?: (
    variables: MutationVariables
  ) => MutationUpdaterFn<MutationData>;
  wait?: number;
  refetchQueries?: PureQueryOptions[];
}) {
  const [originalMutation] = useMutation<MutationData, MutationVariables>(
    mutationDocument
  );

  const abortController = useRef<AbortController>();
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
        // eslint-disable-next-line
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
      update = makeUpdateFunction(variables!); // TODO: this assertion doesn't feel optimal
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
}

const defaultValues: { [key in StorageKeys]: any } = {
  [StorageKeys.HIDE_SCORES_GLOBAL]: true,
  [StorageKeys.SHOW_SCORE_FOR_MEDIA]: false,
  [StorageKeys.SHOULD_PERSIST_SCORE_VISIBILITY]: true,
};

export function usePersistedState<T>(
  key: StorageKeys,
  options?: { id?: string; doNotPersist?: boolean }
): [T, (data: T) => T] {
  const [storageItem, setStorageItem] = useState<T>(defaultValues[key]);

  const { id, doNotPersist } = options ?? {};

  const storageKey = id ? `${key}:${id}` : key;

  async function getStorageItem() {
    if (doNotPersist) return storageItem;

    const data = await AsyncStorage.getItem(storageKey);

    if (data) {
      const parsedData = JSON.parse(data);

      setStorageItem(parsedData);
    }
  }

  function updateStorageItem(data: T) {
    if (!doNotPersist) AsyncStorage.setItem(storageKey, JSON.stringify(data));
    setStorageItem(data);

    return data;
  }

  useEffect(() => {
    if (!doNotPersist) getStorageItem();
  }, [doNotPersist]);

  return [storageItem, updateStorageItem];
}
