import { ApolloProvider } from "@apollo/client";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import AppLoading from "expo-app-loading";
import React from "react";
import { enableScreens } from "react-native-screens";
import * as Sentry from "sentry-expo";

import { client } from "yep/graphql/client";
import { Navigation } from "yep/navigation";
import { useManrope } from "yep/typefaces";

import { AccessTokenProvider, useAccessToken } from "./useAccessToken";

enableScreens();

Sentry.init({
  dsn: "https://b2756b0df548451d98707d024aff00d1@o58038.ingest.sentry.io/5248224",
  enableInExpoDevelopment: true,
  debug: __DEV__, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

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

  return fontsLoaded && checkedForToken ? (
    <ApolloProvider client={client}>
      <ActionSheetProvider>
        <Navigation accessToken={accessToken} />
      </ActionSheetProvider>
    </ApolloProvider>
  ) : (
    <AppLoading />
  );
}
