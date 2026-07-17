import { NetworkStatus, useQuery } from "@apollo/client";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { fbs } from "fbtee";
import React, { useEffect } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { FollowButton } from "yep/components/FollowButton";
import { UserProfileFragment } from "yep/graphql/profile";
import { graphql } from "yep/graphql/tada";
import { ProfileSkeleton } from "yep/screens/ProfileScreen/ProfileSkeleton";
import { UserProfileContent } from "yep/screens/ProfileScreen/UserProfileContent";
import { darkTheme } from "yep/themes";
import { useAccessToken } from "yep/useAccessToken";

const GetUserProfile = graphql(
  `
    query GetUserProfile($userId: Int!, $includeViewer: Boolean!) {
      Viewer @include(if: $includeViewer) {
        id
      }
      User(id: $userId) {
        ...UserProfileFragment
      }
    }
  `,
  [UserProfileFragment],
);

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { accessToken } = useAccessToken();
  const userId = Number(id);
  const validUserId = Number.isInteger(userId) && userId > 0;
  const { data, loading, error, refetch, networkStatus } = useQuery(
    GetUserProfile,
    {
      skip: !validUserId,
      variables: {
        userId,
        includeViewer: Boolean(accessToken),
      },
      notifyOnNetworkStatusChange: true,
    },
  );
  useEffect(() => {
    navigation.setOptions({
      title: data?.User?.name ?? String(fbs("Profile", "User profile title")),
    });
  }, [data?.User?.name, navigation]);

  return (
    <ScrollView
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
          action={
            accessToken ? (
              <FollowButton
                userId={data.User.id}
                isFollowing={Boolean(data.User.isFollowing)}
                isOwnProfile={data.User.id === data.Viewer?.id}
              />
            ) : undefined
          }
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
