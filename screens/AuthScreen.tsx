import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "yep/components/Button";
import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";
import { useAniListAuthRequest } from "yep/hooks/auth";
import { RootStackParamList } from "yep/navigation";
import { getString } from "yep/strings";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
};

export function AuthScreen({ navigation }: Props) {
  const [, , promptAsync] = useAniListAuthRequest();

  useEffect(function navigateIfAccessTokenExists() {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(ANILIST_ACCESS_TOKEN_STORAGE);

        if (token) {
          navigation.replace("Tabs");
        }
      } catch (_) {}
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
              label={getString("logIn")}
              onPress={async () => {
                const result = await promptAsync();

                if (result.type === "error" || result.type === "success") {
                  if (result.params.access_token) {
                    await AsyncStorage.setItem(
                      ANILIST_ACCESS_TOKEN_STORAGE,
                      result.params.access_token
                    );
                    navigation.replace("Tabs");
                  }
                }
              }}
            />
            <Text style={styles.aniListFootnote}>
              {getString("AniListAuthAttribution")}
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  aniListFootnote: {
    color: darkTheme.footnote,
    fontFamily: Manrope.regular,
    fontSize: 12.8,
    marginTop: 8,
    textAlign: "center",
  },
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
