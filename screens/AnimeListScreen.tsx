import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  CompositeNavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { sortBy } from "lodash";
import React, { useState, useMemo, useCallback } from "react";
import { RefreshControl } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { StatusChip } from "yep/components/StatusChip";
import { MediaListStatusWithLabel } from "yep/constants";
import { AnimeListItemContainer } from "yep/containers/AnimeListItemContainer";
import {
  MediaListStatus,
  useGetViewerQuery,
  useGetAnimeListQuery,
} from "yep/graphql/generated";
import { RootStackParamList, TabParamList } from "yep/navigation";
import { getString, StringCase } from "yep/strings";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { notEmpty } from "yep/utils";

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, "Anime">,
    StackNavigationProp<RootStackParamList>
  >;
};

export function AnimeListScreen({ navigation }: Props) {
  const [isFirstFocus, setIsFirstFocus] = useState(true);
  const [status, setStatus] = useState<MediaListStatus>(
    MediaListStatusWithLabel[0].value
  );

  // TODO: combine queries
  const { loading: loadingViewer, data: viewerData } = useGetViewerQuery();

  const {
    loading: loadingAnimeList,
    data: animeListData,
    refetch,
  } = useGetAnimeListQuery({
    skip: !viewerData?.Viewer?.id,
    variables: {
      userId: viewerData?.Viewer?.id,
      status,
    },
    // TODO: figure out how to maintain the list position while also updating the cache
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
  });

  const list = useMemo(
    () =>
      sortBy(
        (
          (animeListData?.MediaListCollection?.lists &&
            animeListData?.MediaListCollection?.lists[0]?.entries) ??
          []
        ).filter(notEmpty),
        (m) => m.media?.title?.english
      ),
    [animeListData]
  );

  const listCountText = `${list.length} title${list.length !== 1 ? "s" : ""}`;

  // TODO: maybe make this better? feels a little dank
  const AnimeFlatList = makeAnimeFlatList<typeof list[number]>();

  const refreshing = loadingViewer || loadingAnimeList;

  useFocusEffect(
    useCallback(
      function refetchWhenRefocused() {
        if (isFirstFocus) {
          setIsFirstFocus(false);
          return;
        }

        if (viewerData) {
          refetch({
            userId: viewerData?.Viewer?.id,
            status,
          });
        }
      },
      [isFirstFocus, viewerData, status]
    )
  );

  return (
    <OuterContainer>
      <Header label={getString("anime", StringCase.TITLE)} />
      <InnerContainer>
        <StatusChipListContainer>
          <StatusChipList
            alwaysBounceVertical={false}
            showsHorizontalScrollIndicator={false}
            horizontal
            data={MediaListStatusWithLabel}
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

        <AnimeListContainer>
          <AnimeFlatList
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={AnimeListDivider}
            data={list}
            ListEmptyComponent={() =>
              refreshing ? null : (
                <EmptyState
                  title="Empty list"
                  description="Explore the world of anime by adding some shows to your list!"
                  cta={{
                    label: "Discover new anime",
                    onPress: () => {
                      navigation.navigate("Discover");
                    },
                  }}
                />
              )
            }
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
                refetchList={async () => {
                  await refetch({
                    userId: viewerData?.Viewer?.id,
                    status,
                  });
                }}
                refetchListVariables={{
                  userId: viewerData?.Viewer?.id,
                  status,
                }}
                navigation={navigation}
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

const StatusChipListDivider = takimoto.View({ width: 8 });

const AnimeListContainer = takimoto.View({
  flex: 1,
});

const CountAndSortRow = takimoto.View({
  flexDirection: "row",
  justifyContent: "space-between",
});

const Count = takimoto.Text({
  fontFamily: Manrope.regular,
  fontSize: 12.8,
  color: darkTheme.listCount,
});

export const Spinner = takimoto.ActivityIndicator({
  paddingBottom: 16,
});
