import { NetworkStatus, useApolloClient, useQuery } from "@apollo/client";
import { fbs } from "fbtee";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "yep/components/EmptyState";
import { graphql } from "yep/graphql/tada";
import { GetViewer } from "yep/graphql/viewer";
import { useLoadNextPage } from "yep/hooks/helpers";
import {
  NotificationRow,
  NotificationRowData,
  NotificationRowFragment,
} from "yep/screens/NotificationsScreen/NotificationRow";
import { darkTheme } from "yep/themes";
import { useAccessToken } from "yep/useAccessToken";

const GetNotifications = graphql(
  `
    query GetNotifications($page: Int, $perPage: Int, $reset: Boolean) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
        }
        notifications(
          type_in: [AIRING, RELATED_MEDIA_ADDITION]
          resetNotificationCount: $reset
        ) {
          ...NotificationRowFragment
        }
      }
    }
  `,
  [NotificationRowFragment],
);

const NOTIFICATIONS_PER_PAGE = 25;

type NotificationListRow = {
  entry: NotificationRowData;
  first: boolean;
  last: boolean;
};

function keyExtractor({ entry }: NotificationListRow) {
  return `${entry.id}`;
}

function renderNotification({ item }: { item: NotificationListRow }) {
  return (
    <NotificationRow item={item.entry} first={item.first} last={item.last} />
  );
}

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const { cache } = useApolloClient();
  const { accessToken } = useAccessToken();
  const { data: viewerData } = useQuery(GetViewer, {
    fetchPolicy: "cache-only",
  });
  const viewerId = viewerData?.Viewer?.id;

  const { data, loading, error, refetch, fetchMore, networkStatus } = useQuery(
    GetNotifications,
    {
      // The tab stays visible for guests (NativeTabs remounts crash if
      // triggers flip — see the tabs layout); the screen gates instead.
      skip: !accessToken,
      variables: { page: 1, perPage: NOTIFICATIONS_PER_PAGE, reset: true },
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    },
  );

  // The query resets the server-side count; zero the cached viewer count too
  // so the bell badge clears without refetching the whole viewer.
  useEffect(() => {
    if (viewerId && data && networkStatus === NetworkStatus.ready) {
      cache.modify({
        id: cache.identify({ __typename: "User", id: viewerId }),
        fields: { unreadNotificationCount: () => 0 },
      });
    }
  }, [cache, data, networkStatus, viewerId]);

  const isRefetching = networkStatus === NetworkStatus.refetch;
  const isFetchingMore = networkStatus === NetworkStatus.fetchMore;

  const loadNextPage = useLoadNextPage({
    loadedCount: (data?.Page?.notifications ?? []).length,
    hasNextPage: data?.Page?.pageInfo?.hasNextPage,
    paused: isRefetching,
    perPage: NOTIFICATIONS_PER_PAGE,
    fetchMore,
  });

  // Anime and manga rows both link to /details/[id]; rows without media have
  // nothing to link to. The generated union also carries empty members for
  // every other notification type — narrow those away.
  const rows = (data?.Page?.notifications ?? []).flatMap((notification) => {
    if (
      notification &&
      (notification.__typename === "AiringNotification" ||
        notification.__typename === "RelatedMediaAdditionNotification") &&
      notification.media
    ) {
      return [{ ...notification, media: notification.media }];
    }
    return [];
  });
  const listRows = rows.map((entry, index) => ({
    entry,
    first: index === 0,
    last: index === rows.length - 1,
  }));

  return (
    <View style={styles.container}>
      {!accessToken ? (
        <EmptyState
          title={String(fbs("Log in", "Notifications empty state login title"))}
          description={String(
            fbs(
              "Notifications show up here once you log in with your AniList account.",
              "Notifications empty state login description",
            ),
          )}
        />
      ) : !data && loading ? (
        <ActivityIndicator
          color={darkTheme.text}
          size="large"
          style={styles.loading}
        />
      ) : !data && error ? (
        <EmptyState
          title={String(
            fbs("Could not load notifications", "Notifications error title"),
          )}
          description={error.message}
        />
      ) : (
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          data={listRows}
          keyExtractor={keyExtractor}
          renderItem={renderNotification}
          ListEmptyComponent={
            <EmptyState
              title={String(
                fbs("No notifications", "Notifications empty state title"),
              )}
              description={String(
                fbs(
                  "Airing episodes and newly added related anime and manga will show up here.",
                  "Notifications empty state description",
                ),
              )}
            />
          }
          // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop -- RefreshControl must be a live element; React Compiler memoizes it
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                refetch({ page: 1 }).catch(() => {});
              }}
              tintColor={darkTheme.text}
              titleColor={darkTheme.text}
            />
          }
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.5}
          // Bottom spacer instead of dynamic contentContainerStyle padding:
          // works on Android (contentInset is iOS-only) and avoids
          // react-doctor's dynamic-padding rule.
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
  divider: {
    backgroundColor: darkTheme.listItemBorder,
    height: StyleSheet.hairlineWidth,
  },
  listContent: { padding: 16 },
  loading: { flex: 1 },
});
