import { useQuery } from "@apollo/react-hooks";
import { StackNavigationProp } from "@react-navigation/stack";
import { sortBy } from "lodash";
import React, { useState } from "react";
import { RefreshControl } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { StatusChip } from "yep/components/StatusChip";
import { Statuses } from "yep/constants";
import { AnimeListItemContainer } from "yep/containers/AnimeListItemContainer";
import {
  GetViewerQuery,
  GetViewerQueryVariables,
  GetAnimeListQuery,
  GetAnimeListQueryVariables,
  MediaListStatus,
} from "yep/graphql/generated";
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
    },
    notifyOnNetworkStatusChange: true,
  });

  const list = sortBy(
    (
      (animeListData?.MediaListCollection?.lists &&
        animeListData?.MediaListCollection?.lists[0]?.entries) ??
      []
    ).filter(notEmpty),
    (m) => m.media?.title?.english
  );
  const listCountText = `${list.length} title${list.length !== 1 ? "s" : ""}`;

  // TODO: maybe make this better? feels a little dank
  const AnimeFlatList = makeAnimeFlatList<typeof list[number]>();

  const refreshing = loadingViewer || loadingAnimeList;

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
        </CountAndSortRow>
        <Spacer />

        {list.length ? (
          <AnimeListContainer>
            <AnimeFlatList
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={AnimeListDivider}
              data={list}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={async () => {
                    await refetch({
                      userId: viewerData?.Viewer?.id,
                      status,
                    });
                  }}
                  tintColor={darkTheme.text}
                  titleColor={darkTheme.text}
                />
              }
              keyExtractor={(item) => `${item.id}`}
              renderItem={({ item }) => (
                <AnimeListItemContainer
                  seedData={{
                    id: item.id,
                    progress: item.progress ?? 0,
                    media: item.media ?? null,
                  }}
                  refetchList={() =>
                    refetch({
                      userId: viewerData?.Viewer?.id,
                      status,
                    })
                  }
                  navigation={navigation}
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
