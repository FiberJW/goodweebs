import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { fbs } from "fbtee";
import React from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { aniListBlue } from "yep/colors";
import { Button } from "yep/components/Button";
import { useAniListLogin } from "yep/hooks/auth";
import { continueAsGuest } from "yep/session";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

export default function AuthScreen() {
  const login = useAniListLogin();
  const router = useRouter();

  // No "navigate if a token already exists" effect: the Stack.Protected guard
  // in the root layout owns that — setting the token below flips the guard and
  // React Navigation swaps this screen out for the tabs automatically.

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: darkTheme.background }}>
      <View style={styles.outerContainer}>
        <ScrollView
          style={styles.innerContainer}
          contentContainerStyle={{
            flexGrow: 1,
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
              {String(
                fbs(
                  "An anime tracking app powered by AniList and Expo.",
                  "Auth screen tagline",
                ),
              )}
            </Text>
          </View>
          <View style={styles.buttonGroup}>
            <Button
              color={aniListBlue}
              label={String(
                fbs("Log in with AniList", "Auth screen login button label"),
              )}
              onPress={login}
            />

            <Button
              label={String(
                fbs(
                  "Continue without logging in",
                  "Auth screen continue without login button label",
                ),
              )}
              onPress={async () => {
                Alert.alert(
                  "",
                  String(
                    fbs(
                      "Without an account, you will not be able to keep track of anime or manga, but you can still browse through Discover to explore new series. You can log in or register at any time to begin tracking series to your lists.",
                      "Auth screen continue without login warning",
                    ),
                  ),
                  [
                    {
                      text: String(
                        fbs("Cancel", "Auth screen continue warning cancel"),
                      ),
                    },
                    {
                      onPress: () => {
                        // Opens the tabs via the guard, then lands on Discover
                        // (guests browse there) rather than the anime anchor.
                        continueAsGuest();
                        router.replace("/(tabs)/discover");
                      },
                      text: String(
                        fbs(
                          "OK",
                          "Auth screen continue warning confirm button",
                        ),
                      ),
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
