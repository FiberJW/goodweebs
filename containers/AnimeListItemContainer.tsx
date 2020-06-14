import { useMutation, useQuery } from "@apollo/react-hooks";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState, useEffect } from "react";

import { AnimeListItem } from "yep/components/AnimeListItem";
import {
  AnimeFragmentFragment,
  UpdateProgressMutation,
  UpdateProgressMutationVariables,
  GetAnimeQuery,
  GetAnimeQueryVariables,
} from "yep/graphql/generated";
import { UpdateProgress } from "yep/graphql/mutations/UpdateProgress";
import { GetAnime } from "yep/graphql/queries/AnimeDetails";
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

  const [updateProgress] = useMutation<
    UpdateProgressMutation,
    UpdateProgressMutationVariables
  >(UpdateProgress);

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

    await updateProgress({
      variables: {
        id: data?.Media?.mediaListEntry?.id,
        progress: newProgress,
      },
      update: (proxy) => {
        // Read the data from our cache for this query.
        const data = proxy.readQuery<GetAnimeQuery>({
          query: GetAnime,
          variables: { id: seedData?.media?.id },
        });
        // Write our data back to the cache with the new progress in it
        proxy.writeQuery<GetAnimeQuery>({
          query: GetAnime,
          variables: { id: seedData?.media?.id },
          data: {
            ...data,
            Media: {
              ...data?.Media,
              // @ts-ignore this object will exist
              mediaListEntry: {
                ...data?.Media?.mediaListEntry,
                progress: newProgress,
              },
            },
          },
        });

        if (newProgress === data?.Media?.episodes) {
          refetchList();
        }
      },
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
