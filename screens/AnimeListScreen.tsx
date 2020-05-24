import { useQuery } from "@apollo/react-hooks";
import { useActionSheet } from "@expo/react-native-action-sheet";
import React, { useState } from "react";
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
} from "yep/graphql/generated";
import { GetAnimeList } from "yep/graphql/queries/AnimeList";
import { GetViewer } from "yep/graphql/queries/Viewer";
import { takimoto } from "yep/lib/takimoto";
import { getString, StringCase } from "yep/strings";
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

  return (
    <Root>
      <Header label={getString("anime", StringCase.TITLE)} />
      <Container>
        <StatusChipList
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
            <SortIcon source={require("yep/assets/icons/ui/sort.png")} />
          </SortTouchable>
        </CountAndSortRow>
      </Container>
    </Root>
  );
}

const Root = takimoto.View({
  flex: 1,
});

const Container = takimoto.View({
  // flex: 1,
  padding: 16,
});

const Spacer = takimoto.View({
  height: 16,
});

const StatusChipList = takimoto.FlatList<{
  label: string;
  value: MediaListStatus;
}>(
  {},
  {
    alignItems: "flex-start",
  }
);

const StatusChipListDivider = takimoto.View({ width: 4 });

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
