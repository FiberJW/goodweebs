import { NetworkStatus, useQuery } from "@apollo/client";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { fbs } from "fbtee";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { favoritedBackground, white } from "yep/colors";
import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { StatusChip } from "yep/components/StatusChip";
import {
  ActivityFeedDivider,
  ActivityFeedRow,
} from "yep/components/activity-feed-row";
import {
  ActivityFeedFragment,
  type ActivityFeedItem,
  filterListActivities,
} from "yep/graphql/activity";
import { graphql } from "yep/graphql/tada";
import { GetViewer } from "yep/graphql/viewer";
import { useLoadNextPage } from "yep/hooks/helpers";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { useAccessToken } from "yep/useAccessToken";

const GetListActivityFeed = graphql(
  `
    query GetListActivityFeed(
      $page: Int!
      $perPage: Int!
      $userId: Int
      $isFollowing: Boolean
      $activityType: ActivityType!
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
        }
        activities(
          userId: $userId
          isFollowing: $isFollowing
          type: $activityType
          sort: ID_DESC
        ) {
          __typename
          ... on ListActivity {
            ...ActivityFeedFragment
          }
        }
      }
    }
  `,
  [ActivityFeedFragment],
);

const FEED_PER_PAGE = 25;
type FeedScope = "personal" | "following" | "global";
type ActivityFeedListRow = {
  activity: ActivityFeedItem;
  first: boolean;
  last: boolean;
};

function keyExtractor({ activity }: ActivityFeedListRow) {
  return `${activity.id}`;
}

function renderActivity({ item }: { item: ActivityFeedListRow }) {
  return (
    <ActivityFeedRow item={item.activity} first={item.first} last={item.last} />
  );
}

