import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import LogRocket from "@logrocket/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import React, { useEffect } from "react";
import { RootSiblingParent } from "react-native-root-siblings";
import { enableScreens } from "react-native-screens";

import { createClient } from "yep/graphql/client";
import { useManrope } from "yep/typefaces";

import { StorageKeys } from "./hooks/helpers";
import { AccessTokenProvider, useAccessToken } from "./useAccessToken";

enableScreens();

SplashScreen.preventAutoHideAsync();

// TODO: implement better error handling + user-facing notifications

export default function App() {
  return (
    <RootSiblingParent>
      <AccessTokenProvider>
        <InnerApp />
      </AccessTokenProvider>
    </RootSiblingParent>
  );
}

function InnerApp() {
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
          debug: __DEV__, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
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

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return null;
}
