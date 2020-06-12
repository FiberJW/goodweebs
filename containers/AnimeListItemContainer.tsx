import { useMutation, useQuery } from "@apollo/react-hooks";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";

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
  seedData?: {
    id: number;
    progress: number;
    media: AnimeFragmentFragment | null;
  };
  navigation: StackNavigationProp<RootStackParamList>;
};

export function AnimeListItemContainer({ seedData, navigation }: Props) {
  const { loading, data, refetch } = useQuery<
    GetAnimeQuery,
    GetAnimeQueryVariables
  >(GetAnime, { skip: !seedData?.id, variables: { id: seedData?.id } });

  const [updateProgress] = useMutation<
    UpdateProgressMutation,
    UpdateProgressMutationVariables
  >(UpdateProgress);

  const progress =
    data?.Media?.mediaListEntry?.progress ?? seedData?.progress ?? 0;

  console.log({ loading, data, refetch });

  return (
    <AnimeListItem
      navigation={navigation}
      progress={progress}
      //   disabled={loading}
      onIncrement={async () => {
        await updateProgress({
          variables: {
            id: seedData?.id,
            progress: progress + 1,
          },
        });
        await refetch({ id: data?.Media?.id });
      }}
      onDecrement={async () => {
        await updateProgress({
          variables: {
            id: seedData?.id,
            progress: progress - 1,
          },
        });
        await refetch({ id: data?.Media?.id });
      }}
      media={(data?.Media ?? seedData?.media) as AnimeFragmentFragment}
    />
  );
}
