import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from "@apollo/client";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import * as Sentry from "@sentry/react-native";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";

import { createClient } from "yep/graphql/client";
import { Navigation } from "yep/navigation";
import { useManrope } from "yep/typefaces";

import { AccessTokenProvider, useAccessToken } from "./useAccessToken";

enableScreens();

Sentry.init({
  dsn: "https://b2756b0df548451d98707d024aff00d1@o58038.ingest.sentry.io/5248224",
  debug: __DEV__, // If `tru`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

SplashScreen.preventAutoHideAsync();

// TODO: implement better error handling + user-facing notifications

export default function App() {
  return (
    <AccessTokenProvider>
      <InnerApp />
    </AccessTokenProvider>
  );
}

function InnerApp() {
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
        <ActionSheetProvider>
          <Navigation accessToken={accessToken} />
        </ActionSheetProvider>
      </ApolloProvider>
    </GestureHandlerRootView>
  );
}
