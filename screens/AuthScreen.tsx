import React, { useCallback, useState, useEffect } from "react";
import { dark } from "yep/themes";
import { takimoto } from "yep/lib/takimoto";
import {
  makeRedirectUri,
  ResponseType,
  AuthRequest,
  AuthRequestPromptOptions,
  AuthSessionResult,
  AuthRequestConfig,
} from "expo-auth-session";
import { AsyncStorage } from "react-native";
import { RootStackParamList } from "yep/App";
import { StackNavigationProp } from "@react-navigation/stack";
import Constants from "expo-constants";

export const ANILIST_ACCESS_TOKEN_STORAGE = `com.goodweebs.app.access_token`;

const redirectUri = makeRedirectUri({
  native: "goodweebs://redirect",
  useProxy: Constants.isDevice,
});

console.log({ redirectUri });

const Container = takimoto.ScrollView({
  flex: 1,
  padding: 16,
  paddingTop: 88,
});

const Logo = takimoto.Image({
  width: 256,
  height: 159.24,
});

const ButtonGroup = takimoto.View({ width: "100%" });

const ButtonSpacer = takimoto.View({ height: 8 });

const BrandingSpacer = takimoto.View({ height: 16 });

const ButtonTouchable = takimoto.TouchableOpacity({
  backgroundColor: dark.primaryButton,
  padding: 16,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
});

const ButtonLabel = takimoto.Text({
  fontFamily: "Manrope-SemiBold",
  fontSize: 16,
  color: dark.text,
  textAlign: "center",
});

const Tagline = takimoto.Text({
  fontFamily: "Manrope-Regular",
  fontSize: 16,
  color: dark.text,
  textAlign: "center",
  maxWidth: 300,
});

const BrandingGroup = takimoto.View({ alignItems: "center" });

const AniListFootnote = takimoto.Text({
  fontFamily: "Manrope-Regular",
  fontSize: 12.8,
  color: dark.footnote,
  textAlign: "center",
  marginTop: 8,
});

type ButtonProps = {
  label: string;
  onPress: () => void;
};

function Button({ onPress, label }: ButtonProps) {
  return (
    <ButtonTouchable onPress={onPress}>
      <ButtonLabel>{label}</ButtonLabel>
    </ButtonTouchable>
  );
}

export function useAuthRequest(
  config: AuthRequestConfig,
  AniListURL: string
): [
  AuthRequest | null,
  AuthSessionResult | null,
  (options?: AuthRequestPromptOptions) => Promise<AuthSessionResult>
] {
  const [request, setRequest] = useState<AuthRequest | null>(null);
  const [result, setResult] = useState<AuthSessionResult | null>(null);

  const promptAsync = useCallback(
    async (options: AuthRequestPromptOptions = {}) => {
      if (!AniListURL || !request) {
        throw new Error(
          "Cannot prompt to authenticate until the request has finished loading."
        );
      }
      const result = await request?.promptAsync(
        { authorizationEndpoint: AniListURL },
        options
      );
      setResult(result);
      return result;
    },
    [request?.url, AniListURL]
  );

  useEffect(() => {
    if (config && AniListURL) {
      const request = new AuthRequest(config);
      request.url = AniListURL;
      setRequest(request);
    }
  }, [AniListURL]);

  return [request, result, promptAsync];
}

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
};

export function AuthScreen({ navigation }: Props) {
  const clientID = 3549;
  const [request, response, promptAsync] = useAuthRequest(
    // @ts-ignore anilist stores redirecturl
    {
      usePKCE: false,
      redirectUri,
      scopes: [],
    },
    // @ts-ignore cmonBruh
    `https://anilist.co/api/v2/oauth/authorize?client_id=${clientID}&response_type=token`
  );

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
    <Container
      contentContainerStyle={{
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <BrandingGroup>
        <Logo source={require("yep/assets/launch/logo-wrapped-dark.png")} />
        <BrandingSpacer />
        <Tagline>An anime tracking app powered by AniList and Expo.</Tagline>
      </BrandingGroup>
      <Tagline>request {JSON.stringify(request)}</Tagline>
      <Tagline>response {JSON.stringify(response)}</Tagline>
      <ButtonGroup>
        <Button
          label="Log in"
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
        <ButtonSpacer />
        <Button label="Sign up" onPress={() => {}} />
        <AniListFootnote>via AniList</AniListFootnote>
      </ButtonGroup>
    </Container>
  );
}
