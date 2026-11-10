import { NetworkStatus, useQuery } from "@apollo/client";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Image } from "expo-image";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { fbs } from "fbtee";
import React, { ReactNode, useEffect, useState } from "react";
import {
  RefreshControl,
  Text,
  View,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Button } from "yep/components/Button";
import { DescriptionRenderer } from "yep/components/DescriptionRenderer";
import { EmptyState } from "yep/components/EmptyState";
import { FavoriteButton } from "yep/components/FavoriteButton";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import type { MediaListStatus } from "yep/graphql/enums";
import {
  LIST_STATUSES,
  useEntryCounter,
  useRemoveFromList,
  useSetListStatus,
} from "yep/graphql/mediaListEntry";
import { graphql, readFragment } from "yep/graphql/tada";
import type { ResultOf } from "yep/graphql/tada";
import { useGetTitle, useViewer } from "yep/graphql/viewer";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { ScoreFormatConfig, formatScore } from "yep/score";
import { DetailsSkeleton } from "yep/screens/DetailsScreen/DetailsSkeleton";
import {
  ExternalLinksSection,
  MediaExternalLinkData,
} from "yep/screens/DetailsScreen/ExternalLink";
import {
  AnimeRelationFragment,
  CharacterListItemData,
  CharacterShelf,
  RelationShelves,
} from "yep/screens/DetailsScreen/Shelves";
import { Stepper } from "yep/screens/DetailsScreen/Stepper";
import { Trailer, MediaTrailerData } from "yep/screens/DetailsScreen/Trailer";
import { Settings, usePersistedState } from "yep/storage";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import {
  getDateText,
  getMaxProgress,
  getMediaListStatusLabel,
  getMediaStatusLabel,
  getNextEpisodeText,
  notEmpty,
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
  media,
  showScore,
  revealScore,
}: {
  media: DetailsMedia;
  showScore: boolean;
  revealScore: () => void;
}) {
  const { locale } = useLocaleContext();
  const studio = media.studios?.nodes?.[0]?.name;
  const startDate = getDateText(media.startDate, undefined, locale);
  const endDate = getDateText(media.endDate, undefined, locale);

  return (
    <View style={styles.posterAndInfoContainer}>
      <PosterAndTitle
        size="details"
        uri={media.coverImage?.large ?? ""}
        style={{ marginRight: 16 }}
      >
        <View style={styles.posterActionOverlay}>
          <FavoriteButton
            target={
              media.type === "MANGA"
                ? { mangaId: media.id }
                : { animeId: media.id }
            }
            isFavourite={Boolean(media.isFavourite)}
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
              disabled={showScore}
              onPress={revealScore}
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
              value={getNextEpisodeText(media.nextAiringEpisode, locale)}
            />
          ) : null}
          {media.status === "NOT_YET_RELEASED" && startDate ? (
            <Info
              label={String(
                fbs("Start date", "Anime details start date label"),
              )}
              value={startDate}
            />
          ) : null}

          {(media.status === "FINISHED" || media.status === "CANCELLED") &&
          endDate ? (
            <Info
              label={String(fbs("End date", "Anime details end date label"))}
              value={endDate}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

function MediaListStatusButton({ media }: { media: DetailsMedia }) {
  const { showActionSheetWithOptions } = useActionSheet();
  const [loadingStatus, setLoadingStatus] = useState(false);
  const setListStatus = useSetListStatus(media);
  const removeFromList = useRemoveFromList(media.id);
  const entry = media.mediaListEntry;

  async function run(action: () => Promise<unknown>) {
    setLoadingStatus(true);
    try {
      await action();
    } catch (error) {
      console.error(error);
    }
    setLoadingStatus(false);
  }

  function openStatusSheet() {
    const options = LIST_STATUSES.map(
      (status) =>
        `${entry?.status === status ? "✔ " : ""}${getMediaListStatusLabel(status, media.type)}`,
    );
    if (entry) {
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
    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = entry ? options.length - 2 : undefined;

    showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
        destructiveColor: darkTheme.accent,
      },
      (buttonIndex) => {
        if (buttonIndex === undefined || buttonIndex === cancelButtonIndex) {
          return;
        }
        if (entry && buttonIndex === destructiveButtonIndex) {
          run(() => removeFromList(entry.id));
          return;
        }
        const status: MediaListStatus | undefined = LIST_STATUSES[buttonIndex];
        if (status) run(() => setListStatus(status));
      },
    );
  }

  return (
    <View style={styles.buttonsRow}>
      <Button
        size="small"
        containerStyle={{ flex: 1 }}
        loading={loadingStatus}
        label={
          entry?.status
            ? getMediaListStatusLabel(entry.status, media.type)
            : String(fbs("Add to list", "Anime details add to list button"))
        }
        onPress={openStatusSheet}
      />
    </View>
  );
}

function MediaTrackingControls({
  media,
  entry,
}: {
  media: DetailsMedia;
  entry: NonNullable<DetailsMedia["mediaListEntry"]>;
}) {
  const { scoreFormat } = useViewer();
  const { max: maxScore, step: scoreStep } = ScoreFormatConfig[scoreFormat];
  const score = useEntryCounter({
    entryId: entry.id,
    field: "score",
    value: entry.score ?? 0,
    max: maxScore,
    step: scoreStep,
  });
  const progress = useEntryCounter({
    entryId: entry.id,
    field: "progress",
    value: entry.progress ?? 0,
    max: getMaxProgress(media),
  });
  const volumes = useEntryCounter({
    entryId: entry.id,
    field: "progressVolumes",
    value: entry.progressVolumes ?? 0,
    max: media.volumes,
  });

  return (
    <>
      <Stepper
        label={String(fbs("Score", "Anime details score stepper label"))}
        icon={
          <Image
            style={styles.stepperIcon}
            source={require("yep/assets/icons/star.png")}
          />
        }
        counter={score}
        formatValue={(value) => formatScore(value, scoreFormat)}
      />
      <Stepper
        icon={
          <Image
            style={styles.stepperIcon}
            source={require("yep/assets/icons/progress.png")}
          />
        }
        label={
          media.type === "MANGA"
            ? String(fbs("Chapters", "Manga details chapters stepper label"))
            : String(fbs("Progress", "Anime details progress stepper label"))
        }
        counter={progress}
      />
      {media.type === "MANGA" ? (
        <Stepper
          icon={
            <Image
              style={[styles.stepperIcon, { tintColor: darkTheme.text }]}
              source={require("yep/assets/icons/navigation/book.png")}
            />
          }
          label={String(fbs("Volumes", "Manga details volumes stepper label"))}
          counter={volumes}
        />
      ) : null}
    </>
  );
}

export default function Details() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mediaId = parseInt(id, 10);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [hideScores] = usePersistedState(Settings.hideScores);
  const [persistScoreVisibility] = usePersistedState(
    Settings.persistScoreVisibility,
  );
  const [scoreRevealed, setScoreRevealed] = usePersistedState(
    Settings.scoreRevealed,
    { id: String(mediaId), persist: persistScoreVisibility },
  );

  const getTitle = useGetTitle();

  const { loading, data, refetch, error, networkStatus } = useQuery(GetAnime, {
    variables: { id: mediaId },
    notifyOnNetworkStatusChange: true,
  });
  const isRefetching = networkStatus === NetworkStatus.refetch;
  const media = data?.Media ? readFragment(AnimeFragment, data.Media) : null;

  useEffect(() => {
    if (media) {
      navigation.setOptions({
        title: getTitle(media.title) ?? "",
      });
    }
  }, [media, navigation, getTitle]);

  return (
    <SafeAreaView edges={["left", "right"]} style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop -- RefreshControl must be a live element; React Compiler memoizes it
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch().catch(() => {});
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
              media={media}
              showScore={!hideScores || scoreRevealed}
              revealScore={() => setScoreRevealed(true)}
            />
            <MediaListStatusButton media={media} />
            {media.mediaListEntry ? (
              <MediaTrackingControls
                media={media}
                entry={media.mediaListEntry}
              />
            ) : null}
            {media.description ? (
              <DescriptionRenderer description={media.description} />
            ) : null}

            {media.trailer ? <Trailer trailer={media.trailer} /> : null}
            {media.characters?.nodes ? (
              <CharacterShelf
                characters={media.characters.nodes.filter(notEmpty)}
              />
            ) : null}
            <RelationShelves
              relations={(media.relations?.edges ?? []).flatMap((edge) =>
                edge?.relationType && edge.node
                  ? [{ relationType: edge.relationType, node: edge.node }]
                  : [],
              )}
            />
            <ExternalLinksSection
              links={media.externalLinks?.filter(notEmpty)}
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
    </SafeAreaView>
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
  stepperIcon: { height: 16, marginRight: 8, width: 16 },
  buttonsRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
});
