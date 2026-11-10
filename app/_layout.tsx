import "expo-sqlite/localStorage/install";

import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from "@apollo/client";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import * as Sentry from "@sentry/react-native";
import { useFonts } from "expo-font";
import { ObserveRoot, useObserve } from "expo-observe";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { fbs } from "fbtee";
import React, { useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import { enableScreens } from "react-native-screens";

import { createClient } from "yep/graphql/client";
import { LocaleProvider } from "yep/i18n/LocaleContext";
import { canBrowse, useSession } from "yep/session";
import { startTelemetry, syncSessionReplay } from "yep/telemetry";
import { darkTheme } from "yep/themes";
import { LINESeedJP, Manrope } from "yep/typefaces";

const crashReportingStarted = startTelemetry();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: darkTheme.accent,
    background: darkTheme.background,
    card: darkTheme.navBackground,
    text: darkTheme.text,
    border: darkTheme.listItemBorder,
    notification: darkTheme.accent,
  },
};

if (Platform.OS !== "web") {
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
      <ThemeProvider value={navigationTheme}>
        <RootSiblingParent>
          <InnerLayout />
        </RootSiblingParent>
      </ThemeProvider>
    </LocaleProvider>
  );
}

// Sentry.wrap enables app-start/native-crash instrumentation. It must only
// run when Sentry.init ran (wrap-before-init stalls the app on a black
// screen), so it honors the same crash-reporting opt-out. Skip on web
// (RN-only SDK surface).
const skipSentryWrap = !crashReportingStarted;
export default ObserveRoot.wrap(
  skipSentryWrap ? RootLayout : Sentry.wrap(RootLayout),
);

// eslint-disable-next-line react-doctor/no-multi-comp -- see RootLayout note above
function InnerLayout() {
  const { markInteractive } = useObserve();
  const session = useSession();

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
    void syncSessionReplay();
  }, []);

  const appIsReady = session.status !== "checking" && !!client;

  async function onLayoutRootView() {
    if (appIsReady) {
      await SplashScreen.hideAsync();
      markInteractive();
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
                fontSize: 16,
                color: darkTheme.text,
              },
              headerBackButtonDisplayMode: "minimal",
              contentStyle: {
                backgroundColor: darkTheme.background,
              },
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="redirect"
              options={{ headerShown: false, title: "Goodweebs" }}
            />
            <Stack.Screen
              name="+not-found"
              options={{
                title: String(fbs("Page not found", "Not found page title")),
              }}
            />
            <Stack.Protected guard={canBrowse(session)}>
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                  title: String(fbs("Home", "Main tabs route title")),
                }}
              />
              <Stack.Screen
                name="settings"
                options={{
                  title: String(fbs("Settings", "Settings screen title")),
                }}
              />
              <Stack.Screen
                name="details/[id]"
                options={{
                  title: String(fbs("Details", "Media details fallback title")),
                }}
              />
              <Stack.Screen
                name="character/[id]"
                options={{
                  title: String(
                    fbs("Character", "Character details fallback title"),
                  ),
                }}
              />
              <Stack.Screen
                name="user/[id]"
                options={{
                  title: String(fbs("Profile", "User profile title")),
                }}
              />
              <Stack.Screen
                name="notification-center"
                options={{
                  title: String(
                    fbs("Notifications", "Notifications screen title"),
                  ),
                }}
              />
            </Stack.Protected>
            <Stack.Protected guard={!canBrowse(session)}>
              <Stack.Screen name="auth" options={{ headerShown: false }} />
            </Stack.Protected>
          </Stack>
        </ActionSheetProvider>
      </ApolloProvider>
    </GestureHandlerRootView>
  );
}
