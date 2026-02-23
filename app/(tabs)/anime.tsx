import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { fbs } from "fbtee";
import { sortBy } from "lodash";
import React, { useState, useMemo } from "react";
import { RefreshControl, View, StyleSheet, Text, FlatList } from "react-native";

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
import { AnimeSkeleton } from "yep/screens/AnimeScreen/AnimeSkeleton";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { useAccessToken } from "yep/useAccessToken";
import { getMediaListStatusLabel, notEmpty } from "yep/utils";

export default function Anime() {
  const [status, setStatus] = useState<MediaListStatus>(
    MediaListStatusWithLabel[0].value,
  );

  const { accessToken, setAccessToken } = useAccessToken();
  const router = useRouter();

  const [, , promptAsync] = useAniListAuthRequest();
  const { loading: loadingViewer, data: viewerData } = useGetViewerQuery({
    skip: !accessToken,
  });

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
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const list = useMemo(
    () =>
      sortBy(
        (animeListData?.MediaListCollection?.lists?.[0]?.entries ?? []).filter(
          notEmpty,
        ),
        (m) => m.media?.title?.english,
      ),
    [animeListData],
  );

  const statusOptions = MediaListStatusWithLabel.map(({ value }) => ({
    label: getMediaListStatusLabel(value),
    value,
  }));

  const refreshing = loadingViewer || loadingAnimeList;

  return (
    <View
      style={[styles.outerContainer, { backgroundColor: darkTheme.background }]}
    >
      <Header label={String(fbs("Anime", "Anime tab header label"))} />
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={() => (
          <View style={{ gap: 16, paddingBottom: 16 }}>
            <View>
              <FlatList
                alwaysBounceVertical={false}
                showsHorizontalScrollIndicator={false}
                horizontal
                contentContainerStyle={{ gap: 8 }}
                data={statusOptions}
                keyExtractor={({ value }) => `${value}`}
                renderItem={({ item: { label, value } }) => (
                  <StatusChip
                    label={label}
                    key={value}
                    onPress={() => setStatus(value)}
                    isSelected={status === value}
                  />
                )}
              />
            </View>
            <View style={styles.countAndSortRow}>
              <Text style={styles.count}>
                <fbt desc="Anime list title count">
                  <fbt:param name="count">{list.length}</fbt:param>{" "}
                  <fbt:plural count={list.length} many="titles" name="titleCount">
                    title
                  </fbt:plural>
                </fbt>
              </Text>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.animeListDivider} />}
        data={list}
        ListEmptyComponent={() =>
          refreshing ? (
            <AnimeSkeleton />
          ) : (
            <EmptyState
              title={
                !accessToken
                  ? String(fbs("Log in", "Anime empty state login title"))
                  : String(fbs("Empty list", "Anime empty state title"))
              }
              description={
                !accessToken
                  ? String(
                      fbs(
                        "Start tracking your anime by using an AniList account!",
                        "Anime empty state login description",
                      ),
                    )
                  : String(
                      fbs(
                        "Explore the world of anime by adding some shows to your list!",
                        "Anime empty state list description",
                      ),
                    )
              }
              cta={{
                label: !accessToken
                  ? String(
                      fbs("Log in", "Anime empty state login call to action"),
                    )
                  : String(
                      fbs(
                        "Discover new anime",
                        "Anime empty state discover call to action",
                      ),
                    ),
                onPress: async () => {
                  if (!accessToken) {
                    const result = await promptAsync();

                    if (result.type === "error" || result.type === "success") {
                      if (result.params.access_token) {
                        setAccessToken(result.params.access_token);
                        await SecureStore.setItemAsync(
                          ANILIST_ACCESS_TOKEN_STORAGE,
                          result.params.access_token,
                        );
                      }
                    }
                  } else {
                    router.push("/(tabs)/discover");
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
            first={index === 0}
            last={index === list.length - 1}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  animeListDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: darkTheme.listItemBorder,
  },
  countAndSortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  count: {
    fontFamily: Manrope.regular,
    fontSize: 12.8,
    color: darkTheme.listCount,
  },
});
