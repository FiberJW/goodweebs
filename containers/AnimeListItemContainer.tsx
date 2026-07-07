import * as Haptics from "expo-haptics";
import React, { useState } from "react";

import { AnimeListItem } from "yep/components/AnimeListItem";
import {
  UpdateProgressDocument,
} from "yep/graphql/generated";
import type {
  AnimeListEntryFragmentFragment,
  UpdateProgressMutation,
  UpdateProgressMutationVariables,
} from "yep/graphql/generated";
import { useDebouncedMutation } from "yep/hooks/helpers";
import { getMaxProgress } from "yep/utils";

type Props = {
  seedData: {
    id: number;
    progress: number;
    media: AnimeListEntryFragmentFragment | null;
  };
  first: boolean;
  last: boolean;
};

type ProgressOverride = {
  cacheProgress: number;
  progress: number;
};

export function AnimeListItemContainer({ seedData, first, last }: Props) {
  const mediaListEntryId = seedData.media?.mediaListEntry?.id;
  const cacheProgress = seedData.media?.mediaListEntry?.progress ?? 0;
  const progressUpperBound = getMaxProgress(seedData.media);

  const [progressOverride, setProgressOverride] =
    useState<ProgressOverride | null>(null);
  // The optimistic override only applies while the cache still shows the value
  // it was captured against. Once the cache moves (the mutation's write landed,
  // or a refetch/external update arrived) drop it — otherwise a later cache
  // value equal to the pre-tap snapshot would resurrect the stale number.
  let activeProgressOverride = progressOverride;
  if (progressOverride && progressOverride.cacheProgress !== cacheProgress) {
    setProgressOverride(null);
    activeProgressOverride = null;
  }
  const displayProgress = activeProgressOverride
    ? activeProgressOverride.progress
    : cacheProgress;

  const updateProgressDebounced = useDebouncedMutation<
    UpdateProgressMutation,
    UpdateProgressMutationVariables
  >({
    mutationDocument: UpdateProgressDocument,
    makeUpdateFunction: (variables) => (cache) => {
      if (!mediaListEntryId || variables?.progress === undefined) return;

      // Direct cache update for optimistic UI
      cache.modify({
        id: cache.identify({ __typename: "MediaList", id: mediaListEntryId }),
        fields: {
          progress: () => variables.progress,
        },
      });
    },
    wait: 0,
  });

  function clampProgress(value: number) {
    const clamped = Math.max(value, 0);
    return typeof progressUpperBound === "number"
      ? Math.min(clamped, progressUpperBound)
      : clamped;
  }

  async function changeProgress(type: "inc" | "dec", increment = 1) {
    if (!mediaListEntryId) return;

    const newProgress = clampProgress(
      type === "inc"
        ? displayProgress + increment
        : displayProgress - increment,
    );
    if (newProgress === displayProgress) return;

    // Instant UI update
    setProgressOverride({ cacheProgress, progress: newProgress });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await updateProgressDebounced({
        id: mediaListEntryId,
        progress: newProgress,
      });
    } catch (error) {
      // A failed mutation never moves the cache, so the override would stay
      // pinned to the unsaved value forever — revert it. (The global onError
      // link already toasts the failure.)
      setProgressOverride(null);
      console.error(error);
    }
  }

  return (
    <AnimeListItem
      progress={displayProgress}
      onIncrement={() => changeProgress("inc")}
      onDecrement={() => changeProgress("dec")}
      media={seedData.media as AnimeListEntryFragmentFragment}
      first={first}
      last={last}
    />
  );
}
