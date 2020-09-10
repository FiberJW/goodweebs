import { useQuery } from "@apollo/react-hooks";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { formatDistanceToNow, add } from "date-fns";
import * as Haptics from "expo-haptics";
import _ from "lodash";
import React, { useState, useEffect } from "react";
import { StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import HTMLView from "react-native-htmlview";
import { useSafeArea } from "react-native-safe-area-context";
import title from "title";

import { white15 } from "yep/colors";
import { EmptyState } from "yep/components/EmptyState";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { MediaListStatusWithLabel, MediaStatusWithLabel } from "yep/constants";
import {
  GetAnimeQuery,
  GetAnimeQueryVariables,
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
} from "yep/graphql/generated";
import { UpdateProgress } from "yep/graphql/mutations/UpdateProgress";
import { UpdateScore } from "yep/graphql/mutations/UpdateScore";
import { UpdateStatus } from "yep/graphql/mutations/UpdateStatus";
import { GetAnime } from "yep/graphql/queries/AnimeDetails";
import {
  useDidMountEffect,
  useNow,
  useDebouncedMutation,
} from "yep/hooks/helpers";
import { RootStackParamList } from "yep/navigation";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { notEmpty, getTitle, getReadableMediaRelation } from "yep/utils";

const Container = takimoto.ScrollView({
  flex: 1,
  padding: 16,
});

const Poster = takimoto.Image({
  height: 186,
  width: 128,
  borderRadius: 4,
  marginRight: 16,
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

const InfoRowSpacer = takimoto.View({
  height: 8,
});

const InfoTable = takimoto.View({
  flex: 1,
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

type InfoProps = { label: string; value: string };

function Info({ label, value }: InfoProps) {
  return (
    <InfoContainer>
      <InfoLabel numberOfLines={1}>{label}</InfoLabel>
      <InfoValue numberOfLines={2}>{value}</InfoValue>
    </InfoContainer>
  );
}

const ButtonsRow = takimoto.View({
  flexDirection: "row",
  width: "100%",
  alignItems: "center",
  marginBottom: 16,
});

const ButtonTouchable = takimoto.TouchableOpacity({
  backgroundColor: white15,
  padding: 8,
  borderRadius: 8,
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
});

const ButtonLabel = takimoto.Text({
  fontSize: 16,
  color: darkTheme.text,
  fontFamily: Manrope.semiBold,
  textAlign: "center",
});

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

function Button({ label, onPress, disabled, loading }: ButtonProps) {
  return (
    <ButtonTouchable onPress={onPress} disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={darkTheme.text} />
      ) : (
        <ButtonLabel>{label}</ButtonLabel>
      )}
    </ButtonTouchable>
  );
}

const StepperWithLabelContainer = takimoto.View({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
});

const StepperLabel = takimoto.Text({
  fontSize: 16,
  color: darkTheme.text,
  fontFamily: Manrope.semiBold,
  textAlign: "center",
});

const StepperContainer = takimoto.View({
  flexDirection: "row",
  alignItems: "center",
});
const StepperSpacer = takimoto.View({
  height: 16,
});

const StepperCount = takimoto.Text({
  fontSize: 16,
  color: darkTheme.text,
  fontFamily: Manrope.semiBold,
  textAlign: "center",
  width: 48,
});

type StepperProps = {
  defaultValue: number;
  label: string;
  upperBound?: number;
  lowerBound: number;
  onChange: (value: number) => void;
};

function Stepper({
  defaultValue,
  upperBound,
  lowerBound,
  label,
  onChange,
}: StepperProps) {
  const [count, setCount] = useState(defaultValue);

  useDidMountEffect(
    function callOnlyChangeWhenCountChanges() {
      onChange(count);
    },
    [count]
  );

  useEffect(
    function setCountWhenDefaultValueChanges() {
      setCount(defaultValue);
    },
    [defaultValue]
  );

  return (
    <StepperWithLabelContainer>
      <StepperLabel>{label}</StepperLabel>
      <StepperContainer>
        <StepperButton
          type="decrement"
          disabled={count === lowerBound}
          onPress={() => {
            setCount((c) => c - 1);
          }}
        />
        <StepperCount>{count}</StepperCount>
        <StepperButton
          type="increment"
          disabled={count === upperBound}
          onPress={() => {
            setCount((c) => c + 1);
          }}
        />
      </StepperContainer>
    </StepperWithLabelContainer>
  );
}

const StepperButtonTouchable = takimoto.TouchableOpacity({
  padding: 16,
  borderRadius: 32,
  backgroundColor: darkTheme.secondaryButton,
});

const StepperButtonIcon = takimoto.Image({
  height: 16,
  width: 16,
  tintColor: darkTheme.text,
});

type StepperButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  type: "increment" | "decrement";
};

function StepperButton({ onPress, type, disabled }: StepperButtonProps) {
  return (
    <StepperButtonTouchable
      disabled={disabled}
      onPress={onPress}
      style={disabled ? { opacity: 0.6 } : null}
    >
      <StepperButtonIcon
        source={
          type === "increment"
            ? require("yep/assets/icons/progress-increment.png")
            : require("yep/assets/icons/progress-decrement.png")
        }
      />
    </StepperButtonTouchable>
  );
}

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, "Details">;
};

export function DetailsScreen({ route, navigation }: Props) {
  const { showActionSheetWithOptions } = useActionSheet();
  const insets = useSafeArea();
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [
    isRefetchingFromScrollOrMount,
    setIsRefetchingFromScrollOrMount,
  ] = useState(true);

  const now = useNow();

  const { loading, data, refetch } = useQuery<
    GetAnimeQuery,
    GetAnimeQueryVariables
  >(GetAnime, {
    variables: { id: route.params.id },
    notifyOnNetworkStatusChange: true,
  });

  const updateStatus = useDebouncedMutation<
    UpdateStatusMutation,
    UpdateStatusMutationVariables
  >({
    mutationDocument: UpdateStatus,
    makeUpdateFunction: (variables) => (proxy) => {
      // Read the data from our cache for this query.
      const proxyData = proxy.readQuery<GetAnimeQuery>({
        query: GetAnime,
        variables: { id: route.params.id },
      });

      if (proxyData?.Media?.mediaListEntry) {
        // Write our data back to the cache with the new progress in it
        proxy.writeQuery<GetAnimeQuery>({
          query: GetAnime,
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
      } else {
        refetchSilently();
      }
    },
    wait: 0,
  });

  const updateScore = useDebouncedMutation<
    UpdateScoreMutation,
    UpdateScoreMutationVariables
  >({
    mutationDocument: UpdateScore,
    makeUpdateFunction: (variables) => (proxy) => {
      // Read the data from our cache for this query.
      const proxyData = proxy.readQuery<GetAnimeQuery>({
        query: GetAnime,
        variables: { id: route.params.id },
      });

      // Write our data back to the cache with the new progress in it
      proxy.writeQuery<GetAnimeQuery>({
        query: GetAnime,
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
    },
  });

  const updateProgress = useDebouncedMutation<
    UpdateProgressMutation,
    UpdateProgressMutationVariables
  >({
    mutationDocument: UpdateProgress,
    makeUpdateFunction: (variables) => (proxy) => {
      // Read the data from our cache for this query.
      const proxyData = proxy.readQuery<GetAnimeQuery>({
        query: GetAnime,
        variables: { id: route.params.id },
      });

      // Write our data back to the cache with the new progress in it
      proxy.writeQuery<GetAnimeQuery>({
        query: GetAnime,
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

      if (variables?.progress === proxyData?.Media?.episodes) {
        // TODO: show dropdown alert to notify that this anime was moved to "completed" list
        setTimeout(refetchFromScroll, 1000);
      }
    },
  });

  async function refetchFromScroll() {
    setIsRefetchingFromScrollOrMount(true);
    await refetch({ id: route.params.id });
    setIsRefetchingFromScrollOrMount(false);
  }

  async function refetchSilently() {
    setIsRefetchingFromScrollOrMount(false);
    await refetch({ id: route.params.id });
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
      (result[value?.relationType] || (result[value?.relationType] = [])).push(
        value.node
      );
      return result;
    },
    {}
  );

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
        !loading ? (
          <EmptyState />
        ) : null
      ) : (
        <>
          <Title numberOfLines={5}>
            {data?.Media?.title?.english ||
              data?.Media?.title?.romaji ||
              data?.Media?.title?.native}
          </Title>

          <PosterAndInfoContainer>
            <Poster
              resizeMode="cover"
              source={{
                uri: data?.Media?.coverImage?.large ?? "",
              }}
            />
            <InfoTable>
              <InfoRow>
                {data?.Media?.episodes ? (
                  <Info label="Episodes" value={`${data?.Media?.episodes}`} />
                ) : null}
                <Info
                  label="Genre"
                  value={data?.Media?.genres?.join(", ") ?? ""}
                />
              </InfoRow>
              <InfoRowSpacer />
              <InfoRow>
                {data?.Media?.averageScore ? (
                  <Info
                    label="Average score"
                    value={`${data?.Media?.averageScore / 10} / 10`}
                  />
                ) : null}
                <Info
                  label="Status"
                  value={title(
                    MediaStatusWithLabel.find(
                      (m) => m.value === data?.Media?.status
                    )?.label ?? ""
                  )}
                />
              </InfoRow>
              <InfoRowSpacer />
              <InfoRow>
                <Info
                  label="Progress"
                  value={`${data?.Media?.mediaListEntry?.progress ?? 0}/${
                    data?.Media?.episodes ?? "?"
                  } EP`}
                />
                {data?.Media?.status === MediaStatus.Releasing ? (
                  <Info
                    label="Next episode"
                    value={`EP ${
                      data?.Media?.nextAiringEpisode?.episode
                    } airs in ${formatDistanceToNow(
                      add(now, {
                        seconds:
                          data?.Media?.nextAiringEpisode?.timeUntilAiring ?? 0,
                      })
                    )}`}
                  />
                ) : null}

                {data?.Media?.status === MediaStatus.NotYetReleased
                  ? data?.Media?.startDate?.month !== null &&
                    data?.Media?.startDate?.month !== undefined && (
                      <Info
                        label="Start date"
                        value={`${data?.Media?.startDate?.month}/${data?.Media?.startDate?.month}/${data?.Media?.startDate?.year}`}
                      />
                    )
                  : null}

                {data?.Media?.status === MediaStatus.Finished ||
                data?.Media?.status === MediaStatus.Cancelled
                  ? data?.Media?.endDate?.month !== null &&
                    data?.Media?.endDate?.month !== undefined && (
                      <Info
                        label="End date"
                        value={`${data?.Media?.endDate?.month}/${data?.Media?.endDate?.month}/${data?.Media?.endDate?.year}`}
                      />
                    )
                  : null}
              </InfoRow>
            </InfoTable>
          </PosterAndInfoContainer>
          <ButtonsRow>
            <Button
              loading={loadingStatus}
              label={
                MediaListStatusWithLabel.find(
                  (x) => x.value === data?.Media?.mediaListEntry?.status
                )?.label ?? "Add to list"
              }
              onPress={() => {
                const options = MediaListStatusWithLabel.map((s) => s.label);

                options.push("Cancel");

                const destructiveButtonIndex = MediaListStatusWithLabel.findIndex(
                  (s) => s.value === data?.Media?.mediaListEntry?.status
                );

                const cancelButtonIndex = options.length - 1;

                showActionSheetWithOptions(
                  {
                    options,
                    destructiveButtonIndex,
                    cancelButtonIndex,
                    destructiveColor: darkTheme.accent,
                  },
                  async (buttonIndex) => {
                    if (buttonIndex === cancelButtonIndex) return;

                    setLoadingStatus(true);
                    await updateStatus({
                      mediaId: data?.Media?.id,
                      status: MediaListStatusWithLabel[buttonIndex].value,
                    });
                    await refetchSilently();
                    setLoadingStatus(false);
                  }
                );
              }}
            />
          </ButtonsRow>
          {data.Media?.mediaListEntry ? (
            <>
              <Stepper
                label="Progress"
                defaultValue={data?.Media?.mediaListEntry?.progress ?? 0}
                upperBound={data?.Media?.episodes ?? undefined}
                lowerBound={0}
                onChange={async (progress) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  try {
                    await updateProgress({
                      id: data?.Media?.mediaListEntry?.id,
                      progress,
                    });
                    await refetchSilently();
                  } catch (e) {
                    // TODO: display error
                    console.error(e);
                  }
                }}
              />
              <StepperSpacer />
              <Stepper
                label="Score"
                defaultValue={data?.Media?.mediaListEntry?.score ?? 5}
                upperBound={10}
                lowerBound={0}
                onChange={async (s) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  try {
                    await updateScore({
                      id: data?.Media?.mediaListEntry?.id,
                      scoreRaw: s * 10,
                    });
                    await refetchSilently();
                  } catch (_e) {
                    // TODO: display error
                  }
                }}
              />
              <StepperSpacer />
            </>
          ) : null}
          {data?.Media?.description ? (
            <HTMLView
              value={`<p>${data?.Media?.description}</p>`}
              stylesheet={htmlViewStyle}
            />
          ) : null}
          <DescriptionSpacer />
        </>
      )}
      {Object.keys(mappedRelations).map((key: string) => {
        const relationType = key as MediaRelation;
        const relations = mappedRelations[relationType] ?? [];

        return (
          <RelatedList
            key={key}
            relationType={relationType}
            relations={relations}
            navigation={navigation}
          />
        );
      })}
    </Container>
  );
}

const DescriptionSpacer = takimoto.View({
  height: 16,
});

const RelatedListFlatList = takimoto.FlatList<AnimeRelationFragmentFragment>({
  width: "100%",
});

const RelatedListSeparator = takimoto.View({ width: 8 });
const RelatedListSpacer = takimoto.View({ height: 16 });

const RelatedListHeader = takimoto.Text({
  fontFamily: Manrope.semiBold,
  color: darkTheme.text,
  fontSize: 16,
  marginBottom: 8,
});

type RelatedListProps = {
  relations: AnimeRelationFragmentFragment[];
  relationType: MediaRelation;
  navigation: StackNavigationProp<RootStackParamList>;
};

function RelatedList({
  relationType,
  relations,
  navigation,
}: RelatedListProps) {
  if (
    // filter out non-anime relations
    // TODO: add back in when DetailScreen can support Characters/People, Manga, and Studios
    [
      MediaRelation.Adaptation,
      MediaRelation.Character,
      MediaRelation.Other,
      MediaRelation.Source,
      MediaRelation.Contains,
    ].includes(relationType)
  ) {
    return null;
  }

  return (
    <>
      <RelatedListHeader>
        {getReadableMediaRelation(relationType)}
      </RelatedListHeader>
      <RelatedListFlatList
        horizontal
        ItemSeparatorComponent={RelatedListSeparator}
        keyExtractor={(item) => `${item.id}`}
        data={relations}
        renderItem={({ item }) => {
          return <RelatedItem anime={item} navigation={navigation} />;
        }}
      />
      <RelatedListSpacer />
    </>
  );
}

type RelatedItemProps = {
  anime: AnimeRelationFragmentFragment;
  navigation: StackNavigationProp<RootStackParamList>;
};

function RelatedItem({ anime, navigation }: RelatedItemProps) {
  if (!anime.coverImage?.large) return null;

  return (
    <PosterAndTitle
      size="large"
      uri={anime.coverImage?.large}
      onPress={() => {
        navigation.push("Details", { id: anime.id });
      }}
      title={getTitle(anime.title)}
    />
  );
}

const htmlViewStyle = StyleSheet.create({
  // eslint-disable-next-line
  p: {
    color: darkTheme.text,
    fontFamily: Manrope.regular,
    fontSize: 16,
  },
  // eslint-disable-next-line
  i: {
    color: darkTheme.text,
    fontFamily: Manrope.regular,
    fontSize: 16,
  },
});
