import { useActionSheet } from "@expo/react-native-action-sheet";
import { formatDistanceToNow, add } from "date-fns";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { fbs } from "fbtee";
import React, { ReactNode, useEffect, useState } from "react";
import {
  RefreshControl,
  Text,
  View,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "yep/components/Button";
import { DescriptionRenderer } from "yep/components/DescriptionRenderer";
import { EmptyState } from "yep/components/EmptyState";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { LikeButton } from "yep/components/PosterAndTitle/LikeButton";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { MediaListStatusWithLabel } from "yep/constants";
import {
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
  useGetAnimeQuery,
  UpdateProgressDocument,
  UpdateScoreDocument,
  UpdateStatusDocument,
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
import { CharacterList } from "yep/screens/DetailsScreen/CharacterList";
import { DetailsSkeleton } from "yep/screens/DetailsScreen/DetailsSkeleton";
import { ExternalLink } from "yep/screens/DetailsScreen/ExternalLink";
import { RelatedAnimeList } from "yep/screens/DetailsScreen/RelatedAnimeList";
import { Stepper } from "yep/screens/DetailsScreen/Stepper";
import { Trailer } from "yep/screens/DetailsScreen/Trailer";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import {
  getDateText,
  getMediaListStatusLabel,
  getMediaStatusLabel,
  notEmpty,
  useGetTitle,
} from "yep/utils";

type InfoProps = { label: string; value: ReactNode };

function Info({ label, value }: InfoProps) {
  return (
    <View style={styles.infoContainer}>
      <Text style={styles.infoLabel} numberOfLines={1}>
        {label}
      </Text>
      {typeof value === "string" ? (
        <Text style={styles.infoValue} numberOfLines={2}>
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  );
}

export default function Details() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const animeId = parseInt(id, 10);
  const navigation = useNavigation();
  const { showActionSheetWithOptions } = useActionSheet();
  const insets = useSafeAreaInsets();
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [shouldShowScoreToggleUI] = usePersistedState<boolean>(
    StorageKeys.HIDE_SCORES_GLOBAL,
  );
  const [shouldPersistScoreVisibility] = usePersistedState<boolean>(
    StorageKeys.SHOULD_PERSIST_SCORE_VISIBILITY,
  );
  const [showScore, setShowScore] = usePersistedState<boolean>(
    StorageKeys.SHOW_SCORE_FOR_MEDIA,
    { id: String(animeId), doNotPersist: !shouldPersistScoreVisibility },
  );

  useEffect(() => {
    if (!showScore) {
      setShowScore(!shouldShowScoreToggleUI);
    }
  }, [shouldShowScoreToggleUI, showScore, setShowScore]);

  const getTitle = useGetTitle();

  const [isRefetchingFromScrollOrMount, setIsRefetchingFromScrollOrMount] =
    useState(true);

  const now = useNow();

  const { loading, data, refetch, error } = useGetAnimeQuery({
    variables: { id: animeId },
    notifyOnNetworkStatusChange: true,
  });

  const [toggleFavorite] = useToggleFavoriteMutation();

  // Set navigation title dynamically
  useEffect(() => {
    if (data?.Media) {
      navigation.setOptions({
        title: getTitle(data.Media.title) ?? "",
      });
    }
  }, [data, navigation, getTitle]);

  const mediaListEntryId = data?.Media?.mediaListEntry?.id;
  const cacheScore = data?.Media?.mediaListEntry?.score ?? 0;
  const cacheProgress = data?.Media?.mediaListEntry?.progress ?? 0;
  const progressUpperBound = data?.Media?.episodes;
  const [displayScore, setDisplayScore] = useState(cacheScore);
  const [displayProgress, setDisplayProgress] = useState(cacheProgress);

  useEffect(() => {
    setDisplayScore(cacheScore);
  }, [cacheScore]);

  useEffect(() => {
    setDisplayProgress(cacheProgress);
  }, [cacheProgress]);

  const updateStatus = useDebouncedMutation<
    UpdateStatusMutation,
    UpdateStatusMutationVariables
  >({
    mutationDocument: UpdateStatusDocument,
    makeUpdateFunction: (variables) => (cache) => {
      if (!mediaListEntryId || !variables?.status) return;

      cache.modify({
        id: cache.identify({ __typename: "MediaList", id: mediaListEntryId }),
        fields: {
          status: () => variables.status,
        },
      });
    },
  });

  const removeFromList = useDebouncedMutation<
    RemoveFromListMutation,
    RemoveFromListMutationVariables
  >({
    mutationDocument: RemoveFromListDocument,
    makeUpdateFunction: () => (cache) => {
      if (!mediaListEntryId) return;

      cache.modify({
        id: cache.identify({ __typename: "Media", id: animeId }),
        fields: {
          mediaListEntry: () => null,
        },
      });
      cache.evict({
        id: cache.identify({ __typename: "MediaList", id: mediaListEntryId }),
      });
      cache.gc();
    },
  });

  const updateScore = useDebouncedMutation<
    UpdateScoreMutation,
    UpdateScoreMutationVariables
  >({
    mutationDocument: UpdateScoreDocument,
    makeUpdateFunction: (variables) => (cache) => {
      if (!mediaListEntryId || variables?.scoreRaw === undefined) return;

      cache.modify({
        id: cache.identify({ __typename: "MediaList", id: mediaListEntryId }),
        fields: {
          score: () => (variables.scoreRaw ?? 0) / 10,
        },
      });
    },
  });

  const updateProgress = useDebouncedMutation<
    UpdateProgressMutation,
    UpdateProgressMutationVariables
  >({
    mutationDocument: UpdateProgressDocument,
    makeUpdateFunction: (variables) => (cache) => {
      if (!mediaListEntryId || variables?.progress === undefined) return;

      cache.modify({
        id: cache.identify({ __typename: "MediaList", id: mediaListEntryId }),
        fields: {
          progress: () => variables.progress,
        },
      });
    },
  });

  function clampScore(value: number) {
    return Math.min(Math.max(value, 0), 10);
  }

  function clampProgress(value: number) {
    const clamped = Math.max(value, 0);
    return typeof progressUpperBound === "number"
      ? Math.min(clamped, progressUpperBound)
      : clamped;
  }

  async function changeScore(type: "inc" | "dec") {
    if (!mediaListEntryId) return;

    const nextScore = clampScore(
      type === "inc" ? displayScore + 1 : displayScore - 1,
    );
    if (nextScore === displayScore) return;
    setDisplayScore(nextScore);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await updateScore({
        id: mediaListEntryId,
        scoreRaw: nextScore * 10,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function changeProgress(type: "inc" | "dec") {
    if (!mediaListEntryId) return;

    const nextProgress = clampProgress(
      type === "inc" ? displayProgress + 1 : displayProgress - 1,
    );
    if (nextProgress === displayProgress) return;
    setDisplayProgress(nextProgress);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await updateProgress({
        id: mediaListEntryId,
        progress: nextProgress,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function refetchFromScroll() {
    setIsRefetchingFromScrollOrMount(true);
    await refetch({ id: animeId });
    setIsRefetchingFromScrollOrMount(false);
  }

  const relations = (data?.Media?.relations?.edges ?? [])?.filter(notEmpty);

  const mappedRelations: {
    [K in MediaRelation]?: AnimeRelationFragmentFragment[];
  } = {};

  for (const relation of relations) {
    const relationType = relation.relationType;
    const node = relation.node;

    if (!relationType || !node || node.type !== MediaType.Anime) continue;

    (mappedRelations[relationType] ??= []).push(node);
  }

  const externalLinks = data?.Media?.externalLinks?.filter(notEmpty);
  const studio = (data?.Media?.studios?.nodes ?? [])[0]?.name;
  const statusOptions = MediaListStatusWithLabel.map(({ value }) => ({
    label: getMediaListStatusLabel(value),
    value,
  }));

  return (
    <ScrollView
      style={styles.container}
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
        loading ? (
          <DetailsSkeleton />
        ) : error ? (
          <EmptyState
            title={String(fbs("Could not find anime", "Anime not found error title"))}
            description={`${String(
              fbs(
                "We ran into an unexpected error loading the requested anime:",
                "Anime not found error description prefix",
              ),
            )} ${error?.message}`}
          />
        ) : null
      ) : (
        <>
          <View style={styles.posterAndInfoContainer}>
            <PosterAndTitle
              size="details"
              uri={data?.Media?.coverImage?.large ?? ""}
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
                  isLiked={Boolean(data?.Media?.isFavourite)}
                  onPress={async () => {
                    try {
                      await toggleFavorite({
                        variables: {
                          animeId: data?.Media?.id,
                        },
                        update: (cache) => {
                          cache.modify({
                            id: cache.identify({
                              __typename: "Media",
                              id: animeId,
                            }),
                            fields: {
                              isFavourite: (current) => !current,
                            },
                          });
                        },
                      });
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                />
              </View>
            </PosterAndTitle>
            <View style={styles.infoTable}>
              <View style={styles.infoRow}>
                {data?.Media?.episodes ? (
                  <Info
                    label={String(fbs("Episodes", "Anime details episodes label"))}
                    value={`${data?.Media?.episodes}`}
                  />
                ) : null}
                <Info
                  label={String(fbs("Genre", "Anime details genre label"))}
                  value={data?.Media?.genres?.join(", ") ?? ""}
                />
              </View>
              <View style={styles.infoRow}>
                {data?.Media?.averageScore ? (
                  <PressableOpacity
                    useDisabledOpacity={false}
                    style={{ flexDirection: "row", gap: 8, flex: 1 }}
                    disabled={!shouldShowScoreToggleUI || showScore}
                    onPress={() => setShowScore(!showScore)}
                  >
                    <Info
                      label={String(
                        fbs("Average score", "Anime details average score label"),
                      )}
                      value={
                        showScore ? (
                          `${(data?.Media?.averageScore ?? 0) / 10} / 10`
                        ) : (
                          <Text
                            numberOfLines={2}
                            style={[
                              styles.infoValue,
                              { textDecorationLine: "underline" },
                            ]}
                          >
                            {String(
                              fbs(
                                "Tap to show",
                                "Anime details average score hidden prompt",
                              ),
                            )}
                          </Text>
                        )
                      }
                    />
                  </PressableOpacity>
                ) : null}
                <Info
                  label={String(fbs("Status", "Anime details status label"))}
                  value={
                    data?.Media?.status
                      ? getMediaStatusLabel(data.Media.status)
                      : ""
                  }
                />
              </View>
              <View style={styles.infoRow}>
                {studio ? (
                  <Info
                    label={String(fbs("Studio", "Anime details studio label"))}
                    value={studio}
                  />
                ) : null}
                {data?.Media?.status === MediaStatus.Releasing &&
                data?.Media?.nextAiringEpisode ? (
                  <Info
                    label={String(
                      fbs("Next episode", "Anime details next episode label"),
                    )}
                    value={`${String(
                      fbs("EP", "Episode abbreviation for next episode"),
                    )} ${
                      data?.Media?.nextAiringEpisode?.episode
                    } ${String(
                      fbs("airs in", "Next episode airs in label"),
                    )} ${formatDistanceToNow(
                      add(now, {
                        seconds:
                          data?.Media?.nextAiringEpisode?.timeUntilAiring ?? 0,
                      }),
                    )}`}
                  />
                ) : null}
                {data?.Media?.status === MediaStatus.NotYetReleased &&
                data.Media.startDate &&
                getDateText(data.Media.startDate) ? (
                  <Info
                    label={String(
                      fbs("Start date", "Anime details start date label"),
                    )}
                    value={getDateText(data.Media.startDate)!}
                  />
                ) : null}

                {(data?.Media?.status === MediaStatus.Finished ||
                  data?.Media?.status === MediaStatus.Cancelled) &&
                data?.Media?.endDate &&
                getDateText(data.Media.endDate) ? (
                  <Info
                    label={String(
                      fbs("End date", "Anime details end date label"),
                    )}
                    value={getDateText(data.Media.endDate)!}
                  />
                ) : null}
              </View>
            </View>
          </View>
          <View style={styles.buttonsRow}>
            <Button
              size="small"
              containerStyle={{ flex: 1 }}
              loading={loadingStatus}
              label={
                data?.Media?.mediaListEntry?.status
                  ? getMediaListStatusLabel(data.Media.mediaListEntry.status)
                  : String(fbs("Add to list", "Anime details add to list button"))
              }
              onPress={() => {
                const options = statusOptions.map(
                  (s) =>
                    `${
                      data?.Media?.mediaListEntry?.status === s.value
                        ? "✔ "
                        : ""
                    }${s.label}`,
                );

                const mediaListEntry = data?.Media?.mediaListEntry;

                mediaListEntry &&
                  options.push(
                    String(
                      fbs(
                        "Remove from list",
                        "Anime details remove from list action sheet option",
                      ),
                    ),
                  );
                options.push(
                  String(
                    fbs("Cancel", "Anime details cancel action sheet option"),
                  ),
                );

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
                        mediaId: data?.Media?.id,
                        status: statusOptions[buttonIndex].value,
                      });
                    }
                    setLoadingStatus(false);
                  },
                );
              }}
            />
          </View>
          {data?.Media?.mediaListEntry &&
          data.Media.status !== MediaStatus.NotYetReleased ? (
            <>
              <Stepper
                label={String(fbs("Score", "Anime details score stepper label"))}
                icon={
                  <Image
                    style={{ height: 24, width: 24, marginRight: 4 }}
                    source={require("yep/assets/icons/star.png")}
                  />
                }
                value={displayScore}
                upperBound={10}
                lowerBound={0}
                onIncrement={() => changeScore("inc")}
                onDecrement={() => changeScore("dec")}
              />
              <Stepper
                icon={
                  <Image
                    style={{ height: 24, width: 24, marginRight: 4 }}
                    source={require("yep/assets/icons/progress.png")}
                  />
                }
                label={String(
                  fbs("Progress", "Anime details progress stepper label"),
                )}
                value={displayProgress}
                upperBound={data?.Media?.episodes ?? undefined}
                lowerBound={0}
                onIncrement={() => changeProgress("inc")}
                onDecrement={() => changeProgress("dec")}
              />
            </>
          ) : null}
          {data?.Media?.description ? (
            <DescriptionRenderer description={data.Media.description} />
          ) : null}

          {data.Media?.trailer ? (
            <Trailer trailer={data.Media?.trailer} />
          ) : null}
          {data.Media?.characters?.nodes ? (
            <CharacterList
              characters={(data.Media?.characters?.nodes ?? []).filter(
                notEmpty,
              )}
            />
          ) : null}
          {Object.keys(mappedRelations).map((key: string) => {
            const relationType = key as MediaRelation;
            const relations = mappedRelations[relationType] ?? [];

            return (
              <RelatedAnimeList
                key={key}
                relationType={relationType}
                relations={relations}
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
                {String(fbs("External links", "Anime details external links title"))}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
  },
  infoTable: {
    flex: 1,
    gap: 8,
  },
  infoContainer: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: Manrope.regular,
    fontSize: 12.8,
    color: darkTheme.text,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: Manrope.semiBold,
    fontSize: 16,
    color: darkTheme.text,
  },
  posterAndInfoContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
});
