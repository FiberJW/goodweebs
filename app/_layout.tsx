import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from "@apollo/client";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import LogRocket from "@logrocket/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { fbs } from "fbtee";
import React, { useCallback, useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import { enableScreens } from "react-native-screens";
import { vexo } from "vexo-analytics";

import { createClient } from "yep/graphql/client";
import { LocaleProvider } from "yep/i18n/LocaleContext";
import { darkTheme } from "yep/themes";
import { LINESeedJP, Manrope } from "yep/typefaces";

import { StorageKeys } from "../hooks/helpers";
import { AccessTokenProvider, useAccessToken } from "../useAccessToken";

if (Platform.OS !== "web") {
  vexo("e6f94c3b-f7d3-4edd-b48c-baad9bfd42b5");
  enableScreens();
  SplashScreen.preventAutoHideAsync();
}

function WebLayout() {
  useFonts({
    [Manrope.bold]: require("yep/assets/fonts/manrope/Manrope-Bold.otf"),
    [Manrope.extraBold]: require("yep/assets/fonts/manrope/Manrope-ExtraBold.otf"),
    [Manrope.extraLight]: require("yep/assets/fonts/manrope/Manrope-ExtraLight.otf"),
    [Manrope.light]: require("yep/assets/fonts/manrope/Manrope-Light.otf"),
    [Manrope.medium]: require("yep/assets/fonts/manrope/Manrope-Medium.otf"),
    [Manrope.regular]: require("yep/assets/fonts/manrope/Manrope-Regular.otf"),
    [Manrope.semiBold]: require("yep/assets/fonts/manrope/Manrope-SemiBold.otf"),
    [LINESeedJP.regular]: require("yep/assets/fonts/LINESeedJP/LINESeedJP_OTF_Rg.otf"),
    [LINESeedJP.extraBold]: require("yep/assets/fonts/LINESeedJP/LINESeedJP_OTF_Eb.otf"),
    [LINESeedJP.bold]: require("yep/assets/fonts/LINESeedJP/LINESeedJP_OTF_Bd.otf"),
    [LINESeedJP.thin]: require("yep/assets/fonts/LINESeedJP/LINESeedJP_OTF_Th.otf"),
  });

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  if (Platform.OS === "web") {
    return (
      <LocaleProvider>
        <WebLayout />
      </LocaleProvider>
    );
  }

  return (
    <LocaleProvider>
      <RootSiblingParent>
        <AccessTokenProvider>
          <InnerLayout />
        </AccessTokenProvider>
      </RootSiblingParent>
    </LocaleProvider>
  );
}

function InnerLayout() {
  const { checkedForToken } = useAccessToken();

  const [client, setClient] =
    React.useState<ApolloClient<NormalizedCacheObject> | null>(null);

  useEffect(function createClientWithPersistedCache() {
    (async () => {
      const client = await createClient();
      setClient(client);
    })();
  }, []);

  useEffect(function initializeAnalytics() {
    (async () => {
      const sentryOptOut = await AsyncStorage.getItem(
        StorageKeys.OPT_OUT_CRASH_REPORTING
      );

      if (!(sentryOptOut && JSON.parse(sentryOptOut) === true)) {
        Sentry.init({
          dsn: "https://b2756b0df548451d98707d024aff00d1@o58038.ingest.sentry.io/5248224",
          debug: __DEV__,
          enabled: !__DEV__,
        });
      }

      const logRocketOptOut = await AsyncStorage.getItem(
        StorageKeys.OPT_OUT_ANALYTICS
      );

      if (!(logRocketOptOut && JSON.parse(logRocketOptOut) === true)) {
        LogRocket.init("iltgzt/goodweebs", {
          updateId: Updates.isEmbeddedLaunch ? null : Updates.updateId,
          expoChannel: Updates.channel,
        });
      }
    })();
  }, []);

  const appIsReady = checkedForToken && !!client;

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar barStyle="light-content" />
      <ApolloProvider client={client}>
        <ActionSheetProvider>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: darkTheme.navBackground,
              },
              headerTintColor: darkTheme.text,
              headerTitleStyle: {
                fontFamily: Manrope.semiBold,
              },
              contentStyle: {
                backgroundColor: darkTheme.background,
              },
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="settings"
              options={{
                title: String(fbs("Settings", "Settings screen title")),
                headerTitleStyle: {
                  fontFamily: Manrope.semiBold,
                  fontSize: 16,
                  color: darkTheme.text,
                },
                headerBackButtonDisplayMode: "minimal",
              }}
            />
            <Stack.Screen
              name="details/[id]"
              options={{
                title: "",
                headerTitleStyle: {
                  fontFamily: Manrope.semiBold,
                  fontSize: 16,
                  color: darkTheme.text,
                },
                headerBackButtonDisplayMode: "minimal",
              }}
            />
            <Stack.Screen
              name="character/[id]"
              options={{
                title: "",
                headerTitleStyle: {
                  fontFamily: Manrope.semiBold,
                  fontSize: 16,
                  color: darkTheme.text,
                },
                headerBackButtonDisplayMode: "minimal",
              }}
            />
          </Stack>
        </ActionSheetProvider>
      </ApolloProvider>
    </GestureHandlerRootView>
  );
}
