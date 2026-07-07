import { NetworkStatus, useApolloClient } from "@apollo/client";
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
import {
  useGetNotificationsQuery,
  useGetViewerQuery,
} from "yep/graphql/generated";
import { useLoadNextPage } from "yep/hooks/helpers";
import {
  NotificationRow,
  NotificationRowData,
} from "yep/screens/NotificationsScreen/NotificationRow";
import { darkTheme } from "yep/themes";

const NOTIFICATIONS_PER_PAGE = 25;

function keyExtractor(item: NotificationRowData) {
  return `${item.id}`;
}

function renderNotification({ item }: { item: NotificationRowData }) {
  return <NotificationRow item={item} />;
}

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const { cache } = useApolloClient();
  const { data: viewerData } = useGetViewerQuery({
    fetchPolicy: "cache-only",
  });
  const viewerId = viewerData?.Viewer?.id;

  const { data, loading, error, refetch, fetchMore, networkStatus } =
    useGetNotificationsQuery({
      variables: { page: 1, perPage: NOTIFICATIONS_PER_PAGE, reset: true },
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    });

  // The query resets the server-side count; zero the cached viewer count too
  // so the bell badge clears without refetching the whole viewer.
  useEffect(() => {
    if (viewerId) {
      cache.modify({
        id: cache.identify({ __typename: "User", id: viewerId }),
        fields: { unreadNotificationCount: () => 0 },
      });
    }
  }, [cache, viewerId]);

  const isRefetching = networkStatus === NetworkStatus.refetch;
  const isFetchingMore = networkStatus === NetworkStatus.fetchMore;

  const loadNextPage = useLoadNextPage({
    loadedCount: (data?.Page?.notifications ?? []).length,
    hasNextPage: data?.Page?.pageInfo?.hasNextPage,
    paused: isRefetching,
    perPage: NOTIFICATIONS_PER_PAGE,
    fetchMore,
  });

  // Anime only: related-media additions can reference manga, and rows
  // without media have nothing to link to. The generated union also carries
  // empty members for every other notification type — narrow those away.
  const rows = (data?.Page?.notifications ?? []).flatMap((notification) => {
    if (
      notification &&
      (notification.__typename === "AiringNotification" ||
        notification.__typename === "RelatedMediaAdditionNotification") &&
      notification.media?.type === "ANIME"
    ) {
      return [{ ...notification, media: notification.media }];
    }
    return [];
  });

  return (
    <View style={styles.container}>
      {!data && loading ? (
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
          data={rows}
          keyExtractor={keyExtractor}
          renderItem={renderNotification}
          ListEmptyComponent={
            <EmptyState
              title={String(
                fbs("No notifications", "Notifications empty state title"),
              )}
              description={String(
                fbs(
                  "Airing episodes and newly added related anime will show up here.",
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
  container: { flex: 1 },
  listContent: { gap: 8, padding: 16 },
  loading: { flex: 1 },
});
