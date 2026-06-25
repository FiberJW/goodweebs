import { useActionSheet } from "@expo/react-native-action-sheet";
import { formatDistanceToNow, add } from "date-fns";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { fbs } from "fbtee";
import reduce from "lodash/reduce";
import React, { ReactNode, useEffect, useState } from "react";
import {
  RefreshControl,
  Text,
  View,
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
  useGetAnimeQuery,
  UpdateProgressDocument,
  UpdateScoreDocument,
  UpdateStatusDocument,
  useToggleFavoriteMutation,
  RemoveFromListDocument,
} from "yep/graphql/generated";
import type {
  AnimeRelationFragmentFragment,
  MediaRelation,
  RemoveFromListMutation,
  RemoveFromListMutationVariables,
  UpdateProgressMutation,
  UpdateProgressMutationVariables,
  UpdateScoreMutation,
  UpdateScoreMutationVariables,
  UpdateStatusMutation,
  UpdateStatusMutationVariables,
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
type DetailsMedia = NonNullable<
  NonNullable<ReturnType<typeof useGetAnimeQuery>["data"]>["Media"]
>;
type ExternalLinkData = NonNullable<
  NonNullable<DetailsMedia["externalLinks"]>[number]
>;
type MappedRelations = {
  [K in MediaRelation]?: AnimeRelationFragmentFragment[];
};
type StatusOption = {
  label: string;
  value: (typeof MediaListStatusWithLabel)[number]["value"];
};

function clampScore(value: number) {
  return Math.min(Math.max(value, 0), 10);
}

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

function PosterInfoSection({
  animeId,
  media,
  now,
  shouldShowScoreToggleUI,
  showScore,
  setShowScore,
  studio,
}: {
  animeId: number;
  media: DetailsMedia;
  now: Date;
  shouldShowScoreToggleUI: boolean;
  showScore: boolean;
  setShowScore: (showScore: boolean) => boolean;
  studio?: string;
}) {
  const [toggleFavorite] = useToggleFavoriteMutation();

  return (
    <View style={styles.posterAndInfoContainer}>
      <PosterAndTitle
        size="details"
        uri={media.coverImage?.large ?? ""}
        style={{ marginRight: 16 }}
      >
        <View style={styles.posterActionOverlay}>
          <LikeButton
            isLiked={Boolean(media.isFavourite)}
            onPress={async () => {
              try {
                await toggleFavorite({
                  variables: {
                    animeId: media.id,
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
          {media.episodes ? (
            <Info
              label={String(fbs("Episodes", "Anime details episodes label"))}
              value={`${media.episodes}`}
            />
          ) : null}
          <Info
            label={String(fbs("Genre", "Anime details genre label"))}
            value={media.genres?.join(", ") ?? ""}
          />
        </View>
        <View style={styles.infoRow}>
          {media.averageScore ? (
            <PressableOpacity
              useDisabledOpacity={false}
              style={styles.averageScoreToggle}
              disabled={!shouldShowScoreToggleUI || showScore}
              onPress={() => setShowScore(!showScore)}
            >
              <Info
                label={String(
                  fbs("Average score", "Anime details average score label"),
                )}
                value={
                  showScore ? (
                    `${(media.averageScore ?? 0) / 10} / 10`
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
            value={media.status ? getMediaStatusLabel(media.status) : ""}
          />
        </View>
        <View style={styles.infoRow}>
          {studio ? (
            <Info
              label={String(fbs("Studio", "Anime details studio label"))}
              value={studio}
            />
          ) : null}
          {media.status === "RELEASING" && media.nextAiringEpisode ? (
            <Info
              label={String(
                fbs("Next episode", "Anime details next episode label"),
              )}
              value={`${String(
                fbs("EP", "Episode abbreviation for next episode"),
              )} ${media.nextAiringEpisode.episode} ${String(
                fbs("airs in", "Next episode airs in label"),
              )} ${formatDistanceToNow(
                add(now, {
                  seconds: media.nextAiringEpisode.timeUntilAiring ?? 0,
                }),
              )}`}
            />
          ) : null}
          {media.status === "NOT_YET_RELEASED" &&
          media.startDate &&
          getDateText(media.startDate) ? (
            <Info
              label={String(fbs("Start date", "Anime details start date label"))}
              value={getDateText(media.startDate)!}
            />
          ) : null}

          {(media.status === "FINISHED" || media.status === "CANCELLED") &&
          media.endDate &&
          getDateText(media.endDate) ? (
            <Info
              label={String(fbs("End date", "Anime details end date label"))}
              value={getDateText(media.endDate)!}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

function MediaListStatusButton({
  animeId,
  media,
  statusOptions,
}: {
  animeId: number;
  media: DetailsMedia;
  statusOptions: StatusOption[];
}) {
  const { showActionSheetWithOptions } = useActionSheet();
  const [loadingStatus, setLoadingStatus] = useState(false);
  const mediaListEntryId = media.mediaListEntry?.id;
  const mediaListEntry = media.mediaListEntry;

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
    wait: 0,
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
    wait: 0,
  });

  return (
    <View style={styles.buttonsRow}>
      <Button
        size="small"
        containerStyle={{ flex: 1 }}
        loading={loadingStatus}
        label={
          mediaListEntry?.status
            ? getMediaListStatusLabel(mediaListEntry.status)
            : String(fbs("Add to list", "Anime details add to list button"))
        }
        onPress={() => {
          const options = statusOptions.map(
            (s) =>
              `${mediaListEntry?.status === s.value ? "✔ " : ""}${s.label}`,
          );

          if (mediaListEntry) {
            options.push(
              String(
                fbs(
                  "Remove from list",
                  "Anime details remove from list action sheet option",
                ),
              ),
            );
          }
          options.push(
            String(fbs("Cancel", "Anime details cancel action sheet option")),
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
              try {
                if (mediaListEntry && buttonIndex === options.length - 2) {
                  await removeFromList({
                    id: mediaListEntry.id,
                  });
                  setLoadingStatus(false);
                  return;
                } else {
                  const status = statusOptions[buttonIndex]?.value;
                  if (!status) {
                    setLoadingStatus(false);
                    return;
                  }

                  await updateStatus({
                    mediaId: media.id,
                    status,
                  });
                }
                setLoadingStatus(false);
              } catch (error) {
                console.error(error);
                setLoadingStatus(false);
              }
            },
          );
        }}
      />
    </View>
  );
}

function MediaTrackingControls({ media }: { media: DetailsMedia }) {
  const mediaListEntryId = media.mediaListEntry?.id;
  const cacheScore = media.mediaListEntry?.score ?? 0;
  const cacheProgress = media.mediaListEntry?.progress ?? 0;
  const progressUpperBound = media.episodes;
  const [scoreOverride, setScoreOverride] = useState<{
    cacheScore: number;
    score: number;
  } | null>(null);
  const [progressOverride, setProgressOverride] = useState<{
    cacheProgress: number;
    progress: number;
  } | null>(null);
  // Drop a stale optimistic override once the cache moves off the value it was
  // captured against, so a later cache value equal to the pre-tap snapshot
  // can't resurrect it (and a failed mutation can't leave it pinned).
  let activeScoreOverride = scoreOverride;
  if (scoreOverride && scoreOverride.cacheScore !== cacheScore) {
    setScoreOverride(null);
    activeScoreOverride = null;
  }
  let activeProgressOverride = progressOverride;
  if (progressOverride && progressOverride.cacheProgress !== cacheProgress) {
    setProgressOverride(null);
    activeProgressOverride = null;
  }
  const displayScore = activeScoreOverride
    ? activeScoreOverride.score
    : cacheScore;
  const displayProgress = activeProgressOverride
    ? activeProgressOverride.progress
    : cacheProgress;

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
    wait: 0,
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
    wait: 0,
  });

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
    setScoreOverride({ cacheScore, score: nextScore });
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
    setProgressOverride({ cacheProgress, progress: nextProgress });
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

  if (!media.mediaListEntry || media.status === "NOT_YET_RELEASED") return null;

  return (
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
        label={String(fbs("Progress", "Anime details progress stepper label"))}
        value={displayProgress}
        upperBound={media.episodes ?? undefined}
        lowerBound={0}
        onIncrement={() => changeProgress("inc")}
        onDecrement={() => changeProgress("dec")}
      />
    </>
  );
}

function RelationsLists({
  mappedRelations,
}: {
  mappedRelations: MappedRelations;
}) {
  return (
    <>
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
    </>
  );
}

function ExternalLinksSection({ links }: { links?: ExternalLinkData[] }) {
  if (!links?.length) return null;

  return (
    <>
      <View style={{ height: 16 }} />
      <Text style={styles.externalLinksHeader}>
        {String(fbs("External links", "Anime details external links title"))}
      </Text>
      <View style={{ height: 16 }} />
      <View style={{ gap: 8 }}>
        {links.map((link) => (
          <ExternalLink key={link.id} {...link} />
        ))}
      </View>
    </>
  );
}

export default function Details() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const animeId = parseInt(id, 10);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
  const media = data?.Media;

  // Set navigation title dynamically
  useEffect(() => {
    if (media) {
      navigation.setOptions({
        title: getTitle(media.title) ?? "",
      });
    }
  }, [media, navigation, getTitle]);

  async function refetchFromScroll() {
    setIsRefetchingFromScrollOrMount(true);
    await refetch({ id: animeId });
    setIsRefetchingFromScrollOrMount(false);
  }

  const relations = (media?.relations?.edges ?? [])?.filter(notEmpty);

  const mappedRelations = reduce<
    (typeof relations)[number],
    { [K in MediaRelation]?: AnimeRelationFragmentFragment[] }
  >(
    relations,
    function (result, value, _key) {
      if (
        !value?.relationType ||
        !value.node ||
        value.node.type !== "ANIME"
      )
        return result;

      if (result[value?.relationType]) {
        result[value?.relationType]!.push(value.node);
      } else {
        result[value?.relationType] = [value.node];
      }

      return result;
    },
    {},
  );

  const externalLinks = media?.externalLinks?.filter(notEmpty);
  const studio = (media?.studios?.nodes ?? [])[0]?.name;
  const statusOptions = MediaListStatusWithLabel.map(({ value }) => ({
    label: getMediaListStatusLabel(value),
    value,
  }));

  return (
    <ScrollView
      style={styles.container}
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
      ) : media ? (
        <>
          <PosterInfoSection
            animeId={animeId}
            media={media}
            now={now}
            shouldShowScoreToggleUI={shouldShowScoreToggleUI}
            showScore={showScore}
            setShowScore={setShowScore}
            studio={studio}
          />
          <MediaListStatusButton
            animeId={animeId}
            media={media}
            statusOptions={statusOptions}
          />
          <MediaTrackingControls media={media} />
          {media.description ? (
            <DescriptionRenderer description={media.description} />
          ) : null}

          {media.trailer ? (
            <Trailer trailer={media.trailer} />
          ) : null}
          {media.characters?.nodes ? (
            <CharacterList
              characters={(media.characters?.nodes ?? []).filter(notEmpty)}
            />
          ) : null}
          <RelationsLists mappedRelations={mappedRelations} />
          <ExternalLinksSection links={externalLinks} />
        </>
      ) : (
        <EmptyState
          title={String(fbs("Could not find anime", "Anime not found error title"))}
          description={String(
            fbs(
              "We ran into an unexpected error loading the requested anime.",
              "Anime not found empty response description",
            ),
          )}
        />
      )}
      {/* Bottom spacer instead of dynamic contentContainerStyle padding: works on
          Android (contentInset is iOS-only) and avoids react-doctor's dynamic-padding rule. */}
      <View style={{ height: insets.bottom + 16 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  averageScoreToggle: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  externalLinksHeader: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 20,
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
  posterActionOverlay: {
    alignItems: "flex-end",
    flex: 1,
    justifyContent: "flex-end",
    padding: 8,
  },
  buttonsRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
});
