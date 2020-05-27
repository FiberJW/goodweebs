import { useQuery, useMutation } from "@apollo/react-hooks";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { formatDistanceToNow, add } from "date-fns";
import React from "react";
import { Picker } from "react-native";
import title from "title";

import { white15 } from "yep/colors";
import { EmptyState } from "yep/components/EmptyState";
import { Statuses } from "yep/constants";
import {
  GetAnimeQuery,
  GetAnimeQueryVariables,
  MediaStatus,
  UpdateStatusMutation,
  UpdateStatusMutationVariables,
} from "yep/graphql/generated";
import { GetAnime } from "yep/graphql/queries/AnimeDetails";
import { RootStackParamList } from "yep/navigation";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { UpdateStatus } from "yep/graphql/mutations/UpdateStatus";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { da } from "date-fns/locale";

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

const AiringText = takimoto.Text({
  color: darkTheme.text,
  fontFamily: "Manrope-Regular",
  fontSize: 12.8,
});

const AiringContainer = takimoto.View({
  width: "100%",
  backgroundColor: darkTheme.navBackground,
  padding: 16,
  borderRadius: 8,
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

const ButtonSpacer = takimoto.View({ width: 8 });

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

const Description = takimoto.Text({
  fontSize: 16,
  color: darkTheme.text,
  fontFamily: "Manrope-Regular",
});

type ButtonProps = { label: string; onPress: () => void };

function Button({ label, onPress }: ButtonProps) {
  return (
    <ButtonTouchable onPress={onPress}>
      <ButtonLabel>{label}</ButtonLabel>
    </ButtonTouchable>
  );
}

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, "Details">;
};

export function DetailsScreen({ route }: Props) {
  const { showActionSheetWithOptions } = useActionSheet();

  const { loading, data, refetch } = useQuery<
    GetAnimeQuery,
    GetAnimeQueryVariables
  >(GetAnime, { variables: { id: route.params.id } });

  const [updateStatus] = useMutation<
    UpdateStatusMutation,
    UpdateStatusMutationVariables
  >(UpdateStatus);

  return loading ? (
    <EmptyState />
  ) : (
    <Container
      showsVerticalScrollIndicator={false}
      alwaysBounceVertical={false}
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
            <Info label="Episodes" value={`${data?.Media?.episodes}`} />
            <Info label="Genre" value={data?.Media?.genres?.join(", ") ?? ""} />
          </InfoRow>
          <InfoRowSpacer />
          <InfoRow>
            <Info label="Score" value={`${data?.Media?.averageScore}/100`} />
            <Info label="Status" value={title(`${data?.Media?.status}`)} />
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
          label={
            Statuses.find(
              (x) => x.value === data?.Media?.mediaListEntry?.status
            )?.label ?? "Add to List"
          }
          onPress={() => {
            const options = Statuses.map((s) => s.label);

            const destructiveButtonIndex = Statuses.findIndex(
              (s) => s.value === data?.Media?.mediaListEntry?.status
            );

            showActionSheetWithOptions(
              {
                options,
                destructiveButtonIndex,
                destructiveColor: darkTheme.accent,
              },
              async (buttonIndex) => {
                await updateStatus({
                  variables: {
                    id: data?.Media?.mediaListEntry?.id,
                    status: Statuses[buttonIndex].value,
                  },
                });
                await refetch({ id: data?.Media?.id });
              }
            );
          }}
        />
      </ButtonsRow>
      <Description>{data?.Media?.description}</Description>
    </Container>
  );
}
