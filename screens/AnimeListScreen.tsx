import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  CompositeNavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { sortBy } from "lodash";
import React, { useState, useMemo, useCallback } from "react";
import { RefreshControl, View } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { StatusChip } from "yep/components/StatusChip";
import {
  ANILIST_ACCESS_TOKEN_STORAGE,
  MediaListStatusWithLabel,
} from "yep/constants";
import { AnimeListItemContainer } from "yep/containers/AnimeListItemContainer";
import {
  MediaListStatus,
  useGetViewerQuery,
  useGetAnimeListQuery,
} from "yep/graphql/generated";
import { useAniListAuthRequest } from "yep/hooks/auth";
import { RootStackParamList, TabParamList } from "yep/navigation";
import { getString, StringCase } from "yep/strings";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { useAccessToken } from "yep/useAccessToken";
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

  const { accessToken, setAccessToken } = useAccessToken();

  const [, , promptAsync] = useAniListAuthRequest();
  // TODO: save userId to AsyncStorage instead of fetching
  const { loading: loadingViewer, data: viewerData } = useGetViewerQuery({
    skip: !accessToken,
  });
  // hiiieeeeedewes

  const {
    loading: loadingAnimeList,
    data: animeListData,
    refetch,
  } = useGetAnimeListQuery({
    skip: !viewerData?.Viewer?.id || !accessToken,
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

      <AnimeFlatList
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={() => (
          <View style={{ gap: 16, paddingBottom: 16 }}>
            <StatusChipListContainer>
              <StatusChipList
                alwaysBounceVertical={false}
                showsHorizontalScrollIndicator={false}
                horizontal
                data={MediaListStatusWithLabel}
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
            <CountAndSortRow>
              <Count>{listCountText}</Count>
            </CountAndSortRow>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={AnimeListDivider}
        data={list}
        ListEmptyComponent={() =>
          refreshing ? null : (
            <EmptyState
              title={!accessToken ? "Log In" : "Empty list"}
              description={
                !accessToken
                  ? "Start tracking your anime by using an AniList account!"
                  : "Explore the world of anime by adding some shows to your list!"
              }
              cta={{
                label: !accessToken ? "Log In" : "Discover new anime",
                onPress: async () => {
                  if (!accessToken) {
                    const result = await promptAsync();

                    if (result.type === "error" || result.type === "success") {
                      if (result.params.access_token) {
                        setAccessToken(result.params.access_token);
                        await AsyncStorage.setItem(
                          ANILIST_ACCESS_TOKEN_STORAGE,
                          result.params.access_token
                        );
                      }
                    }
                  } else {
                    navigation.navigate("Discover");
                  }
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
        renderItem={({ item, index }) => (
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
            first={index === 0}
            last={index === list.length - 1}
          />
        )}
      />
    </OuterContainer>
  );
}

const OuterContainer = takimoto.View({
  flex: 1,
});

const StatusChipListContainer = takimoto.View({});
const StatusChipList = takimoto.FlatList<{
  label: string;
  value: MediaListStatus;
}>({}, { gap: 8 });

function makeAnimeFlatList<T>() {
  return takimoto.FlatList<T>({}, {});
}

const AnimeListDivider = takimoto.View({
  height: 1,
  backgroundColor: darkTheme.listItemBorder,
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
