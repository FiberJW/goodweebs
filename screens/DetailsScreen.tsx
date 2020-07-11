import { useQuery, useMutation } from "@apollo/react-hooks";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { formatDistanceToNow, add } from "date-fns";
import React, { useState, useEffect } from "react";
import { StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import HTMLView from "react-native-htmlview";
import { useSafeArea } from "react-native-safe-area-context";
import title from "title";

import { white15 } from "yep/colors";
import { EmptyState } from "yep/components/EmptyState";
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
} from "yep/graphql/generated";
import { UpdateProgress } from "yep/graphql/mutations/UpdateProgress";
import { UpdateScore } from "yep/graphql/mutations/UpdateScore";
import { UpdateStatus } from "yep/graphql/mutations/UpdateStatus";
import { GetAnime } from "yep/graphql/queries/AnimeDetails";
import { RootStackParamList } from "yep/navigation";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";

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
  fontFamily: "Manrope-ExtraBold",
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
  fontFamily: "Manrope-Regular",
  fontSize: 12.8,
  color: darkTheme.text,
  marginBottom: 4,
});

const InfoValue = takimoto.Text({
  fontFamily: "Manrope-SemiBold",
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
  fontFamily: "Manrope-SemiBold",
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
  fontFamily: "Manrope-SemiBold",
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
  fontFamily: "Manrope-SemiBold",
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

  useEffect(
    function callOnChangeWhenCountChanges() {
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
  padding: 8,
  borderRadius: 16,
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

export function DetailsScreen({ route }: Props) {
  const { showActionSheetWithOptions } = useActionSheet();
  const insets = useSafeArea();
  const [loadingStatus, setLoadingStatus] = useState(false);

  const { loading, data, refetch } = useQuery<
    GetAnimeQuery,
    GetAnimeQueryVariables
  >(GetAnime, {
    variables: { id: route.params.id },
    notifyOnNetworkStatusChange: true,
  });

  const [updateStatus] = useMutation<
    UpdateStatusMutation,
    UpdateStatusMutationVariables
  >(UpdateStatus);

  const [updateScore] = useMutation<
    UpdateScoreMutation,
    UpdateScoreMutationVariables
  >(UpdateScore);

  const [updateProgress] = useMutation<
    UpdateProgressMutation,
    UpdateProgressMutationVariables
  >(UpdateProgress);

  return !data ? (
    <EmptyState />
  ) : (
    <Container
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => refetch({ id: route.params.id })}
          tintColor={darkTheme.text}
          titleColor={darkTheme.text}
        />
      }
    >
      <Title numberOfLines={1}>
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
            <Info label="Genre" value={data?.Media?.genres?.join(", ") ?? ""} />
          </InfoRow>
          <InfoRowSpacer />
          <InfoRow>
            {data?.Media?.averageScore ? (
              <Info
                label="Average Score"
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
                label="Next Episode"
                value={`EP ${
                  data?.Media?.nextAiringEpisode?.episode
                } airs in ${formatDistanceToNow(
                  add(new Date(), {
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
                    label="Start Date"
                    value={`${data?.Media?.startDate?.month}/${data?.Media?.startDate?.month}/${data?.Media?.startDate?.year}`}
                  />
                )
              : null}

            {data?.Media?.status === MediaStatus.Finished ||
            data?.Media?.status === MediaStatus.Cancelled
              ? data?.Media?.endDate?.month !== null &&
                data?.Media?.endDate?.month !== undefined && (
                  <Info
                    label="End Date"
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
            )?.label ?? "Add to List"
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
                  variables: {
                    mediaId: data?.Media?.id,
                    status: MediaListStatusWithLabel[buttonIndex].value,
                  },
                });
                await refetch({ id: data?.Media?.id });
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
              try {
                await updateProgress({
                  variables: {
                    id: data?.Media?.mediaListEntry?.id,
                    progress,
                  },
                });
                await refetch({ id: data?.Media?.id });
              } catch (_e) {
                // TODO: display error
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
              try {
                await updateScore({
                  variables: {
                    id: data?.Media?.mediaListEntry?.id,
                    scoreRaw: s * 10,
                  },
                });
                await refetch({ id: data?.Media?.id });
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
    </Container>
  );
}

const htmlViewStyle = StyleSheet.create({
  // eslint-disable-next-line
  p: {
    color: darkTheme.text,
    fontFamily: "Manrope-Regular",
    fontSize: 16,
  },
  // eslint-disable-next-line
  i: {
    color: darkTheme.text,
    fontFamily: "Manrope-Regular",
    fontSize: 16,
  },
});
