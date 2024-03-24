import { useActionSheet } from "@expo/react-native-action-sheet";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { formatDistanceToNow, add } from "date-fns";
import * as Haptics from "expo-haptics";
import _ from "lodash";
import React, { ReactNode, useEffect, useState } from "react";
import { RefreshControl, Text, View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import title from "title";

import { Button } from "yep/components/Button";
import { DescriptionRenderer } from "yep/components/DescriptionRenderer";
import { EmptyState } from "yep/components/EmptyState";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { LikeButton } from "yep/components/PosterAndTitle/LikeButton";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { MediaListStatusWithLabel, MediaStatusWithLabel } from "yep/constants";
import {
  GetAnimeQuery,
  MediaStatus,
  UpdateStatusMutation,
  UpdateStatusMutationVariables,
  UpdateScoreMutation,
  UpdateScoreMutationVariables,
  UpdateProgressMutation,
  UpdateProgressMutationVariables,
  MediaRelation,
  AnimeRelationFragmentFragment,
  MediaType,
  MediaList,
  useGetAnimeQuery,
  GetAnimeDocument,
  UpdateProgressDocument,
  UpdateScoreDocument,
  UpdateStatusDocument,
  refetchGetAnimeQuery,
  useToggleFavoriteMutation,
  RemoveFromListMutation,
  RemoveFromListMutationVariables,
  RemoveFromListDocument,
} from "yep/graphql/generated";
import {
  useNow,
  useDebouncedMutation,
  usePersistedState,
  StorageKeys,
} from "yep/hooks/helpers";
import { RootStackParamList } from "yep/navigation";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { getDateText, notEmpty } from "yep/utils";

import { CharacterList } from "./CharacterList";
import { ExternalLink } from "./ExternalLink";
import { RelatedAnimeList } from "./RelatedAnimeList";
import { Stepper } from "./Stepper";
import { Trailer } from "./Trailer";

const Container = takimoto.ScrollView({
  flex: 1,
  padding: 16,
});

const Title = takimoto.Text({
  color: darkTheme.text,
  fontFamily: Manrope.extraBold,
  fontSize: 31.25,
  marginBottom: 16,
});

const InfoRow = takimoto.View({
  flexDirection: "row",
});

const InfoTable = takimoto.View({
  flex: 1,
  gap: 8,
});

const InfoContainer = takimoto.View({
  flex: 1,
});

const InfoLabel = takimoto.Text({
  fontFamily: Manrope.regular,
  fontSize: 12.8,
  color: darkTheme.text,
  marginBottom: 4,
});

const InfoValue = takimoto.Text({
  fontFamily: Manrope.semiBold,
  fontSize: 16,
  color: darkTheme.text,
});

const PosterAndInfoContainer = takimoto.View({
  flexDirection: "row",
  marginBottom: 16,
});

type InfoProps = { label: string; value: ReactNode };

function Info({ label, value }: InfoProps) {
  return (
    <InfoContainer>
      <InfoLabel numberOfLines={1}>{label}</InfoLabel>
      {typeof value === "string" ? (
        <InfoValue numberOfLines={2}>{value}</InfoValue>
      ) : (
        value
      )}
    </InfoContainer>
  );
}

const ButtonsRow = takimoto.View({
  flexDirection: "row",
  width: "100%",
  alignItems: "center",
  marginBottom: 16,
});

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, "Details">;
};

