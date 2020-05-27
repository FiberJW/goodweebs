import { useQuery } from "@apollo/react-hooks";
import { useActionSheet } from "@expo/react-native-action-sheet";
import React, { useState } from "react";

import { AnimeListItem } from "yep/components/AnimeListItem";
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
} from "yep/graphql/generated";
import { GetAnimeList } from "yep/graphql/queries/AnimeList";
import { GetViewer } from "yep/graphql/queries/Viewer";
import { getString, StringCase } from "yep/strings";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";

export function AnimeListScreen() {
  const [status, setStatus] = useState<MediaListStatus>(Statuses[0].value);

  const [sort, setSort] = useState<{ label: string; value: MediaListSort }>(
    Sorts[0]
  );

  const { showActionSheetWithOptions } = useActionSheet();

  const { loading: loadingViewer, data: viewerData } = useQuery<
    GetViewerQuery,
    GetViewerQueryVariables
  >(GetViewer);

  const { loading: loadingAnimeList, data: animeListData } = useQuery<
    GetAnimeListQuery,
    GetAnimeListQueryVariables
  >(GetAnimeList, {
    skip: !viewerData?.Viewer?.id,
    variables: {
      userId: viewerData?.Viewer?.id,
      status,
    },
  });

  console.log({ loadingViewer, loadingAnimeList, viewerData, animeListData });

  const list =
    (animeListData?.MediaListCollection?.lists &&
      animeListData?.MediaListCollection?.lists[0]?.entries) ??
    [];

  const listCountText = `${list.length} title${list.length !== 1 ? "s" : ""}`;
  const sortText = `Sort: ${sort.label}`;

  // TODO: maybe make this better? feels a little dank
  const AnimeFlatList = makeAnimeFlatList<typeof list[number]>();

  return (
    <OuterContainer>
      <Header label={getString("anime", StringCase.TITLE)} />
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
        <AnimeListContainer>
          <AnimeFlatList
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={AnimeListDivider}
            data={list}
            keyExtractor={(item) => `${item?.id}`}
            renderItem={({ item }) => (
              <AnimeListItem
                progress={item?.progress ?? 0}
                onIncrement={() => {}}
                onDecrement={() => {}}
                onComplete={() => {}}
                media={item?.media as AnimeFragmentFragment}
              />
            )}
          />
        </AnimeListContainer>
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
