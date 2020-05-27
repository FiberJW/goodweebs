import { useQuery, useMutation } from "@apollo/react-hooks";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";

import { AnimeListItem } from "yep/components/AnimeListItem";
import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { StatusChip } from "yep/components/StatusChip";
import { Statuses, Sorts } from "yep/constants";
import {
  GetViewerQuery,
  GetViewerQueryVariables,
  GetAnimeListQuery,
  GetAnimeListQueryVariables,
  MediaListStatus,
  MediaListSort,
  AnimeFragmentFragment,
  UpdateProgressMutation,
  UpdateProgressMutationVariables,
} from "yep/graphql/generated";
import { UpdateProgress } from "yep/graphql/mutations/UpdateProgress";
import { GetAnimeList } from "yep/graphql/queries/AnimeList";
import { GetViewer } from "yep/graphql/queries/Viewer";
import { RootStackParamList } from "yep/navigation";
import { getString, StringCase } from "yep/strings";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { notEmpty } from "yep/utils";

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
};

export function AnimeListScreen({ navigation }: Props) {
  const [status, setStatus] = useState<MediaListStatus>(Statuses[0].value);

  const [sort, setSort] = useState<{ label: string; value: MediaListSort }>(
    Sorts[0]
  );

  const { showActionSheetWithOptions } = useActionSheet();

  const { loading: loadingViewer, data: viewerData } = useQuery<
    GetViewerQuery,
    GetViewerQueryVariables
  >(GetViewer);

  const { loading: loadingAnimeList, data: animeListData, refetch } = useQuery<
    GetAnimeListQuery,
    GetAnimeListQueryVariables
  >(GetAnimeList, {
    skip: !viewerData?.Viewer?.id,
    variables: {
      userId: viewerData?.Viewer?.id,
      status,
      sort: [sort.value],
    },
  });

  const [updateProgress] = useMutation<
    UpdateProgressMutation,
    UpdateProgressMutationVariables
  >(UpdateProgress);

  const list = (
    (animeListData?.MediaListCollection?.lists &&
      animeListData?.MediaListCollection?.lists[0]?.entries) ??
    []
  ).filter(notEmpty);

  const listCountText = `${list.length} title${list.length !== 1 ? "s" : ""}`;
  const sortText = `Sort: ${sort.label}`;

  // TODO: maybe make this better? feels a little dank
  const AnimeFlatList = makeAnimeFlatList<typeof list[number]>();

  const refreshing = loadingViewer || loadingAnimeList;

  return (
    <OuterContainer>
      <Header
        label={getString("anime", StringCase.TITLE)}
        refreshing={refreshing}
        onSyncPress={() =>
          refetch({
            userId: viewerData?.Viewer?.id,
            status,
          })
        }
      />
      <InnerContainer>
        <StatusChipListContainer>
          <StatusChipList
            alwaysBounceVertical={false}
            showsHorizontalScrollIndicator={false}
            horizontal
            data={Statuses}
            ItemSeparatorComponent={StatusChipListDivider}
            keyExtractor={({ label }) => label}
            renderItem={({ item: { label, value } }) => (
              <StatusChip
                label={label}
                key={label}
                onPress={() => setStatus(value)}
                isSelected={status === value}
              />
            )}
          />
        </StatusChipListContainer>
        <Spacer />
        <CountAndSortRow>
          <Count>{listCountText}</Count>
          <SortTouchable
            onPress={() => {
              const options = Sorts.map((s) => s.label);

              const destructiveButtonIndex = Sorts.findIndex(
                (s) => s.value === sort.value
              );

              showActionSheetWithOptions(
                {
                  options,
                  destructiveButtonIndex,
                  destructiveColor: darkTheme.accent,
                },
                (buttonIndex) => {
                  setSort(Sorts[buttonIndex]);
                }
              );
            }}
          >
            <SortLabel>{sortText}</SortLabel>
            <SortIcon source={require("yep/assets/icons/sort.png")} />
          </SortTouchable>
        </CountAndSortRow>
        <Spacer />

        {list.length ? (
          <AnimeListContainer>
            <AnimeFlatList
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={AnimeListDivider}
              data={list}
              // refreshControl={
              //   <RefreshControl
              //     refreshing={refreshing && refreshedFromGesture}
              //     onRefresh={async () => {
              //       setRefreshedFromGesture(true);
              //       await refetch({
              //         userId: viewerData?.Viewer?.id,
              //         status,
              //       });
              //       setRefreshedFromGesture(false);
              //     }}
              //     tintColor={white}
              //     titleColor={white}
              //   />
              // }
              keyExtractor={(item) => `${item.id}`}
              renderItem={({ item }) => (
                <AnimeListItem
                  navigation={navigation}
                  progress={item.progress ?? 0}
                  onIncrement={async () => {
                    await updateProgress({
                      variables: {
                        id: item.id,
                        progress: (item.progress ?? 0) + 1,
                      },
                    });
                    await refetch();
                  }}
                  onDecrement={async () => {
                    await updateProgress({
                      variables: {
                        id: item.id,
                        progress: (item.progress ?? 0) - 1,
                      },
                    });
                    await refetch();
                  }}
                  media={item?.media as AnimeFragmentFragment}
                />
              )}
            />
          </AnimeListContainer>
        ) : (
          <EmptyState />
        )}
      </InnerContainer>
    </OuterContainer>
  );
}

const OuterContainer = takimoto.View({
  flex: 1,
});

const InnerContainer = takimoto.View({
  padding: 16,
  flex: 1,
});

const Spacer = takimoto.View({
  height: 16,
});

const StatusChipListContainer = takimoto.View({});
const StatusChipList = takimoto.FlatList<{
  label: string;
  value: MediaListStatus;
}>({}, {});

function makeAnimeFlatList<T>() {
  return takimoto.FlatList<T>({}, {});
}

const AnimeListDivider = takimoto.View({ height: 8 });

const StatusChipListDivider = takimoto.View({ width: 4 });

const AnimeListContainer = takimoto.View({
  flex: 1,
});

const CountAndSortRow = takimoto.View({
  flexDirection: "row",
  justifyContent: "space-between",
});

const Count = takimoto.Text({
  fontFamily: "Manrope-Regular",
  fontSize: 12.8,
  color: darkTheme.listCount,
});

export const Spinner = takimoto.ActivityIndicator({
  paddingBottom: 16,
});

const SortTouchable = takimoto.TouchableOpacity({
  flexDirection: "row",
  alignItems: "center",
});

const SortLabel = takimoto.Text({
  fontFamily: "Manrope-Regular",
  fontSize: 12.8,
  color: darkTheme.text,
  marginRight: 4,
});

const SortIcon = takimoto.Image({
  height: 16,
  width: 16,
});
