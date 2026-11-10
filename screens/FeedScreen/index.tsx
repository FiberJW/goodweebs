import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { fbs } from "fbtee";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { favoritedBackground, white } from "yep/colors";
import { ChipGroup } from "yep/components/ChipGroup";
import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { PagedList } from "yep/components/PagedList";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { ActivityFeedRow } from "yep/components/activity-feed-row";
import {
  GetListActivityFeed,
  type ActivityFeedItem,
  filterListActivities,
} from "yep/graphql/activity";
import { usePaginatedQuery } from "yep/graphql/pagination";
import { formatUnreadCount, useViewer } from "yep/graphql/viewer";
import { useAccessToken } from "yep/session";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

const FEED_PER_PAGE = 25;
type FeedScope = "personal" | "following" | "global";

function keyExtractor(activity: ActivityFeedItem) {
  return `${activity.id}`;
}

function renderActivity({ item }: { item: ActivityFeedItem }) {
  return <ActivityFeedRow item={item} />;
}

export default function FeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accessToken } = useAccessToken();
  // Only an explicit chip tap is state; the default derives from auth so it
  // tracks login/logout without any state syncing — the tabs never remount
  // on auth flips (Stack.Protected keeps them mounted for guests), so a
  // mount-time default would strand a guest who logs in on "global".
  const [selectedScope, setSelectedScope] = useState<FeedScope | null>(null);
  const scope = selectedScope ?? (accessToken ? "following" : "global");
  const {
    viewer,
    loading: viewerLoading,
    error: viewerError,
    refetch: refetchViewer,
  } = useViewer();
  const viewerId = viewer?.id;
  const unreadCount = viewer?.unreadNotificationCount ?? 0;
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
  const feed = usePaginatedQuery(GetListActivityFeed, {
    skip: requiresLogin || waitingForViewer,
    perPage: FEED_PER_PAGE,
    variables: {
      userId: scope === "personal" ? viewerId : undefined,
      isFollowing: scope === "following" ? true : undefined,
      activityType: "MEDIA_LIST",
    },
    items: (page) => page.activities,
  });
  const activities = filterListActivities(feed.items);
  const showInitialLoading =
    feed.isInitialLoading || (waitingForViewer && viewerLoading);

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
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
                    {formatUnreadCount(unreadCount)}
                  </Text>
                </View>
              ) : null}
            </View>
          </PressableOpacity>
        }
      />
      <ChipGroup
        style={styles.scopePicker}
        value={scope}
        onChange={setSelectedScope}
        options={[
          {
            value: "following",
            label: String(fbs("Following", "Following activity feed filter")),
          },
          {
            value: "global",
            label: String(fbs("Global", "Global activity feed filter")),
          },
          {
            value: "personal",
            label: String(fbs("Mine", "Personal activity feed filter")),
          },
        ]}
      />
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
      ) : !feed.data && feed.error ? (
        <EmptyState
          title={String(fbs("Could not load feed", "Feed error title"))}
          description={feed.error.message}
        />
      ) : waitingForViewer ? (
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
        <PagedList
          paging={feed}
          joined
          contentContainerStyle={styles.listContent}
          data={activities}
          keyExtractor={keyExtractor}
          renderItem={renderActivity}
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
          ListFooterComponent={<View style={{ height: insets.bottom + 16 }} />}
        />
      )}
    </SafeAreaView>
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
  scopePicker: { padding: 16 },
});
