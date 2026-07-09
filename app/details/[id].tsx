import {
  NetworkStatus,
  useApolloClient,
  useQuery,
  useMutation,
} from "@apollo/client";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
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
import {
  DEFAULT_SCORE_FORMAT,
  MediaListStatusWithLabel,
  ScoreFormatConfig,
} from "yep/constants";
import type { MediaRelation } from "yep/graphql/enums";
import { applyFavoriteToCache, ToggleFavorite } from "yep/graphql/favorites";
import {
  UpdateProgress,
  UpdateProgressVolumes,
  UpdateScore,
  UpdateStatus,
  RemoveFromList,
} from "yep/graphql/mutations";
import { graphql, readFragment } from "yep/graphql/tada";
import type { FragmentOf, ResultOf } from "yep/graphql/tada";
import { GetViewer } from "yep/graphql/viewer";
import {
  useDebouncedMutation,
  usePersistedState,
  StorageKeys,
} from "yep/hooks/helpers";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { CharacterList } from "yep/screens/DetailsScreen/CharacterList";
import { CharacterListItemData } from "yep/screens/DetailsScreen/CharacterList/CharacterItem";
import { DetailsSkeleton } from "yep/screens/DetailsScreen/DetailsSkeleton";
import {
  ExternalLink,
  MediaExternalLinkData,
} from "yep/screens/DetailsScreen/ExternalLink";
import { RelatedAnimeList } from "yep/screens/DetailsScreen/RelatedAnimeList";
import { AnimeRelationFragment } from "yep/screens/DetailsScreen/RelatedAnimeList/RelatedAnimeItem";
import { Stepper } from "yep/screens/DetailsScreen/Stepper";
import { Trailer, MediaTrailerData } from "yep/screens/DetailsScreen/Trailer";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import {
  formatScore,
  getDateFnsLocale,
  getDateText,
  getMaxProgress,
  getMediaListStatusLabel,
  getMediaStatusLabel,
  notEmpty,
  useGetTitle,
} from "yep/utils";

const AnimeFragment = graphql(
  `
    fragment AnimeFragment on Media {
      id
      type
      title {
        romaji
        native
        english
      }
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      status
      genres
      episodes
      chapters
      volumes
      description
      isFavourite
      studios(isMain: true) {
        nodes {
          id
          name
        }
      }
      averageScore
      coverImage {
        large
        medium
        color
      }
      trailer {
        ...MediaTrailerData
      }
      externalLinks {
        ...MediaExternalLinkData
      }
      nextAiringEpisode {
        id
        airingAt
        episode
      }
      mediaListEntry {
        id
        progress
        progressVolumes
        status
        score
      }
      relations {
        edges {
          id
          relationType
          node {
            ...AnimeRelationFragment
          }
        }
      }
      characters {
        nodes {
          ...CharacterListItemData
        }
      }
    }
  `,
  [
    MediaTrailerData,
    MediaExternalLinkData,
    AnimeRelationFragment,
    CharacterListItemData,
  ],
);

const GetAnime = graphql(
  `
    query GetAnime($id: Int) {
      Media(id: $id) {
        ...AnimeFragment
      }
    }
  `,
  [AnimeFragment],
);

