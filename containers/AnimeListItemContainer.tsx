import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import { cloneDeep } from "lodash";
import React, { useState, useEffect } from "react";

import { AnimeListItem } from "yep/components/AnimeListItem";
import {
  UpdateProgressMutation,
  UpdateProgressMutationVariables,
  MediaListStatus,
  GetAnimeListDocument,
  GetAnimeListQuery,
} from "yep/graphql/generated";
import { UpdateProgress } from "yep/graphql/mutations/UpdateProgress";
import { useDebouncedMutation } from "yep/hooks/helpers";
import { RootStackParamList, TabParamList } from "yep/navigation";

type AnimeListEntry = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<
        NonNullable<GetAnimeListQuery["MediaListCollection"]>["lists"]
      >[number]
    >["entries"]
  >[number]
>;

type Props = {
  animeListEntry: AnimeListEntry;
  refetchList: () => Promise<void>;
  refetchListVariables: { userId?: number; status?: MediaListStatus | null };
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, "Anime">,
    StackNavigationProp<RootStackParamList>
  >;
  first: boolean;
  last: boolean;
};

export function AnimeListItemContainer({
  animeListEntry,
  navigation,
  refetchList,
  refetchListVariables,
  first,
  last,
}: Props) {
  // const [progressShadow, setProgressShadow] = useState(
  //   animeListEntry.progress ?? 0
  // );
  // const [shouldShowProgressShadow, setShouldShowProgressShadow] =
  //   useState(false);

  const updateProgressDebounced = useDebouncedMutation<
    UpdateProgressMutation,
    UpdateProgressMutationVariables
  >({
    mutationDocument: UpdateProgress,
    makeUpdateFunction: (variables) => (cache) => {
      const existingList = cloneDeep(
        cache.readQuery<GetAnimeListQuery>({
          query: GetAnimeListDocument,
          variables: refetchListVariables,
        })
      );

      console.log({ variables });

      if (existingList) {
        // TODO: this isn't updating the related list query.only updating the individual media
        // entry does
        cache.writeQuery<GetAnimeListQuery>({
          query: GetAnimeListDocument,
          variables: refetchListVariables,
          data: {
            ...existingList,
            MediaListCollection: {
              ...existingList.MediaListCollection,
              lists: existingList.MediaListCollection?.lists?.map((list) => {
                if (list?.status === refetchListVariables.status) {
                  return {
                    ...list,
                    entries: list?.entries?.map((entry) => {
                      if (
                        entry?.media?.id &&
                        entry.media.id === animeListEntry.media?.id
                      ) {
                        // TODO: show dropdown alert to notify that this anime was moved to "completed" list
                        if (variables.progress === entry.media?.episodes)
                          refetchList();

                        return {
                          ...entry,
                          media: {
                            ...entry.media,
                            progress: variables.progress,
                          },
                        };
                      }

                      return entry;
                    }),
                  };
                }

                return list;
              }),
            },
          },
        });
      }
    },
  });

  const progress =
    // (shouldShowProgressShadow ? progressShadow : null) ??
    animeListEntry.progress ?? 0;

  useEffect(() => {
    // show data from apollo when cache is updated
    // setShouldShowProgressShadow(false);
  }, [animeListEntry.progress]);

  async function changeProgress(type: "inc" | "dec", increment = 1) {
    // optimistic UI updates aren't fast enough
    // setProgressShadow((p) => (type === "inc" ? p + increment : p - increment));
    // setShouldShowProgressShadow(true);
    const newProgress =
      type === "inc" ? progress + increment : progress - increment;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    await updateProgressDebounced({
      id: animeListEntry.id,
      progress: newProgress,
    });
  }

  if (!animeListEntry.media) {
    console.error("animeListEntry.media is null. this should never happen");
    return null;
  }

  return (
    <AnimeListItem
      navigation={navigation}
      progress={progress}
      onIncrement={async () => changeProgress("inc")}
      onDecrement={async () => changeProgress("dec")}
      media={animeListEntry.media}
      first={first}
      last={last}
    />
  );
}
