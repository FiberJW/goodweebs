import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from "@apollo/client";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import LogRocket from "@logrocket/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import React, { useCallback, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import { enableScreens } from "react-native-screens";

import { createClient } from "yep/graphql/client";
import { darkTheme } from "yep/themes";
import { Manrope, useManrope } from "yep/typefaces";

import { StorageKeys } from "../hooks/helpers";
import { AccessTokenProvider, useAccessToken } from "../useAccessToken";

enableScreens();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <RootSiblingParent>
      <AccessTokenProvider>
        <InnerLayout />
      </AccessTokenProvider>
    </RootSiblingParent>
  );
}

function InnerLayout() {
  const { checkedForToken } = useAccessToken();
  const fontsLoaded = useManrope();

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

  const appIsReady = fontsLoaded && checkedForToken && !!client;

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
                title: "Settings",
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