type InfoProps = { label: string; value: ReactNode };
type DetailsMedia = NonNullable<ResultOf<typeof AnimeFragment>>;
type ExternalLinkData = FragmentOf<typeof MediaExternalLinkData>;
type MappedRelations = {
  [K in MediaRelation]?: FragmentOf<typeof AnimeRelationFragment>[];
};
type StatusOption = {
  label: string;
  value: (typeof MediaListStatusWithLabel)[number]["value"];
};

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
  mediaId,
  media,
  shouldShowScoreToggleUI,
  showScore,
  setShowScore,
  studio,
}: {
  mediaId: number;
  media: DetailsMedia;
  shouldShowScoreToggleUI: boolean;
  showScore: boolean;
  setShowScore: (showScore: boolean) => boolean;
  studio?: string;
}) {
  const [toggleFavorite] = useMutation(ToggleFavorite);
  const { cache } = useApolloClient();
  const { locale } = useLocaleContext();

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
              // Flip the heart (and patch the Profile shelf) in cache before
              // the request so the tap feels instant; revert on failure. The
              // global onError link already toasts the error.
              const target =
                media.type === "MANGA"
                  ? { mangaId: mediaId }
                  : { animeId: mediaId };
              const next = !media.isFavourite;
              applyFavoriteToCache(cache, target, next);
              try {
                await toggleFavorite({ variables: target });
              } catch (error) {
                applyFavoriteToCache(cache, target, !next);
                console.error(error);
              }
            }}
          />
        </View>
      </PosterAndTitle>
      <View style={styles.infoTable}>
        <View style={styles.infoRow}>
          {media.type === "MANGA" ? (
            media.chapters ? (
              <Info
                label={String(fbs("Chapters", "Manga details chapters label"))}
                value={`${media.chapters}`}
              />
            ) : null
          ) : media.episodes ? (
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
          {media.status === "RELEASING" && media.nextAiringEpisode?.airingAt ? (
            <Info
              label={String(
                fbs("Next episode", "Anime details next episode label"),
              )}
              value={`${String(
                fbs("EP", "Episode abbreviation for next episode"),
              )} ${media.nextAiringEpisode.episode} ${String(
                fbs("airs in", "Next episode airs in label"),
              )} ${formatDistanceToNow(
                new Date(media.nextAiringEpisode.airingAt * 1000),
                { locale: getDateFnsLocale(locale) },
              )}`}
            />
          ) : null}
          {media.status === "NOT_YET_RELEASED" &&
          media.startDate &&
          getDateText(media.startDate, undefined, { locale }) ? (
            <Info
              label={String(
                fbs("Start date", "Anime details start date label"),
              )}
              value={getDateText(media.startDate, undefined, { locale })!}
            />
          ) : null}

          {(media.status === "FINISHED" || media.status === "CANCELLED") &&
          media.endDate &&
          getDateText(media.endDate, undefined, { locale }) ? (
            <Info
              label={String(fbs("End date", "Anime details end date label"))}
              value={getDateText(media.endDate, undefined, { locale })!}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

function MediaListStatusButton({
  mediaId,
  media,
  statusOptions,
}: {
  mediaId: number;
  media: DetailsMedia;
  statusOptions: StatusOption[];
}) {
  const { showActionSheetWithOptions } = useActionSheet();
  const [loadingStatus, setLoadingStatus] = useState(false);
  const mediaListEntryId = media.mediaListEntry?.id;
  const mediaListEntry = media.mediaListEntry;

  const updateStatus = useDebouncedMutation({
    mutationDocument: UpdateStatus,
    makeUpdateFunction: (variables) => (cache, result) => {
      if (mediaListEntryId && variables?.status) {
        cache.modify({
          id: cache.identify({ __typename: "MediaList", id: mediaListEntryId }),
          fields: {
            status: () => variables.status,
          },
        });

        // Patching MediaList.status alone leaves the entry under its OLD status
        // chip — each per-status list is its own Page.mediaList container with
        // its own ref array. Rather than refetch the whole active list (a
        // request on AniList's 30/min budget), drop the moved entry from
        // whichever list container currently holds it and fix that chip's
        // total. We only ever REMOVE, never insert: the destination chip
        // self-heals on its next read, since switching chips changes the query
        // variables and cache-and-network always hits the network.
        // ponytail: keyed off the `mediaList` field, so it's coupled to the Page
        // typePolicy in graphql/client.ts — revert to
        // refetchQueries: ["GetMediaList"] if that coupling ever bites.
        if (variables.status !== mediaListEntry?.status) {
          cache.modify({
            fields: {
              Page(existing, { readField }) {
                const list = existing?.mediaList;
                if (!Array.isArray(list)) return existing;
                const filtered = list.filter(
                  (ref) => readField("id", ref) !== mediaListEntryId,
                );
                if (filtered.length === list.length) return existing;
                const total = existing.pageInfo?.total;
                return {
                  ...existing,
                  mediaList: filtered,
                  pageInfo:
                    typeof total === "number"
                      ? { ...existing.pageInfo, total: total - 1 }
                      : existing.pageInfo,
                };
              },
            },
          });
        }
      }

      // Always (re-)link the entry to the Media ourselves — the nested
      // media.mediaListEntry in the mutation payload can come back null (the
      // resolver doesn't reliably see the entry), and that null normalizes
      // into the cache clobbering the existing link, which would leave the
      // details screen stuck on "Add to list" until a refetch.
      const saved = result.data?.SaveMediaListEntry;
      if (!saved?.id) return;
      cache.modify({
        id: cache.identify({ __typename: "Media", id: mediaId }),
        fields: {
          mediaListEntry: (existing, { toReference }) =>
            toReference({ __typename: "MediaList", id: saved.id }) ?? existing,
        },
      });
    },
    // Fired from a one-shot action sheet, not a repeatable stepper — there's
    // nothing to coalesce, so skip the debounce and write immediately (keeps the
    // loading spinner from lingering an extra 500ms). Same for removeFromList.
    wait: 0,
  });

  const removeFromList = useDebouncedMutation({
    mutationDocument: RemoveFromList,
    makeUpdateFunction: () => (cache) => {
      if (!mediaListEntryId) return;

      cache.modify({
        id: cache.identify({ __typename: "Media", id: mediaId }),
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
            ? getMediaListStatusLabel(mediaListEntry.status, media.type)
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
  // cache-only: the anime tab already fetched the viewer; missing data just
  // falls back to the POINT_10 default until that query lands.
  const { data: viewerData } = useQuery(GetViewer, {
    fetchPolicy: "cache-only",
  });
  const scoreFormat =
    viewerData?.Viewer?.mediaListOptions?.scoreFormat ?? DEFAULT_SCORE_FORMAT;
  const { max: maxScore, step: scoreStep } = ScoreFormatConfig[scoreFormat];
  const isManga = media.type === "MANGA";
  const cacheScore = media.mediaListEntry?.score ?? 0;
  const cacheProgress = media.mediaListEntry?.progress ?? 0;
  const cacheVolumes = media.mediaListEntry?.progressVolumes ?? 0;
  const progressUpperBound = getMaxProgress(media);
  const [scoreOverride, setScoreOverride] = useState<{
    cacheScore: number;
    score: number;
  } | null>(null);
  const [progressOverride, setProgressOverride] = useState<{
    cacheProgress: number;
    progress: number;
  } | null>(null);
  const [volumesOverride, setVolumesOverride] = useState<{
    cacheVolumes: number;
    volumes: number;
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
  let activeVolumesOverride = volumesOverride;
  if (volumesOverride && volumesOverride.cacheVolumes !== cacheVolumes) {
    setVolumesOverride(null);
    activeVolumesOverride = null;
  }
  const displayScore = activeScoreOverride
    ? activeScoreOverride.score
    : cacheScore;
  const displayProgress = activeProgressOverride
    ? activeProgressOverride.progress
    : cacheProgress;
  const displayVolumes = activeVolumesOverride
    ? activeVolumesOverride.volumes
    : cacheVolumes;

  const updateScore = useDebouncedMutation({
    mutationDocument: UpdateScore,
    makeUpdateFunction: (variables) => (cache) => {
      if (!mediaListEntryId || variables?.score === undefined) return;

      cache.modify({
        id: cache.identify({ __typename: "MediaList", id: mediaListEntryId }),
        fields: {
          score: () => variables.score ?? 0,
        },
      });
    },
  });

  const updateProgress = useDebouncedMutation({
    mutationDocument: UpdateProgress,
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

  const updateProgressVolumes = useDebouncedMutation({
    mutationDocument: UpdateProgressVolumes,
    makeUpdateFunction: (variables) => (cache) => {
      if (!mediaListEntryId || variables?.progressVolumes === undefined) return;

      cache.modify({
        id: cache.identify({ __typename: "MediaList", id: mediaListEntryId }),
        fields: {
          progressVolumes: () => variables.progressVolumes,
        },
      });
    },
  });

  function clampProgress(value: number) {
    const clamped = Math.max(value, 0);
    return typeof progressUpperBound === "number"
      ? Math.min(clamped, progressUpperBound)
      : clamped;
  }

  async function changeScore(type: "inc" | "dec") {
    if (!mediaListEntryId) return;

    const nextScore = Math.min(
      Math.max(
        type === "inc" ? displayScore + scoreStep : displayScore - scoreStep,
        0,
      ),
      maxScore,
    );
    if (nextScore === displayScore) return;
    setScoreOverride({ cacheScore, score: nextScore });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await updateScore({
        id: mediaListEntryId,
        score: nextScore,
      });
    } catch (error) {
      // A failed mutation never moves the cache, so the override would stay
      // pinned to the unsaved value forever — revert it. (The global onError
      // link already toasts the failure.)
      setScoreOverride(null);
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
      // Revert the optimistic value — a failed mutation never moves the cache.
      setProgressOverride(null);
      console.error(error);
    }
  }

  async function changeVolumes(type: "inc" | "dec") {
    if (!mediaListEntryId) return;

    const unclamped = type === "inc" ? displayVolumes + 1 : displayVolumes - 1;
    const clamped = Math.max(unclamped, 0);
    const nextVolumes =
      typeof media.volumes === "number"
        ? Math.min(clamped, media.volumes)
        : clamped;
    if (nextVolumes === displayVolumes) return;
    setVolumesOverride({ cacheVolumes, volumes: nextVolumes });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await updateProgressVolumes({
        id: mediaListEntryId,
        progressVolumes: nextVolumes,
      });
    } catch (error) {
      // Revert the optimistic value — a failed mutation never moves the cache.
      setVolumesOverride(null);
      console.error(error);
    }
  }

  // Unreleased titles still allow progress edits — early screenings,
  // pre-serialization chapters, and AniList data lag are all real.
  if (!media.mediaListEntry) return null;

  return (
    <>
      <Stepper
        label={String(fbs("Score", "Anime details score stepper label"))}
        icon={
          <Image
            style={{ height: 16, width: 16, marginRight: 8 }}
            source={require("yep/assets/icons/star.png")}
          />
        }
        value={displayScore}
        formatValue={(value) => formatScore(value, scoreFormat)}
        upperBound={maxScore}
        lowerBound={0}
        onIncrement={() => changeScore("inc")}
        onDecrement={() => changeScore("dec")}
      />
      <Stepper
        icon={
          <Image
            style={{ height: 16, width: 16, marginRight: 8 }}
            source={require("yep/assets/icons/progress.png")}
          />
        }
        label={
          isManga
            ? String(fbs("Chapters", "Manga details chapters stepper label"))
            : String(fbs("Progress", "Anime details progress stepper label"))
        }
        value={displayProgress}
        upperBound={getMaxProgress(media) ?? undefined}
        lowerBound={0}
        onIncrement={() => changeProgress("inc")}
        onDecrement={() => changeProgress("dec")}
      />
      {isManga ? (
        <Stepper
          icon={
            <Image
              style={{
                height: 16,
                width: 16,
                marginRight: 8,
                tintColor: darkTheme.text,
              }}
              source={require("yep/assets/icons/navigation/book.png")}
            />
          }
          label={String(fbs("Volumes", "Manga details volumes stepper label"))}
          value={displayVolumes}
          upperBound={media.volumes ?? undefined}
          lowerBound={0}
          onIncrement={() => changeVolumes("inc")}
          onDecrement={() => changeVolumes("dec")}
        />
      ) : null}
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

const EXTERNAL_LINK_GROUPS = [
  { type: "STREAMING", label: fbs("Watch", "Streaming links group label") },
  { type: "INFO", label: fbs("Info", "Info links group label") },
  { type: "SOCIAL", label: fbs("Social", "Social links group label") },
] as const;

function ExternalLinksSection({
  links,
  isManga,
}: {
  links?: ExternalLinkData[];
  isManga: boolean;
}) {
  if (!links?.length) return null;

  // AniList classifies every link as STREAMING / INFO / SOCIAL; null falls to Info.
  const groups = EXTERNAL_LINK_GROUPS.flatMap((group) => {
    const items = links.filter(
      (link) =>
        (readFragment(MediaExternalLinkData, link).type ?? "INFO") ===
        group.type,
    );
    return items.length > 0 ? [{ ...group, items }] : [];
  });

  return (
    <>
      <View style={{ height: 8 }} />
      {groups.map((group) => (
        <View key={group.type}>
          <Text style={styles.externalLinksGroupLabel}>
            {String(
              group.type === "STREAMING" && isManga
                ? fbs(
                    "Read",
                    "Manga streaming links group label (Watch for anime)",
                  )
                : group.label,
            )}
          </Text>
          <View style={styles.externalLinksCard}>
            {group.items.map((link, i) => (
              <React.Fragment
                key={readFragment(MediaExternalLinkData, link).id}
              >
                {i > 0 ? <View style={styles.externalLinksDivider} /> : null}
                <ExternalLink link={link} />
              </React.Fragment>
            ))}
          </View>
        </View>
      ))}
    </>
  );
}

export default function Details() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mediaId = parseInt(id, 10);
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
    { id: String(mediaId), doNotPersist: !shouldPersistScoreVisibility },
  );

  useEffect(() => {
    if (!showScore) {
      setShowScore(!shouldShowScoreToggleUI);
    }
  }, [shouldShowScoreToggleUI, showScore, setShowScore]);

  const getTitle = useGetTitle();

  const { loading, data, refetch, error, networkStatus } = useQuery(GetAnime, {
    variables: { id: mediaId },
    notifyOnNetworkStatusChange: true,
  });
  // Only a user pull (explicit refetch) sets networkStatus to refetch(4); the
  // initial load is loading(1)/ready(7), so the spinner no longer shows on
  // first render the way `isRefetchingFromScrollOrMount && loading` did.
  const isRefetching = networkStatus === NetworkStatus.refetch;
  const media = data?.Media ? readFragment(AnimeFragment, data.Media) : null;

  // Set navigation title dynamically
  useEffect(() => {
    if (media) {
      navigation.setOptions({
        title: getTitle(media.title) ?? "",
      });
    }
  }, [media, navigation, getTitle]);

  const relations = (media?.relations?.edges ?? [])?.filter(notEmpty);

  const mappedRelations = reduce<
    (typeof relations)[number],
    { [K in MediaRelation]?: FragmentOf<typeof AnimeRelationFragment>[] }
  >(
    relations,
    function (result, value, _key) {
      // Anime and manga relations both open in this details screen now, so
      // nothing is filtered by type.
      if (!value?.relationType || !value.node) return result;

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
    label: getMediaListStatusLabel(value, media?.type),
    value,
  }));

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop -- RefreshControl must be a live element; React Compiler memoizes it
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => {
            refetch({ id: mediaId }).catch(() => {});
          }}
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
            title={String(
              fbs("Could not find this title", "Media not found error title"),
            )}
            description={`${String(
              fbs(
                "We ran into an unexpected error loading the requested title:",
                "Media not found error description prefix",
              ),
            )} ${error?.message}`}
          />
        ) : null
      ) : media ? (
        <>
          <PosterInfoSection
            mediaId={mediaId}
            media={media}
            shouldShowScoreToggleUI={shouldShowScoreToggleUI}
            showScore={showScore}
            setShowScore={setShowScore}
            studio={studio}
          />
          <MediaListStatusButton
            mediaId={mediaId}
            media={media}
            statusOptions={statusOptions}
          />
          <MediaTrackingControls media={media} />
          {media.description ? (
            <DescriptionRenderer description={media.description} />
          ) : null}

          {media.trailer ? <Trailer trailer={media.trailer} /> : null}
          {media.characters?.nodes ? (
            <CharacterList
              characters={(media.characters?.nodes ?? []).filter(notEmpty)}
            />
          ) : null}
          <RelationsLists mappedRelations={mappedRelations} />
          <ExternalLinksSection
            links={externalLinks}
            isManga={media.type === "MANGA"}
          />
        </>
      ) : (
        <EmptyState
          title={String(
            fbs("Could not find this title", "Media not found error title"),
          )}
          description={String(
            fbs(
              "We ran into an unexpected error loading the requested title.",
              "Media not found empty response description",
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
  externalLinksGroupLabel: {
    color: darkTheme.subHeader,
    fontFamily: Manrope.semiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 8,
  },
  externalLinksCard: {
    backgroundColor: darkTheme.listItemBackground,
    borderRadius: 14,
    overflow: "hidden",
  },
  externalLinksDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: darkTheme.listItemBorder,
    marginLeft: 16,
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
