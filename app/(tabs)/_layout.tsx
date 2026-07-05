import { Image } from "expo-image";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { fbs } from "fbtee";
import React from "react";
import { Platform } from "react-native";

import { goodweebsPurple } from "yep/colors";
import { darkTheme } from "yep/themes";
import { useAccessToken } from "yep/useAccessToken";

// iOS gets the system tab bar (liquid glass on iOS 26); Android keeps the
// existing custom JS tab bar until we design a native Material one.
export default function TabsLayout() {
  return Platform.OS === "ios" ? <NativeTabsLayout /> : <JsTabsLayout />;
}

function NativeTabsLayout() {
  const { accessToken } = useAccessToken();

  return (
    <NativeTabs tintColor={goodweebsPurple}>
      <NativeTabs.Trigger name="anime">
        <NativeTabs.Trigger.Label>
          {String(fbs("Anime", "Anime tab label"))}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="play.tv" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover" role="search">
        <NativeTabs.Trigger.Label>
          {String(fbs("Discover", "Discover tab label"))}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" />
      </NativeTabs.Trigger>
      {/* hidden remounts the navigator when it flips (login/logout), which
          matches the old href:null reset behavior. */}
      <NativeTabs.Trigger name="profile" hidden={!accessToken}>
        <NativeTabs.Trigger.Label>
          {String(fbs("Profile", "Profile tab label"))}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle" />
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