export default function FeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accessToken } = useAccessToken();
  const [scope, setScope] = useState<FeedScope>(
    accessToken ? "following" : "global",
  );
  const {
    data: viewerData,
    loading: viewerLoading,
    error: viewerError,
    refetch: refetchViewer,
  } = useQuery(GetViewer, {
    skip: !accessToken,
  });
  const viewerId = viewerData?.Viewer?.id;
  const unreadCount = viewerData?.Viewer?.unreadNotificationCount ?? 0;
  const notificationLabel =
    unreadCount > 0
      ? String(
          fbs(
            [fbs.param("count", `${unreadCount}`), " unread notifications"],
            "Notifications button unread accessibility label",
          ),
        )
      : String(fbs("Notifications", "Open notifications accessibility label"));
  const requiresLogin = scope !== "global" && !accessToken;
  const waitingForViewer = scope === "personal" && !viewerId;
  const { data, loading, error, refetch, fetchMore, networkStatus } = useQuery(
    GetListActivityFeed,
    {
      skip: requiresLogin || waitingForViewer,
      variables: {
        page: 1,
        perPage: FEED_PER_PAGE,
        userId: scope === "personal" ? viewerId : undefined,
        isFollowing: scope === "following" ? true : undefined,
        activityType: "MEDIA_LIST",
      },
      // Default cache-first (NOT cache-and-network): each scope switch would
      // otherwise fire a network request even with cached data, burning
      // AniList's degraded per-minute allowance. Pull-to-refresh covers
      // explicit freshness.
      notifyOnNetworkStatusChange: true,
    },
  );
  const isRefetching = networkStatus === NetworkStatus.refetch;
  const isFetchingMore = networkStatus === NetworkStatus.fetchMore;
  const activities = filterListActivities(data?.Page?.activities);
  const rows = activities.map((activity, index) => ({
    activity,
    first: index === 0,
    last: index === activities.length - 1,
  }));
  const loadNextPage = useLoadNextPage({
    // Raw cache length, not the filtered rows: the cache merges every entry
    // (including ones dropped for null user/media), so the filtered count
    // would compute a page the cache already has and stall pagination.
    loadedCount: (data?.Page?.activities ?? []).length,
    hasNextPage: data?.Page?.pageInfo?.hasNextPage,
    paused: isRefetching,
    perPage: FEED_PER_PAGE,
    fetchMore,
  });
  const showInitialLoading =
    (!data && loading) || (waitingForViewer && viewerLoading);

  return (
    <View style={styles.container}>
      <Header
        label={String(fbs("Feed", "List activity feed tab header label"))}
        rightSlot={
          <PressableOpacity
            accessibilityRole="button"
            accessibilityLabel={notificationLabel}
            onPress={() => router.push("/notification-center")}
          >
            <View>
              <Image
                source={require("yep/assets/icons/navigation/bell-outline.png")}
                style={styles.notificationIcon}
              />
              {unreadCount > 0 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              ) : null}
            </View>
          </PressableOpacity>
        }
      />
      <View style={styles.scopePicker}>
        <StatusChip
          label={String(fbs("Following", "Following activity feed filter"))}
          isSelected={scope === "following"}
          onPress={() => setScope("following")}
        />
        <StatusChip
          label={String(fbs("Global", "Global activity feed filter"))}
          isSelected={scope === "global"}
          onPress={() => setScope("global")}
        />
        <StatusChip
          label={String(fbs("Mine", "Personal activity feed filter"))}
          isSelected={scope === "personal"}
          onPress={() => setScope("personal")}
        />
      </View>
      {requiresLogin ? (
        <EmptyState
          title={String(fbs("Log in", "Feed login required title"))}
          description={String(
            fbs(
              "Log in to see your list changes and updates from people you follow.",
              "Feed login required description",
            ),
          )}
          cta={{
            label: String(fbs("Go to profile", "Feed login call to action")),
            onPress: () => router.push("/(tabs)/profile"),
          }}
        />
      ) : showInitialLoading ? (
        <ActivityIndicator
          color={darkTheme.text}
          size="large"
          style={styles.loading}
        />
      ) : !data && error ? (
        <EmptyState
          title={String(fbs("Could not load feed", "Feed error title"))}
          description={error.message}
        />
      ) : waitingForViewer ? (
        // "Mine" needs the viewer id; if that query failed the feed query
        // stays skipped — surface it instead of a misleading empty feed.
        <EmptyState
          title={String(fbs("Could not load feed", "Feed error title"))}
          description={
            viewerError?.message ??
            String(
              fbs(
                "Your profile could not be loaded.",
                "Feed viewer load failure description",
              ),
            )
          }
          cta={{
            label: String(fbs("Retry", "Search retry button label")),
            onPress: () => void refetchViewer().catch(() => {}),
          }}
        />
      ) : (
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.listContent}
          data={rows}
          ItemSeparatorComponent={ActivityFeedDivider}
          keyExtractor={keyExtractor}
          renderItem={renderActivity}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title={String(fbs("No list updates", "Empty feed title"))}
              description={String(
                fbs(
                  "List changes will appear here as they happen.",
                  "Empty feed description",
                ),
              )}
            />
          }
          // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop -- RefreshControl must be a live element; React Compiler memoizes it
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch({ page: 1 }).catch(() => {})}
              tintColor={white}
              titleColor={white}
            />
          }
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            <View style={{ height: insets.bottom + 16 }}>
              {isFetchingMore ? (
                <ActivityIndicator color={darkTheme.text} />
              ) : null}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: darkTheme.background, flex: 1 },
  listContent: { flexGrow: 1, padding: 16, paddingTop: 0 },
  loading: { flex: 1 },
  notificationIcon: { height: 24, tintColor: white, width: 24 },
  notificationBadge: {
    alignItems: "center",
    backgroundColor: favoritedBackground,
    borderColor: darkTheme.navBackground,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 18,
    minWidth: 18,
    paddingHorizontal: 3,
    position: "absolute",
    right: -9,
    top: -8,
  },
  notificationBadgeText: {
    color: white,
    fontFamily: Manrope.semiBold,
    fontSize: 9,
    fontVariant: ["tabular-nums"],
  },
  scopePicker: { flexDirection: "row", gap: 8, padding: 16 },
});
