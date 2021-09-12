import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "yep/components/Button";
import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";
import { useAniListAuthRequest } from "yep/hooks/auth";
import { RootStackParamList } from "yep/navigation";
import { getString } from "yep/strings";
import { takimoto } from "yep/takimoto";
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
      <OuterContainer>
        <InnerContainer
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
        >
          <BrandingGroup>
            <Logo source={require("yep/assets/launch/logo-wrapped-dark.png")} />
            <BrandingSpacer />
            <Tagline>{getString("tagline")}</Tagline>
          </BrandingGroup>
          <ButtonGroup>
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
            <AniListFootnote>
              {getString("AniListAuthAttribution")}
            </AniListFootnote>
          </ButtonGroup>
        </InnerContainer>
      </OuterContainer>
    </SafeAreaView>
  );
}

const InnerContainer = takimoto.ScrollView(
  {
    paddingTop: 88,
  },
  {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  }
);

const OuterContainer = takimoto.View({
  flex: 1,
  padding: 16,
});

const Logo = takimoto.Image({
  width: 256,
  height: 159.24,
});

const ButtonGroup = takimoto.View({
  width: "100%",
});

const BrandingSpacer = takimoto.View({ height: 16 });

const Tagline = takimoto.Text({
  fontFamily: Manrope.regular,
  fontSize: 16,
  color: darkTheme.text,
  textAlign: "center",
  maxWidth: 300,
});

const BrandingGroup = takimoto.View({ alignItems: "center" });

const AniListFootnote = takimoto.Text({
  fontFamily: Manrope.regular,
  fontSize: 12.8,
  color: darkTheme.footnote,
  textAlign: "center",
  marginTop: 8,
});
