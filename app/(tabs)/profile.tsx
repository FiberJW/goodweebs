import { NetworkStatus, useQuery } from "@apollo/client";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { fbs } from "fbtee";
import React from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

import { white } from "yep/colors";
import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";
import { primeAccessToken } from "yep/graphql/client";
import { GetViewer } from "yep/graphql/viewer";
import { useAniListAuthRequest } from "yep/hooks/auth";
import { ProfileSkeleton } from "yep/screens/ProfileScreen/ProfileSkeleton";
import { UserProfileContent } from "yep/screens/ProfileScreen/UserProfileContent";
import { darkTheme } from "yep/themes";
import { useAccessToken } from "yep/useAccessToken";

export default function Profile() {
  const router = useRouter();
  const { accessToken, setAccessToken } = useAccessToken();
  const [, , promptAsync] = useAniListAuthRequest();
  const {
    loading,
    data,
    error,
    refetch: refetchViewer,
    networkStatus,
  } = useQuery(GetViewer, {
    skip: !accessToken,
    notifyOnNetworkStatusChange: true,
  });
  const isRefetching = networkStatus === NetworkStatus.refetch;

  return (
    <View style={styles.container}>
      <Header
        label={String(fbs("Profile", "Profile tab header label"))}
        rightSlot={
          <PressableOpacity
            onPress={() => router.push("/settings")}
            accessibilityRole="button"
            accessibilityLabel={String(
              fbs("Settings", "Settings button accessibility label"),
            )}
          >
            <Image
              style={styles.settingsIcon}
              source={require("yep/assets/icons/navigation/settings-gear.png")}
            />
          </PressableOpacity>
        }
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop -- RefreshControl must be a live element; React Compiler memoizes it
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetchViewer().catch(() => {})}
            tintColor={white}
            titleColor={white}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {!accessToken ? (
          <EmptyState
            title={String(fbs("Log in", "Profile empty state login title"))}
            description={String(
              fbs(
                "Start tracking your anime by using an AniList account!",
                "Profile empty state login description",
              ),
            )}
            cta={{
              label: String(
                fbs("Log in", "Profile empty state login call to action"),
              ),
              onPress: async () => {
                const result = await promptAsync();
                if (
                  (result.type === "error" || result.type === "success") &&
                  result.params.access_token
                ) {
                  await SecureStore.setItemAsync(
                    ANILIST_ACCESS_TOKEN_STORAGE,
                    result.params.access_token,
                  );
                  primeAccessToken(result.params.access_token);
                  setAccessToken(result.params.access_token);
                }
              },
            }}
          />
        ) : loading && !data?.Viewer ? (
          <ProfileSkeleton />
        ) : data?.Viewer ? (
          <UserProfileContent user={data.Viewer} />
        ) : error ? (
          <EmptyState
            title={String(fbs("Could not load profile", "Profile error title"))}
            description={error.message}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: darkTheme.background, flex: 1 },
  content: { flexGrow: 1, padding: 16 },
  settingsIcon: { height: 24, tintColor: white, width: 24 },
});
