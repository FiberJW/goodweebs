import { useApolloClient } from "@apollo/client";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { fbs } from "fbtee";
import React from "react";
import {
  Alert,
  View,
  ScrollView,
  StyleSheet,
  Text,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "yep/components/Button";
import { CheckboxRow } from "yep/components/CheckboxRow";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";
import { StorageKeys, usePersistedState } from "yep/hooks/helpers";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { useAccessToken } from "yep/useAccessToken";

export default function Settings() {
  const [hideScores, setHideScores] = usePersistedState<boolean>(
    StorageKeys.HIDE_SCORES_GLOBAL,
  );
  const [optOutCrashReporting, setOptOutCrashReporting] =
    usePersistedState<boolean>(StorageKeys.OPT_OUT_CRASH_REPORTING);
  const [optOutAnalytics, setOptOutAnalytics] = usePersistedState<boolean>(
    StorageKeys.OPT_OUT_ANALYTICS,
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
            {String(fbs("Display settings", "Display settings section title"))}
          </Text>
          <View style={styles.checkboxGroup}>
            <CheckboxRow
              label={String(
                fbs("Hide scores by default", "Hide scores setting label"),
              )}
              value={hideScores}
              onValueChange={setHideScores}
            />
            <CheckboxRow
              label={String(
                fbs(
                  "Should persist score visibility per anime",
                  "Persist score visibility setting label",
                ),
              )}
              value={shouldPersistScoreVisibility}
              onValueChange={setShouldPersistScoreVisibility}
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
            {String(fbs("Privacy settings", "Privacy settings section title"))}
          </Text>
          <View style={styles.checkboxGroup}>
            <CheckboxRow
              label={String(
                fbs(
                  "Opt-out of crash reporting",
                  "Crash reporting opt-out setting label",
                ),
              )}
              value={optOutCrashReporting}
              onValueChange={setOptOutCrashReporting}
            />
            <CheckboxRow
              label={String(
                fbs(
                  "Opt-out of session analytics",
                  "Session analytics opt-out setting label",
                ),
              )}
              value={optOutAnalytics}
              onValueChange={setOptOutAnalytics}
            />
          </View>
        </View>
      </View>
      <View style={{ gap: 16, alignItems: "stretch" }}>
        <PressableOpacity
          style={{ alignSelf: "center" }}
          onPress={() => {
            Linking.openURL(
              "https://fiberjw.notion.site/Privacy-Policy-for-Goodweebs-1f70379bbe828028b5eed7413e8184e5?pvs=4",
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
            {String(fbs("Privacy policy", "Privacy policy link label"))}
          </Text>
        </PressableOpacity>
        {accessToken ? (
          <Button
            label={String(fbs("Log out", "Log out button label"))}
            onPress={async () => {
              Alert.alert(
                String(
                  fbs(
                    "Are you sure that you want to log out?",
                    "Log out confirmation message",
                  ),
                ),
                undefined,
                [
                  {
                    style: "cancel",
                    text: String(fbs("Cancel", "Cancel button label")),
                  },
                  {
                    text: String(
                      fbs("Log out", "Log out confirmation button label"),
                    ),
                    style: "destructive",
                    onPress: async () => {
                      await SecureStore.deleteItemAsync(
                        ANILIST_ACCESS_TOKEN_STORAGE,
                      );
                      setAccessToken(undefined);
                      router.replace("/auth");
                      await client.resetStore();
                    },
                  },
                ],
              );
            }}
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  checkboxGroup: {
    flexDirection: "column",
    gap: 16,
  },
  contentContainer: {
    flex: 1,
    gap: 16,
    justifyContent: "space-between",
    padding: 16,
  },
});