export function DetailsScreen({ route, navigation }: Props) {
  const { showActionSheetWithOptions } = useActionSheet();
  const insets = useSafeAreaInsets();
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [shouldShowScoreToggleUI] = usePersistedState<boolean>(
    StorageKeys.HIDE_SCORES_GLOBAL
  );
  const [shouldPersistScoreVisibility] = usePersistedState<boolean>(
    StorageKeys.SHOULD_PERSIST_SCORE_VISIBILITY
  );
  const [showScore, setShowScore] = usePersistedState<boolean>(
    StorageKeys.SHOW_SCORE_FOR_MEDIA,
    { id: String(route.params.id), doNotPersist: !shouldPersistScoreVisibility }
  );

  // sync shouldShowScoreToggleUI with showScore in useeffect because the default value can be
  // different from the persisted value
  useEffect(() => {
    if (!showScore) {
      setShowScore(!shouldShowScoreToggleUI);
    }
  }, [shouldShowScoreToggleUI]);

  const [isRefetchingFromScrollOrMount, setIsRefetchingFromScrollOrMount] =
    useState(true);

  const now = useNow();

  const { loading, data, refetch, error } = useGetAnimeQuery({
    variables: { id: route.params.id },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const [toggleFavorite] = useToggleFavoriteMutation();

  const updateStatus = useDebouncedMutation<
    UpdateStatusMutation,
    UpdateStatusMutationVariables
  >({
    mutationDocument: UpdateStatusDocument,
    makeUpdateFunction: (variables) => (proxy) => {
      const proxyData = proxy.readQuery<GetAnimeQuery>({
        query: GetAnimeDocument,
        variables: { id: route.params.id },
      });

      if (proxyData?.Media?.mediaListEntry) {
        proxy.writeQuery<GetAnimeQuery>({
          query: GetAnimeDocument,
          variables: { id: route.params.id },
          data: {
            ...proxyData,
            Media: {
              ...proxyData?.Media,
              id: proxyData?.Media?.id as number,
              mediaListEntry: {
                ...(proxyData?.Media?.mediaListEntry as MediaList),
                status: variables?.status,
              },
            },
          },
        });
      }
    },
    wait: 0,
    refetchQueries: [refetchGetAnimeQuery({ id: route.params.id })],
  });

  const removeFromList = useDebouncedMutation<
    RemoveFromListMutation,
    RemoveFromListMutationVariables
  >({
    mutationDocument: RemoveFromListDocument,
    makeUpdateFunction: (_variables) => (proxy) => {
      const proxyData = proxy.readQuery<GetAnimeQuery>({
        query: GetAnimeDocument,
        variables: { id: route.params.id },
      });

      if (proxyData?.Media?.mediaListEntry) {
        proxy.writeQuery<GetAnimeQuery>({
          query: GetAnimeDocument,
          variables: { id: route.params.id },
          data: {
            ...proxyData,
            Media: {
              ...proxyData?.Media,
              id: proxyData?.Media?.id as number,
              mediaListEntry: undefined,
            },
          },
        });
      }
    },
    wait: 0,
    refetchQueries: [refetchGetAnimeQuery({ id: route.params.id })],
  });

  const updateScore = useDebouncedMutation<
    UpdateScoreMutation,
    UpdateScoreMutationVariables
  >({
    mutationDocument: UpdateScoreDocument,
    makeUpdateFunction: (variables) => (proxy) => {
      const proxyData = proxy.readQuery<GetAnimeQuery>({
        query: GetAnimeDocument,
        variables: { id: route.params.id },
      });

      if (proxyData?.Media?.mediaListEntry) {
        proxy.writeQuery<GetAnimeQuery>({
          query: GetAnimeDocument,
          variables: { id: route.params.id },
          data: {
            ...proxyData,
            Media: {
              ...proxyData?.Media,
              id: proxyData?.Media?.id as number,
              mediaListEntry: {
                ...(proxyData?.Media?.mediaListEntry as MediaList),
                score: (variables?.scoreRaw ?? 0) / 10,
              },
            },
          },
        });
      }
    },
    refetchQueries: [refetchGetAnimeQuery({ id: route.params.id })],
  });

  const updateProgress = useDebouncedMutation<
    UpdateProgressMutation,
    UpdateProgressMutationVariables
  >({
    mutationDocument: UpdateProgressDocument,
    makeUpdateFunction: (variables) => (proxy) => {
      const proxyData = proxy.readQuery<GetAnimeQuery>({
        query: GetAnimeDocument,
        variables: { id: route.params.id },
      });

      if (proxyData?.Media?.mediaListEntry) {
        proxy.writeQuery<GetAnimeQuery>({
          query: GetAnimeDocument,
          variables: { id: route.params.id },
          data: {
            ...proxyData,
            Media: {
              ...proxyData?.Media,
              id: proxyData?.Media?.id as number,
              mediaListEntry: {
                ...(proxyData?.Media?.mediaListEntry as MediaList),
                progress: variables?.progress,
              },
            },
          },
        });
      }

      if (variables?.progress === proxyData?.Media?.episodes) {
        // TODO: show dropdown alert to notify that this anime was moved to "completed" list
      }
    },
    refetchQueries: [refetchGetAnimeQuery({ id: route.params.id })],
  });

  async function refetchFromScroll() {
    setIsRefetchingFromScrollOrMount(true);
    await refetch({ id: route.params.id });
    setIsRefetchingFromScrollOrMount(false);
  }

  const relations = (data?.Media?.relations?.edges ?? [])?.filter(notEmpty);

  const mappedRelations = _.reduce<
    typeof relations[number],
    { [K in MediaRelation]?: AnimeRelationFragmentFragment[] }
  >(
    relations,
    function (result, value, _key) {
      if (
        !value?.relationType ||
        !value.node ||
        !(value.node.type === MediaType.Anime)
      )
        return result;

      if (result[value?.relationType]) {
        result[value?.relationType]!.push(value.node);
      } else {
        result[value?.relationType] = [value.node];
      }

      return result;
    },
    {}
  );

  const externalLinks = data?.Media?.externalLinks?.filter(notEmpty);
  const studio = (data?.Media?.studios?.nodes ?? [])[0]?.name;

  return (
    <Container
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetchingFromScrollOrMount && loading}
          onRefresh={refetchFromScroll}
          tintColor={darkTheme.text}
          titleColor={darkTheme.text}
        />
      }
    >
      {!data ? (
        !loading && error ? (
          <EmptyState
            title="Could not find anime"
            description={`We ran into an unexpected error loading the requested anime: ${error?.message}`}
          />
        ) : null
      ) : (
        <>
          <Title numberOfLines={5}>
            {data.Media?.title?.english ??
              data.Media?.title?.romaji ??
              data.Media?.title?.native}
          </Title>
          <PosterAndInfoContainer>
            <PosterAndTitle
              size="details"
              uri={data.Media?.coverImage?.large ?? ""}
              style={{ marginRight: 16 }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  padding: 8,
                }}
              >
                <LikeButton
                  isLiked={Boolean(data.Media?.isFavourite)}
                  onPress={async () => {
                    try {
                      await toggleFavorite({
                        variables: {
                          animeId: data.Media?.id,
                        },
                        refetchQueries: [
                          refetchGetAnimeQuery({ id: route.params.id }),
                        ],
                      });
                    } catch (error) {
                      console.error(error);
                      // TODO: toast this error
                    }
                  }}
                />
              </View>
            </PosterAndTitle>
            <InfoTable>
              <InfoRow>
                {data.Media?.episodes ? (
                  <Info label="Episodes" value={`${data.Media?.episodes}`} />
                ) : null}
                <Info
                  label="Genre"
                  value={data.Media?.genres?.join(", ") ?? ""}
                />
              </InfoRow>
              <InfoRow>
                {data.Media?.averageScore ? (
                  <PressableOpacity
                    useDisabledOpacity={false}
                    style={{ flexDirection: "row", gap: 8, flex: 1 }}
                    disabled={!shouldShowScoreToggleUI || showScore}
                    onPress={() => setShowScore(!showScore)}
                  >
                    <Info
                      label="Average score"
                      value={
                        showScore ? (
                          `${(data.Media?.averageScore ?? 0) / 10} / 10`
                        ) : (
                          <InfoValue
                            numberOfLines={2}
                            style={{ textDecorationLine: "underline" }}
                          >
                            Tap to show
                          </InfoValue>
                        )
                      }
                    />
                  </PressableOpacity>
                ) : null}
                <Info
                  label="Status"
                  value={title(
                    MediaStatusWithLabel.find(
                      (m) => m.value === data.Media?.status
                    )?.label ?? ""
                  )}
                />
              </InfoRow>
              <InfoRow>
                {studio ? <Info label="Studio" value={studio} /> : null}
                {data.Media?.status === MediaStatus.Releasing &&
                data.Media?.nextAiringEpisode ? (
                  <Info
                    label="Next episode"
                    value={`EP ${
                      data.Media?.nextAiringEpisode?.episode
                    } airs in ${formatDistanceToNow(
                      add(now, {
                        seconds:
                          data.Media?.nextAiringEpisode?.timeUntilAiring ?? 0,
                      })
                    )}`}
                  />
                ) : null}
                {data.Media?.status === MediaStatus.NotYetReleased &&
                data.Media.startDate &&
                getDateText(data.Media.startDate) ? (
                  <Info
                    label="Start date"
                    value={getDateText(data.Media.startDate)!}
                  />
                ) : null}

                {(data.Media?.status === MediaStatus.Finished ||
                  data.Media?.status === MediaStatus.Cancelled) &&
                data.Media?.endDate &&
                getDateText(data.Media.endDate) ? (
                  <Info
                    label="End date"
                    value={getDateText(data.Media.endDate)!}
                  />
                ) : null}
              </InfoRow>
            </InfoTable>
          </PosterAndInfoContainer>
          <ButtonsRow>
            <Button
              size="small"
              containerStyle={{ flex: 1 }}
              loading={loadingStatus}
              label={
                MediaListStatusWithLabel.find(
                  (x) => x.value === data.Media?.mediaListEntry?.status
                )?.label ?? "Add to List"
              }
              onPress={() => {
                const options = MediaListStatusWithLabel.map(
                  (s) =>
                    `${
                      data.Media?.mediaListEntry?.status === s.value ? "✔ " : ""
                    }${s.label}`
                );

                const mediaListEntry = data.Media?.mediaListEntry;

                mediaListEntry && options.push("Remove from List");
                options.push("Cancel");

                const destructiveButtonIndex = mediaListEntry
                  ? options.length - 2
                  : undefined;

                const cancelButtonIndex = options.length - 1;

                showActionSheetWithOptions(
                  {
                    options,
                    destructiveButtonIndex,
                    cancelButtonIndex,
                    destructiveColor: darkTheme.accent,
                  },
                  async (buttonIndex) => {
                    if (
                      buttonIndex === undefined ||
                      buttonIndex === cancelButtonIndex
                    )
                      return;

                    setLoadingStatus(true);

                    if (mediaListEntry && buttonIndex === options.length - 2) {
                      await removeFromList({
                        id: mediaListEntry.id,
                      });
                    } else {
                      await updateStatus({
                        mediaId: data.Media?.id,
                        status: MediaListStatusWithLabel[buttonIndex].value,
                      });
                    }
                    setLoadingStatus(false);
                  }
                );
              }}
            />
          </ButtonsRow>
          {data.Media?.mediaListEntry &&
          data.Media.status !== MediaStatus.NotYetReleased ? (
            <>
              <Stepper
                label="Score"
                icon={
                  <Image
                    style={{ height: 24, width: 24, marginRight: 4 }}
                    source={require("yep/assets/icons/star.png")}
                  />
                }
                defaultValue={data.Media?.mediaListEntry?.score ?? 5}
                upperBound={10}
                lowerBound={0}
                onChange={async (s) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  try {
                    await updateScore({
                      id: data.Media?.mediaListEntry?.id,
                      scoreRaw: s * 10,
                    });
                  } catch (e) {
                    // TODO: display error
                    console.error(e);
                  }
                }}
              />
              <Stepper
                icon={
                  <Image
                    style={{ height: 24, width: 24, marginRight: 4 }}
                    source={require("yep/assets/icons/progress.png")}
                  />
                }
                label="Progress"
                defaultValue={data.Media.mediaListEntry.progress ?? 0}
                upperBound={data.Media?.episodes ?? undefined}
                lowerBound={0}
                onChange={async (progress) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  try {
                    if (!data.Media?.mediaListEntry)
                      throw new Error(
                        "no mediaListEntry during progress update user interaction. this should never happen"
                      );

                    await updateProgress({
                      id: data.Media.mediaListEntry.id,
                      progress,
                    });
                  } catch (e) {
                    // TODO: display error
                    console.error(e);
                  }
                }}
              />
            </>
          ) : null}
          {data.Media?.description ? (
            <DescriptionRenderer description={data.Media.description} />
          ) : null}

          {data.Media?.trailer ? (
            <Trailer trailer={data.Media?.trailer} />
          ) : null}
          {data.Media?.characters?.nodes ? (
            <CharacterList
              characters={(data.Media?.characters?.nodes).filter(notEmpty)}
              navigation={navigation}
            />
          ) : null}
          {/* TODO: maybe this should be a flatlist */}
          {Object.keys(mappedRelations).map((key: string) => {
            const relationType = key as MediaRelation;
            const relations = mappedRelations[relationType] ?? [];

            return (
              <RelatedAnimeList
                key={key}
                relationType={relationType}
                relations={relations}
                navigation={navigation}
              />
            );
          })}

          {externalLinks?.length ? (
            <>
              <View style={{ height: 16 }} />
              <Text
                style={{
                  fontFamily: Manrope.semiBold,
                  color: darkTheme.text,
                  fontSize: 20,
                }}
              >
                External Links
              </Text>
              <View style={{ height: 16 }} />
              <View style={{ gap: 8 }}>
                {externalLinks.map((link) => (
                  <ExternalLink {...link} key={link.id} />
                ))}
              </View>
            </>
          ) : null}
        </>
      )}
    </Container>
  );
}
