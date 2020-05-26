import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect } from "react";
import { AsyncStorage } from "react-native";

import { AuthButton } from "yep/components/AuthButton";
import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";
import { useAniListAuthRequest } from "yep/hooks/auth";
import { RootStackParamList } from "yep/navigation";
import { getString } from "yep/strings";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";

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
  });

  return (
    <Container showsVerticalScrollIndicator={false}>
      <BrandingGroup>
        <Logo source={require("yep/assets/launch/logo-wrapped-dark.png")} />
        <BrandingSpacer />
        <Tagline>{getString("tagline")}</Tagline>
      </BrandingGroup>
      <ButtonGroup>
        <AuthButton
          label={getString("logIn")}
          onPress={async () => {
            const result = await promptAsync();
            console.log({ result });
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
        <ButtonSpacer />
        <AuthButton label={getString("signUp")} onPress={() => {}} />
        <AniListFootnote>{getString("AniListAuthAttribution")}</AniListFootnote>
      </ButtonGroup>
    </Container>
  );
}

const Container = takimoto.ScrollView(
  {
    flex: 1,
    padding: 16,
    paddingTop: 88,
  },
  {
    justifyContent: "space-between",
    alignItems: "center",
  }
);

const Logo = takimoto.Image({
  width: 256,
  height: 159.24,
});

const ButtonGroup = takimoto.View({ width: "100%" });

const ButtonSpacer = takimoto.View({ height: 8 });

const BrandingSpacer = takimoto.View({ height: 16 });

const Tagline = takimoto.Text({
  fontFamily: "Manrope-Regular",
  fontSize: 16,
  color: darkTheme.text,
  textAlign: "center",
  maxWidth: 300,
});

const BrandingGroup = takimoto.View({ alignItems: "center" });

const AniListFootnote = takimoto.Text({
  fontFamily: "Manrope-Regular",
  fontSize: 12.8,
  color: darkTheme.footnote,
  textAlign: "center",
  marginTop: 8,
});
