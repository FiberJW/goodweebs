import * as Haptics from "expo-haptics";
import React, { useState, useEffect } from "react";

import { AnimeListItem } from "yep/components/AnimeListItem";
import {
  AnimeFragmentFragment,
  UpdateProgressDocument,
  UpdateProgressMutation,
  UpdateProgressMutationVariables,
} from "yep/graphql/generated";
import { useDebouncedMutation } from "yep/hooks/helpers";

type Props = {
  seedData: {
    id: number;
    progress: number;
    media: AnimeFragmentFragment | null;
  };
  first: boolean;
  last: boolean;
};

export function AnimeListItemContainer({ seedData, first, last }: Props) {
  const mediaListEntryId = seedData.media?.mediaListEntry?.id;
  const cacheProgress = seedData.media?.mediaListEntry?.progress ?? 0;
  const progressUpperBound = seedData.media?.episodes;

  // Local state for instant UI feedback
  const [displayProgress, setDisplayProgress] = useState(cacheProgress);

  // Sync when cache updates (e.g., from server response)
  useEffect(() => {
    setDisplayProgress(cacheProgress);
  }, [cacheProgress]);

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
    setDisplayProgress(newProgress);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await updateProgressDebounced({
        id: mediaListEntryId,
        progress: newProgress,
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <AnimeListItem
      progress={displayProgress}
      onIncrement={() => changeProgress("inc")}
      onDecrement={() => changeProgress("dec")}
      media={seedData.media as AnimeFragmentFragment}
      first={first}
      last={last}
    />
  );
}
