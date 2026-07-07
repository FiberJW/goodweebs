import "expo-sqlite/localStorage/install";

import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from "@apollo/client";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import LogRocket from "@logrocket/react-native";
import * as Sentry from "@sentry/react-native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { fbs } from "fbtee";
import React, { useEffect } from "react";
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

// localStorage is synchronous here thanks to the expo-sqlite polyfill above.
function optedOut(key: StorageKeys) {
  const value = localStorage.getItem(key);
  return Boolean(value && JSON.parse(value) === true);
}

if (Platform.OS !== "web") {
  // Production only, per vexo's docs — and empirically: vexo 1.5.7's native
  // session-replay ScreenRecorder runs in dev builds and retains snapshot
  // frames at ~25 MB/s (a 60 GB simulator process after 40 minutes).
  if (!__DEV__ && !optedOut(StorageKeys.OPT_OUT_ANALYTICS)) {
    vexo("e6f94c3b-f7d3-4edd-b48c-baad9bfd42b5");
  }
  // Module scope (not a post-mount effect) so errors thrown before first
  // render — e.g. a failed persisted-cache restore in createClient — are
  // captured instead of dropped.
  if (!optedOut(StorageKeys.OPT_OUT_CRASH_REPORTING)) {
    Sentry.init({
      dsn: "https://b2756b0df548451d98707d024aff00d1@o58038.ingest.sentry.io/5248224",
      debug: __DEV__,
      enabled: !__DEV__,
    });
  }
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

// eslint-disable-next-line react-doctor/no-multi-comp -- expo-router layout: root + platform variants live together; RootLayout is declared (not export-default'd inline) so Sentry.wrap can wrap it below
function RootLayout() {
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

// Sentry.wrap enables app-start/native-crash instrumentation. It must only
// run when Sentry.init ran (wrap-before-init stalls the app on a black
// screen), so it honors the same crash-reporting opt-out. Skip on web
// (RN-only SDK surface).
export default
  Platform.OS === "web" || optedOut(StorageKeys.OPT_OUT_CRASH_REPORTING)
    ? RootLayout
    : Sentry.wrap(RootLayout);

// eslint-disable-next-line react-doctor/no-multi-comp -- see RootLayout note above
function InnerLayout() {
  const { checkedForToken, accessToken, continuedWithoutLogin } =
    useAccessToken();
  // A signed-in user OR a guest may browse the tabs; only a signed-out
  // non-guest sees the auth screen. Stack.Protected removes the disallowed
  // screens, so React Navigation resets to the available one whenever this
  // flips (login, logout, "continue without logging in") — no imperative
  // router.replace, and deep links into a guarded area are redirected too.
  const canBrowse = !!accessToken || continuedWithoutLogin;

  const [client, setClient] =
    React.useState<ApolloClient<NormalizedCacheObject> | null>(null);

  useEffect(function createClientWithPersistedCache() {
    (async () => {
      try {
        const client = await createClient();
        setClient(client);
      } catch (error) {
        Sentry.captureException(error);
        console.error("[Failed to create Apollo client]:", error);
      }
    })();
  }, []);

  useEffect(function initializeAnalytics() {
    // Production only: like vexo, LogRocket's session replay captures the
    // screen continuously — in dev it queues captures unboundedly.
    if (!__DEV__ && !optedOut(StorageKeys.OPT_OUT_ANALYTICS)) {
      LogRocket.init("iltgzt/goodweebs", {
        updateId: Updates.isEmbeddedLaunch ? null : Updates.updateId,
        expoChannel: Updates.channel,
        network: {
          // LogRocket records every request's headers into session
          // recordings. Without this, the AniList bearer token (~1-year
          // lifetime) on every GraphQL request is uploaded to a third
          // party — a leaked recording would be account takeover.
          requestSanitizer: (request) => {
            for (const header of Object.keys(request.headers)) {
              if (header.toLowerCase() === "authorization") {
                request.headers[header] = null;
              }
            }
            return request;
          },
        },
      });
    }
  }, []);

  const appIsReady = checkedForToken && !!client;

  async function onLayoutRootView() {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }

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
            <Stack.Protected guard={canBrowse}>
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
                name="notifications"
                options={{
                  title: String(
                    fbs("Notifications", "Notifications screen title"),
                  ),
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
            </Stack.Protected>
            <Stack.Protected guard={!canBrowse}>
              <Stack.Screen name="auth" options={{ headerShown: false }} />
            </Stack.Protected>
          </Stack>
        </ActionSheetProvider>
      </ApolloProvider>
    </GestureHandlerRootView>
  );
}
