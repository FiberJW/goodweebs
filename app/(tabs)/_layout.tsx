import { Image } from "expo-image";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { fbs } from "fbtee";
import React from "react";
import { Platform } from "react-native";

import { goodweebsPurple } from "yep/colors";
import { darkTheme } from "yep/themes";
import { useAccessToken } from "yep/useAccessToken";
import { isLiquidGlass } from "yep/utils";

// iOS gets the system tab bar (liquid glass on iOS 26); Android keeps the
// existing custom JS tab bar until we design a native Material one.
export default function TabsLayout() {
  return Platform.OS === "ios" ? <NativeTabsLayout /> : <JsTabsLayout />;
}

function NativeTabsLayout() {
  return (
    // On iOS 26 the system draws the liquid-glass bar — leave it unstyled.
    // Pre-26 the native bar defaults to a transparent scroll-edge appearance
    // (items float over content), so pin the old JS bar's background there.
    <NativeTabs
      tintColor={goodweebsPurple}
      backgroundColor={isLiquidGlass ? undefined : darkTheme.navBackground}
      disableTransparentOnScrollEdge={!isLiquidGlass}
    >
      <NativeTabs.Trigger name="anime">
        <NativeTabs.Trigger.Label>
          {String(fbs("Anime", "Anime tab label"))}
        </NativeTabs.Trigger.Label>
        {/* template rendering: monochrome glyph tinted like an SF symbol —
            also keeps icon/selectedIcon the same native type (RNScreens
            throws on a mismatch when tintColor makes selected a template). */}
        <NativeTabs.Trigger.Icon
          src={require("yep/assets/icons/navigation/anime-tab.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover" role="search">
        <NativeTabs.Trigger.Label>
          {String(fbs("Discover", "Discover tab label"))}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      {/* Always visible: flipping `hidden` remounts the whole navigator
          (wiping every tab's state) and crashes in dev if the profile tab is
          focused during logout — the screen gates logged-out users instead. */}
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>
          {String(fbs("Profile", "Profile tab label"))}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("yep/assets/icons/navigation/profile-tab.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function JsTabsLayout() {
  const { accessToken } = useAccessToken();

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: darkTheme.navBackground,
          borderTopColor: "transparent",
        },
        tabBarActiveTintColor: darkTheme.text,
        tabBarInactiveTintColor: darkTheme.listItemBackground,
      }}
    >
      <Tabs.Screen
        name="anime"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              style={{
                tintColor: color,
                height: size,
                width: size,
              }}
              source={require("yep/assets/icons/navigation/anime-tab.png")}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              style={{
                tintColor: color,
                height: size,
                width: size,
              }}
              source={require("yep/assets/icons/navigation/discover-tab.png")}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: accessToken ? "/profile" : null,
          tabBarIcon: ({ color, size }) => (
            <Image
              style={{
                tintColor: color,
                height: size,
                width: size,
              }}
              source={require("yep/assets/icons/navigation/profile-tab.png")}
            />
          ),
        }}
      />
    </Tabs>
  );
}
