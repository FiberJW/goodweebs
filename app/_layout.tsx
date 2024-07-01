import {
  ApolloProvider,
  ApolloClient,
  NormalizedCacheObject,
} from "@apollo/client";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";

import { createClient } from "yep/graphql/client";
import { AccessTokenProvider, useAccessToken } from "yep/hooks/useAccessToken";
import { darkTheme } from "yep/themes";
import { Manrope, useManrope } from "yep/typefaces";

enableScreens();

SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: "https://b2756b0df548451d98707d024aff00d1@o58038.ingest.sentry.io/5248224",
  debug: __DEV__, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  enabled: !__DEV__,
});

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: "(tabs)",
};

function InnerRoot() {
  const { checkedForToken, accessToken } = useAccessToken();
  const fontsLoaded = useManrope();

  const [client, setClient] =
    React.useState<ApolloClient<NormalizedCacheObject> | null>(null);

  useEffect(function createClientWithPersistedCache() {
    (async () => {
      const client = await createClient();
      setClient(client);
    })();
  }, []);

  const appIsReady = fontsLoaded && checkedForToken && !!client;

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ApolloProvider client={client}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={darkTheme.navBackground}
        />
        <ActionSheetProvider>
          <Stack
            initialRouteName={accessToken ? "(tabs)/anime" : "auth"}
            screenOptions={{
              title: "",
              headerTitleStyle: {
                fontFamily: Manrope.semiBold,
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{}} />
            <Stack.Screen name="auth" options={{}} />
            <Stack.Screen name="character/[id]" options={{}} />
            <Stack.Screen name="details/[id]" options={{}} />
            {/* <Stack.Screen name="index" options={{}} /> */}
            <Stack.Screen name="settings" options={{}} />
          </Stack>
        </ActionSheetProvider>
      </ApolloProvider>
    </GestureHandlerRootView>
  );
}

export default function Root() {
  return (
    <AccessTokenProvider>
      <InnerRoot />
    </AccessTokenProvider>
  );
}
