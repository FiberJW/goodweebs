import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import React, { useState, useEffect } from "react";

import { AnimeListItem } from "yep/components/AnimeListItem";
import {
  AnimeFragmentFragment,
  UpdateProgressMutation,
  UpdateProgressMutationVariables,
  GetAnimeQuery,
  MediaList,
  useGetAnimeQuery,
  GetAnimeDocument,
  MediaListStatus,
  refetchGetAnimeQuery,
  refetchGetAnimeListQuery,
} from "yep/graphql/generated";
import { UpdateProgress } from "yep/graphql/mutations/UpdateProgress";
import { useDebouncedMutation } from "yep/hooks/helpers";
import { RootStackParamList, TabParamList } from "yep/navigation";

type Props = {
  seedData: {
    id: number;
    progress: number;
    media: AnimeFragmentFragment | null;
  };
  refetchList: () => Promise<void>;
  refetchListVariables: { userId?: number; status?: MediaListStatus | null };
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, "Anime">,
    StackNavigationProp<RootStackParamList>
  >;
};

export function AnimeListItemContainer({
  seedData,
  navigation,
  refetchList,
  refetchListVariables,
}: Props) {
  const [progressShadow, setProgressShadow] = useState(seedData.progress);
  const [shouldShowProgressShadow, setShouldShowProgressShadow] = useState(
    false
  );
  const { loading, data } = useGetAnimeQuery({
    variables: { id: seedData?.media?.id },
  });

  const updateProgressDebounced = useDebouncedMutation<
    UpdateProgressMutation,
    UpdateProgressMutationVariables
  >({
    mutationDocument: UpdateProgress,
    makeUpdateFunction: (variables) => (proxy) => {
      // Read the data from our cache for this query.
      const proxyData = proxy.readQuery<GetAnimeQuery>({
        query: GetAnimeDocument,
        variables: { id: seedData?.media?.id },
      });

      // Write our data back to the cache with the new progress in it
      proxy.writeQuery<GetAnimeQuery>({
        query: GetAnimeDocument,
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
        refetchList();
      }
    },
    refetchQueries: [
      refetchGetAnimeQuery({ id: seedData?.media?.id }),
      refetchGetAnimeListQuery(refetchListVariables),
    ],
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
    if (!data || loading) return;
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
      onIncrement={async () => changeProgress("inc")}
      onDecrement={async () => changeProgress("dec")}
      media={(data?.Media ?? seedData?.media) as AnimeFragmentFragment}
    />
  );
}
