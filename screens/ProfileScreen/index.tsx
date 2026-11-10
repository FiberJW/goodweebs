import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { fbs } from "fbtee";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { white } from "yep/colors";
import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { useViewer } from "yep/graphql/viewer";
import { ProfileSkeleton } from "yep/screens/ProfileScreen/ProfileSkeleton";
import {
  UserProfile,
  useUserProfile,
} from "yep/screens/ProfileScreen/UserProfile";
import { logInWithAniList, useAccessToken } from "yep/session";
import { darkTheme } from "yep/themes";

export default function Profile() {
  const router = useRouter();
  const { accessToken } = useAccessToken();
  const { viewer, error, refetch: refetchViewer } = useViewer();
  const profile = useUserProfile(viewer?.id);

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
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
      {!accessToken ? (
        <View style={styles.content}>
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
              onPress: logInWithAniList,
            }}
          />
        </View>
      ) : viewer ? (
        <UserProfile
          profile={{
            ...profile,
            refetch: (variables) => {
              void refetchViewer().catch(() => {});
              return profile.refetch(variables);
            },
          }}
        />
      ) : error ? (
        <View style={styles.content}>
          <EmptyState
            title={String(fbs("Could not load profile", "Profile error title"))}
            description={error.message}
          />
        </View>
      ) : (
        <View style={styles.content}>
          <ProfileSkeleton />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: darkTheme.navBackground, flex: 1 },
  content: { backgroundColor: darkTheme.background, flexGrow: 1, padding: 16 },
  settingsIcon: { height: 24, tintColor: white, width: 24 },
});
