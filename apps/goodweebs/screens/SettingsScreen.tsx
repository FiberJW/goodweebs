import { useApolloClient } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { Alert, View, ScrollView, StyleSheet, Text } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { black } from "yep/colors";
import { Button } from "yep/components/Button";
import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";
import { StorageKeys, usePersistedState } from "yep/hooks/helpers";
import { RootStackParamList, TabParamList } from "yep/navigation";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { useAccessToken } from "yep/useAccessToken";

type Props = {
  navigation: StackNavigationProp<RootStackParamList & TabParamList>;
};

export function SettingsScreen({ navigation }: Props) {
  // TODO: move to user preferences/settings that persist across installations
  const [hideScores, setHideScores] = usePersistedState<boolean>(
    StorageKeys.HIDE_SCORES_GLOBAL
  );
  const [shouldPersistScoreVisibility, setShouldPersistScoreVisibility] =
    usePersistedState<boolean>(StorageKeys.SHOULD_PERSIST_SCORE_VISIBILITY);

  const client = useApolloClient();
  const { setAccessToken } = useAccessToken();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View>
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
                disableBuiltInState
                isChecked={hideScores}
                size={24}
                fillColor={darkTheme.button}
                unfillColor="black"
                text="Hide scores by default"
                innerIconStyle={{ borderWidth: 2, backgroundColor: black }}
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
                disableBuiltInState
                isChecked={shouldPersistScoreVisibility}
                size={24}
                fillColor={darkTheme.button}
                unfillColor="black"
                text="Should persist score visibility per anime"
                innerIconStyle={{ borderWidth: 2, backgroundColor: black }}
                textStyle={{
                  color: darkTheme.subText,
                  fontFamily: Manrope.regular,
                  textDecorationLine: "none",
                  fontSize: 16,
                }}
                onPress={() => {
                  setShouldPersistScoreVisibility(
                    !shouldPersistScoreVisibility
                  );
                }}
              />
            </View>
          </View>
        </View>

        <Button
          label="Log out"
          onPress={async () => {
            Alert.alert("Are you sure that you want to log out?", undefined, [
              { style: "cancel", text: "Cancel" },
              {
                text: "Log out",
                style: "destructive",
                onPress: async () => {
                  await AsyncStorage.removeItem(ANILIST_ACCESS_TOKEN_STORAGE);
                  setAccessToken(undefined);
                  navigation.navigate("Anime");
                  await client.resetStore();
                },
              },
            ]);
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    gap: 16,
    justifyContent: "space-between",
    padding: 16,
  },
  screen: {
    flex: 1,
  },
});
