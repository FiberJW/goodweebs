import {
  useMutation,
  type FetchResult,
  type TypedDocumentNode,
} from "@apollo/client";
import * as Haptics from "expo-haptics";
import debounce from "lodash/debounce";
import { useState } from "react";

import type { MediaListStatus } from "yep/graphql/enums";
import { graphql } from "yep/graphql/tada";

export const LIST_STATUSES: readonly MediaListStatus[] = [
  "CURRENT",
  "PAUSED",
  "PLANNING",
  "DROPPED",
  "COMPLETED",
];

const SaveMediaListEntry = graphql(`
  mutation SaveMediaListEntry(
    $id: Int
    $progress: Int
    $progressVolumes: Int
    $score: Float
  ) {
    SaveMediaListEntry(
      id: $id
      progress: $progress
      progressVolumes: $progressVolumes
      score: $score
    ) {
      id
      progress
      progressVolumes
      status
      score
    }
  }
`);

const UpdateStatus = graphql(`
  mutation UpdateStatus($mediaId: Int, $status: MediaListStatus) {
    SaveMediaListEntry(mediaId: $mediaId, status: $status) {
      id
      progress
      status
      media {
        id
        mediaListEntry {
          id
          progress
          status
        }
      }
    }
  }
`);

const RemoveFromList = graphql(`
  mutation RemoveFromList($id: Int!) {
    DeleteMediaListEntry(id: $id) {
      deleted
    }
  }
`);

type CounterField = "progress" | "progressVolumes" | "score";

export function useEntryCounter({
  entryId,
  field,
  value: cacheValue,
  max,
  step = 1,
}: {
  entryId: number | undefined;
  field: CounterField;
  value: number;
  max: number | null | undefined;
  step?: number;
}) {
  const save = useDebouncedMutation(SaveMediaListEntry);
  const [override, setOverride] = useState<{
    cacheValue: number;
    value: number;
  } | null>(null);
  let activeOverride = override;
  if (override && override.cacheValue !== cacheValue) {
    setOverride(null);
    activeOverride = null;
  }
  const value = activeOverride?.value ?? cacheValue;

  async function change(delta: number) {
    if (!entryId) return;
    const next = Math.min(Math.max(value + delta, 0), max ?? Infinity);
    if (next === value) return;
    setOverride({ cacheValue, value: next });
    if (field === "progress" && next === max) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.selectionAsync();
    }
    try {
      await save({ id: entryId, [field]: next });
    } catch (error) {
      setOverride(null);
      console.error(error);
    }
  }

  return {
    value,
    canDecrement: value > 0,
    canIncrement: value !== max,
    nextCompletes: value + step === max,
    increment: () => change(step),
    decrement: () => change(-step),
  };
}

export type EntryCounter = ReturnType<typeof useEntryCounter>;

export function useSetListStatus(media: {
  id: number;
  mediaListEntry?: { id: number; status?: MediaListStatus | null } | null;
}) {
  const [updateStatus] = useMutation(UpdateStatus);
  const entry = media.mediaListEntry;

  return (status: MediaListStatus) =>
    updateStatus({
      variables: { mediaId: media.id, status },
      update(cache, result) {
        if (entry && status !== entry.status) {
          // ponytail: removes the entry from every cached Page.mediaList
          // container instead of refetching (AniList's 30/min budget); the
          // destination status list self-heals on its next cache-and-network
          // read. Revert to refetchQueries: ["GetMediaList"] if this bites.
          cache.modify({
            fields: {
              Page(existing, { readField }) {
                const list = existing?.mediaList;
                if (!Array.isArray(list)) return existing;
                const filtered = list.filter(
                  (ref) => readField("id", ref) !== entry.id,
                );
                if (filtered.length === list.length) return existing;
                const total = existing.pageInfo?.total;
                return {
                  ...existing,
                  mediaList: filtered,
                  pageInfo:
                    typeof total === "number"
                      ? { ...existing.pageInfo, total: total - 1 }
                      : existing.pageInfo,
                };
              },
            },
          });
        }

        // AniList can return a null media.mediaListEntry here, which would
        // unlink the entry until the next refetch.
        const saved = result.data?.SaveMediaListEntry;
        if (!saved?.id) return;
        cache.modify({
          id: cache.identify({ __typename: "Media", id: media.id }),
          fields: {
            mediaListEntry: (existing, { toReference }) =>
              toReference({ __typename: "MediaList", id: saved.id }) ??
              existing,
          },
        });
      },
    });
}

export function useRemoveFromList(mediaId: number) {
  const [removeFromList] = useMutation(RemoveFromList);

  return (entryId: number) =>
    removeFromList({
      variables: { id: entryId },
      update(cache) {
        cache.modify({
          id: cache.identify({ __typename: "Media", id: mediaId }),
          fields: { mediaListEntry: () => null },
        });
        cache.evict({
          id: cache.identify({ __typename: "MediaList", id: entryId }),
        });
        cache.gc();
      },
    });
}

function useDebouncedMutation<TData, TVariables>(
  document: TypedDocumentNode<TData, TVariables>,
) {
  const [mutate] = useMutation(document);
  const [queue] = useState(() => {
    let abortController: AbortController | null = null;
    // lodash's debounced function returns the previous run's result, so the
    // callers awaiting the coalesced run are settled together here.
    let waiters: {
      resolve: (value: FetchResult<TData> | undefined) => void;
      reject: (error: unknown) => void;
    }[] = [];

    const send = debounce(
      async (latestMutate: typeof mutate, variables: TVariables) => {
        const controller = new AbortController();
        abortController = controller;
        const settle = waiters;
        waiters = [];
        try {
          const result = await latestMutate({
            variables,
            context: { fetchOptions: { signal: controller.signal } },
          });
          settle.forEach((waiter) => waiter.resolve(result));
        } catch (error) {
          settle.forEach((waiter) =>
            controller.signal.aborted
              ? waiter.resolve(undefined)
              : waiter.reject(error),
          );
        }
      },
      500,
    );

    return (latestMutate: typeof mutate, variables: TVariables) => {
      abortController?.abort();
      return new Promise<FetchResult<TData> | undefined>((resolve, reject) => {
        waiters.push({ resolve, reject });
        send(latestMutate, variables);
      });
    };
  });

  return (variables: TVariables) => queue(mutate, variables);
}
