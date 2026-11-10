import { NetworkStatus, useQuery } from "@apollo/client";
import { fbs } from "fbtee";
import React from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import {
  ActivityFeedFragment,
  filterListActivities,
} from "yep/graphql/activity";
import { graphql } from "yep/graphql/tada";
import { ProfileSkeleton } from "yep/screens/ProfileScreen/ProfileSkeleton";
import {
  UserProfileContent,
  UserProfileFragment,
} from "yep/screens/ProfileScreen/UserProfileContent";
import { darkTheme } from "yep/themes";

const GetUserProfile = graphql(
  `
    query GetUserProfile($userId: Int!) {
      User(id: $userId) {
        ...UserProfileFragment
      }
      Page(page: 1, perPage: 10) {
        activities(userId: $userId, type: MEDIA_LIST, sort: ID_DESC) {
          __typename
          ... on ListActivity {
            ...ActivityFeedFragment
          }
        }
      }
    }
  `,
  [ActivityFeedFragment, UserProfileFragment],
);

export function useUserProfile(userId: number | undefined) {
  return useQuery(GetUserProfile, {
    skip: !userId,
    variables: { userId: userId ?? 0 },
    notifyOnNetworkStatusChange: true,
  });
}

export function UserProfile({
  profile: { data, loading, error, refetch, networkStatus },
}: {
  profile: ReturnType<typeof useUserProfile>;
}) {
  return (
    <ScrollView
      style={{ backgroundColor: darkTheme.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop -- RefreshControl must be a live element; React Compiler memoizes it
      refreshControl={
        <RefreshControl
          refreshing={networkStatus === NetworkStatus.refetch}
          onRefresh={() => void refetch().catch(() => {})}
          tintColor={darkTheme.text}
          titleColor={darkTheme.text}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {loading && !data?.User ? (
        <ProfileSkeleton />
      ) : data?.User ? (
        <UserProfileContent
          user={data.User}
          activities={filterListActivities(data.Page?.activities)}
        />
      ) : (
        <EmptyState
          title={String(
            fbs("Could not load profile", "User profile error title"),
          )}
          description={
            error?.message ??
            String(fbs("This user was not found.", "Missing user description"))
          }
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: darkTheme.background, flexGrow: 1, padding: 16 },
});
