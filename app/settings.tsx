import { useApolloClient } from "@apollo/client";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React from "react";
import {
  Alert,
  View,
  ScrollView,
  StyleSheet,
  Text,
  Linking,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { black } from "yep/colors";
import { Button } from "yep/components/Button";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";
import { StorageKeys, usePersistedState } from "yep/hooks/helpers";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { useAccessToken } from "yep/useAccessToken";

export default function Settings() {
  const [hideScores, setHideScores] = usePersistedState<boolean>(
    StorageKeys.HIDE_SCORES_GLOBAL
  );
  const [optOutCrashReporting, setOptOutCrashReporting] =
    usePersistedState<boolean>(StorageKeys.OPT_OUT_CRASH_REPORTING);
  const [optOutAnalytics, setOptOutAnalytics] = usePersistedState<boolean>(
    StorageKeys.OPT_OUT_ANALYTICS
  );
  const [shouldPersistScoreVisibility, setShouldPersistScoreVisibility] =
    usePersistedState<boolean>(StorageKeys.SHOULD_PERSIST_SCORE_VISIBILITY);

  const client = useApolloClient();
  const { setAccessToken, accessToken } = useAccessToken();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + 16 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: "column" }}>
          <Text
            style={{
              color: darkTheme.subHeader,
              fontFamily: Manrope.semiBold,
              fontSize: 20,
              marginBottom: 24,
            }}
          >
            Display settings
          </Text>
          <View style={{ flexDirection: "column", gap: 16 }}>
            <BouncyCheckbox
              useBuiltInState={false}
              isChecked={hideScores}
              size={24}
              fillColor={darkTheme.button}
              unFillColor="black"
              text="Hide scores by default"
              innerIconStyle={{
                borderWidth: StyleSheet.hairlineWidth,
                backgroundColor: black,
              }}
              textStyle={{
                color: darkTheme.subText,
                fontFamily: Manrope.regular,
                textDecorationLine: "none",
                fontSize: 16,
              }}
              onPress={() => {
                setHideScores(!hideScores);
              }}
            />
            <BouncyCheckbox
              useBuiltInState={false}
              isChecked={shouldPersistScoreVisibility}
              size={24}
              fillColor={darkTheme.button}
              unFillColor="black"
              text="Should persist score visibility per anime"
              innerIconStyle={{
                borderWidth: StyleSheet.hairlineWidth,
                backgroundColor: black,
              }}
              textStyle={{
                color: darkTheme.subText,
                fontFamily: Manrope.regular,
                textDecorationLine: "none",
                fontSize: 16,
              }}
              onPress={() => {
                setShouldPersistScoreVisibility(!shouldPersistScoreVisibility);
              }}
            />
          </View>
        </View>
        <View style={{ flexDirection: "column" }}>
          <Text
            style={{
              color: darkTheme.subHeader,
              fontFamily: Manrope.semiBold,
              fontSize: 20,
              marginBottom: 24,
            }}
          >
            Privacy settings
          </Text>
          <View style={{ flexDirection: "column", gap: 16 }}>
            <BouncyCheckbox
              useBuiltInState={false}
              isChecked={optOutCrashReporting}
              size={24}
              fillColor={darkTheme.button}
              unFillColor="black"
              text="Opt-out of crash reporting"
              innerIconStyle={{
                borderWidth: StyleSheet.hairlineWidth,
                backgroundColor: black,
              }}
              textStyle={{
                color: darkTheme.subText,
                fontFamily: Manrope.regular,
                textDecorationLine: "none",
                fontSize: 16,
              }}
              onPress={() => {
                setOptOutCrashReporting(!optOutCrashReporting);
              }}
            />
            <BouncyCheckbox
              useBuiltInState={false}
              isChecked={optOutAnalytics}
              size={24}
              fillColor={darkTheme.button}
              unFillColor="black"
              text="Opt-out of session analytics"
              innerIconStyle={{
                borderWidth: StyleSheet.hairlineWidth,
                backgroundColor: black,
              }}
              textStyle={{
                color: darkTheme.subText,
                fontFamily: Manrope.regular,
                textDecorationLine: "none",
                fontSize: 16,
              }}
              onPress={() => {
                setOptOutAnalytics(!optOutAnalytics);
              }}
            />
          </View>
        </View>
      </View>
      <View style={{ gap: 16, alignItems: "stretch" }}>
        <PressableOpacity
          style={{ alignSelf: "center" }}
          onPress={() => {
            Linking.openURL(
              "https://fiberjw.notion.site/Privacy-Policy-for-Goodweebs-1f70379bbe828028b5eed7413e8184e5?pvs=4"
            );
          }}
        >
          <Text
            style={{
              color: darkTheme.subText,
              fontFamily: Manrope.semiBold,
              fontSize: 16,
            }}
          >
            Privacy Policy
          </Text>
        </PressableOpacity>
        {accessToken && (
          <Button
            label="Log out"
            onPress={async () => {
              Alert.alert("Are you sure that you want to log out?", undefined, [
                { style: "cancel", text: "Cancel" },
                {
                  text: "Log out",
                  style: "destructive",
                  onPress: async () => {
                    await SecureStore.deleteItemAsync(
                      ANILIST_ACCESS_TOKEN_STORAGE
                    );
                    setAccessToken(undefined);
                    router.replace("/auth");
                    await client.resetStore();
                  },
                },
              ]);
            }}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    gap: 16,
    justifyContent: "space-between",
    padding: 16,
  },
});
