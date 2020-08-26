import { useQuery } from "@apollo/react-hooks";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import React, { useState, useEffect } from "react";

import { AnimeListItem } from "yep/components/AnimeListItem";
import {
  AnimeFragmentFragment,
  UpdateProgressMutation,
  UpdateProgressMutationVariables,
  GetAnimeQuery,
  GetAnimeQueryVariables,
  MediaList,
} from "yep/graphql/generated";
import { UpdateProgress } from "yep/graphql/mutations/UpdateProgress";
import { GetAnime } from "yep/graphql/queries/AnimeDetails";
import { useDebouncedMutation } from "yep/hooks/helpers";
import { RootStackParamList } from "yep/navigation";

type Props = {
  seedData: {
    id: number;
    progress: number;
    media: AnimeFragmentFragment | null;
  };
  refetchList: () => void;
  navigation: StackNavigationProp<RootStackParamList>;
};

export function AnimeListItemContainer({
  seedData,
  navigation,
  refetchList,
}: Props) {
  const [progressShadow, setProgressShadow] = useState(seedData.progress);
  const [shouldShowProgressShadow, setShouldShowProgressShadow] = useState(
    false
  );
  const { loading, data } = useQuery<GetAnimeQuery, GetAnimeQueryVariables>(
    GetAnime,
    {
      variables: { id: seedData?.media?.id },
    }
  );

  const updateProgressDebounced = useDebouncedMutation<
    UpdateProgressMutation,
    UpdateProgressMutationVariables
  >({
    mutationDocument: UpdateProgress,
    makeUpdateFunction: (variables) => (proxy) => {
      // Read the data from our cache for this query.
      const proxyData = proxy.readQuery<GetAnimeQuery>({
        query: GetAnime,
        variables: { id: seedData?.media?.id },
      });
      console.log({ variables, proxyData });

      // Write our data back to the cache with the new progress in it
      proxy.writeQuery<GetAnimeQuery>({
        query: GetAnime,
        variables: { id: seedData?.media?.id },
        data: {
          ...proxyData,
          Media: {
            ...seedData?.media,
            id: seedData?.media?.id as number,
            mediaListEntry: {
              ...(proxyData?.Media?.mediaListEntry as MediaList),
              progress: variables?.progress,
            },
          },
        },
      });

      if (variables?.progress === proxyData?.Media?.episodes) {
        // TODO: show dropdown alert to notify that this anime was moved to "completed" list
        setTimeout(refetchList, 1000);
      }
    },
  });

  const progress =
    (shouldShowProgressShadow ? progressShadow : null) ??
    data?.Media?.mediaListEntry?.progress ??
    seedData?.progress ??
    0;

  useEffect(() => {
    // show live query
    setShouldShowProgressShadow(false);
  }, [data?.Media?.mediaListEntry?.progress]);

  async function changeProgress(type: "inc" | "dec", increment = 1) {
    // optimistic UI updates aren't fast enough
    setProgressShadow((p) => (type === "inc" ? p + increment : p - increment));
    setShouldShowProgressShadow(true);
    const newProgress =
      type === "inc" ? progress + increment : progress - increment;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    await updateProgressDebounced({
      id: data?.Media?.mediaListEntry?.id,
      progress: newProgress,
    });
  }

  return (
    <AnimeListItem
      navigation={navigation}
      progress={progress}
      disabled={loading}
      onIncrement={async () => changeProgress("inc")}
      onDecrement={async () => changeProgress("dec")}
      media={(data?.Media ?? seedData?.media) as AnimeFragmentFragment}
    />
  );
}
