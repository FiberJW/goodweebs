import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { aniListBlue } from "yep/colors";
import { Button } from "yep/components/Button";
import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";
import { useAniListAuthRequest } from "yep/hooks/auth";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { useAccessToken } from "yep/useAccessToken";

export default function AuthScreen() {
  const [, , promptAsync] = useAniListAuthRequest();
  const { setAccessToken } = useAccessToken();
  const router = useRouter();

  useEffect(
    function navigateIfAccessTokenExists() {
      (async () => {
        try {
          const token = await SecureStore.getItemAsync(
            ANILIST_ACCESS_TOKEN_STORAGE
          );

          if (token) {
            router.replace("/(tabs)/anime");
          }
        } catch {}
      })();
    },
    [router]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: darkTheme.background }}>
      <View style={styles.outerContainer}>
        <ScrollView
          style={styles.innerContainer}
          contentContainerStyle={{
            flex: 1,
            justifyContent: "space-between",
            alignItems: "center",
          }}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandingGroup}>
            <Image
              style={styles.logo}
              source={require("yep/assets/launch/logo-wrapped-dark.png")}
            />
            <Text style={styles.tagline}>
              An anime tracking app powered by AniList and Expo.
            </Text>
          </View>
          <View style={styles.buttonGroup}>
            <Button
              color={aniListBlue}
              label="Log in with AniList"
              onPress={async () => {
                const result = await promptAsync();

                if (result.type === "error" || result.type === "success") {
                  if (result.params.access_token) {
                    setAccessToken(result.params.access_token);
                    await SecureStore.setItemAsync(
                      ANILIST_ACCESS_TOKEN_STORAGE,
                      result.params.access_token
                    );
                    router.replace("/(tabs)/anime");
                  }
                }
              }}
            />

            <Button
              label="Continue without logging in"
              onPress={async () => {
                Alert.alert(
                  "",
                  "Without an account, you will not be able to keep track of anime or manga, but you can still browse through Discover to explore new series. You can log in or register at any time to begin tracking series to your lists.",
                  [
                    { text: "Cancel" },
                    {
                      onPress: () => router.replace("/(tabs)/discover"),
                      text: "OK",
                    },
                  ]
                );
              }}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brandingGroup: { alignItems: "center", gap: 16 },
  buttonGroup: {
    gap: 16,
    width: "100%",
  },
  innerContainer: {
    paddingTop: 88,
  },
  logo: {
    height: 159.24,
    width: 256,
  },
  outerContainer: {
    flex: 1,
    padding: 16,
  },
  tagline: {
    color: darkTheme.text,
    fontFamily: Manrope.regular,
    fontSize: 16,
    maxWidth: 300,
    textAlign: "center",
  },
});
