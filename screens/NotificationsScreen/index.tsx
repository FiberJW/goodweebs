import { NetworkStatus, useApolloClient } from "@apollo/client";
import { fbs } from "fbtee";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { EmptyState } from "yep/components/EmptyState";
import { PagedList } from "yep/components/PagedList";
import { usePaginatedQuery } from "yep/graphql/pagination";
import { graphql } from "yep/graphql/tada";
import { useViewer } from "yep/graphql/viewer";
import {
  NotificationRow,
  NotificationRowData,
  NotificationRowFragment,
} from "yep/screens/NotificationsScreen/NotificationRow";
import { useAccessToken } from "yep/session";
import { darkTheme } from "yep/themes";

const GetNotifications = graphql(
  `
    query GetNotifications($page: Int!, $perPage: Int!, $reset: Boolean) {
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

function keyExtractor(entry: NotificationRowData) {
  return `${entry.id}`;
}

function renderNotification({ item }: { item: NotificationRowData }) {
  return <NotificationRow item={item} />;
}

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const { cache } = useApolloClient();
  const { accessToken } = useAccessToken();
  const viewerId = useViewer().viewer?.id;

  const notifications = usePaginatedQuery(GetNotifications, {
    skip: !accessToken,
    perPage: NOTIFICATIONS_PER_PAGE,
    variables: { reset: true },
    fetchPolicy: "cache-and-network",
    items: (page) => page.notifications,
  });
  const { data, networkStatus } = notifications;

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

  const rows = notifications.items.flatMap((notification) => {
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

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
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
      ) : notifications.isInitialLoading ? (
        <ActivityIndicator
          color={darkTheme.text}
          size="large"
          style={styles.loading}
        />
      ) : !data && notifications.error ? (
        <EmptyState
          title={String(
            fbs("Could not load notifications", "Notifications error title"),
          )}
          description={notifications.error.message}
        />
      ) : (
        <PagedList
          paging={notifications}
          joined
          contentContainerStyle={styles.listContent}
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
                  "Airing episodes and newly added related anime and manga will show up here.",
                  "Notifications empty state description",
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
  listContent: { padding: 16 },
  loading: { flex: 1 },
});
