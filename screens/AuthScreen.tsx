import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { aniListBlue } from "yep/colors";
import { Button } from "yep/components/Button";
import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";
import { useAniListAuthRequest } from "yep/hooks/auth";
import { RootStackParamList } from "yep/navigation";
import { getString } from "yep/strings";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { useAccessToken } from "yep/useAccessToken";

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
};

export function AuthScreen({ navigation }: Props) {
  const [, , promptAsync] = useAniListAuthRequest();
  const { setAccessToken } = useAccessToken();

  useEffect(function navigateIfAccessTokenExists() {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(ANILIST_ACCESS_TOKEN_STORAGE);

        if (token) {
          navigation.replace("Tabs");
        }
      } catch {}
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
            <View style={styles.brandingSpacer} />
            <Text style={styles.tagline}>{getString("tagline")}</Text>
          </View>
          <View style={styles.buttonGroup}>
            <Button
              color={aniListBlue}
              label="Log In With AniList!!"
              onPress={async () => {
                const result = await promptAsync();

                if (result.type === "error" || result.type === "success") {
                  if (result.params.access_token) {
                    setAccessToken(result.params.access_token);
                    await AsyncStorage.setItem(
                      ANILIST_ACCESS_TOKEN_STORAGE,
                      result.params.access_token
                    );
                    navigation.replace("Tabs");
                  }
                }
              }}
            />

            <Button
              containerStyle={{ marginTop: 16 }}
              label="Continue Without Logging In"
              onPress={async () => {
                Alert.alert(
                  "",
                  "Without an account, you will not be able to keep track of anime or manga, but you can still browse through Discover to explore new series. You can log in or register at any time to begin tracking series to your lists.",
                  [
                    { text: "Cancel" },
                    { onPress: () => navigation.replace("Tabs"), text: "OK" },
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
  brandingGroup: { alignItems: "center" },
  brandingSpacer: { height: 16 },
  buttonGroup: {
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
