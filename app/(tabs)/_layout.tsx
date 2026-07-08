import { useQuery } from "@apollo/client";
import { Image } from "expo-image";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { fbs } from "fbtee";
import React from "react";
import { Platform } from "react-native";

import { goodweebsPurple } from "yep/colors";
import { GetViewer } from "yep/graphql/viewer";
import { darkTheme } from "yep/themes";
import { useAccessToken } from "yep/useAccessToken";
import { isLiquidGlass } from "yep/utils";

// Shared by both layouts: the notifications tab badge mirrors the viewer's
// unread count (cache-only — the list screens' GetViewer query keeps it warm,
// and the notifications screen zeroes it in cache on open).
function useUnreadBadge(): string | undefined {
  const { data } = useQuery(GetViewer, { fetchPolicy: "cache-only" });
  const unreadCount = data?.Viewer?.unreadNotificationCount ?? 0;
  return unreadCount > 0
    ? unreadCount > 99
      ? "99+"
      : `${unreadCount}`
    : undefined;
}

// iOS gets the system tab bar (liquid glass on iOS 26); Android keeps the
// existing custom JS tab bar until we design a native Material one.
export default function TabsLayout() {
  return Platform.OS === "ios" ? <NativeTabsLayout /> : <JsTabsLayout />;
}

function NativeTabsLayout() {
  const unreadBadge = useUnreadBadge();

  return (
    // On iOS 26 the system draws the liquid-glass bar — leave it unstyled.
    // Pre-26 the native bar defaults to a transparent scroll-edge appearance
    // (items float over content), so pin the old JS bar's background there.
    <NativeTabs
      tintColor={isLiquidGlass ? goodweebsPurple : darkTheme.text}
      iconColor={isLiquidGlass ? undefined : darkTheme.listItemBackground}
      labelStyle={
        isLiquidGlass
          ? undefined
          : {
              default: { color: darkTheme.listItemBackground },
              selected: { color: darkTheme.text },
            }
      }
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
      <NativeTabs.Trigger name="manga">
        <NativeTabs.Trigger.Label>
          {String(fbs("Manga", "Manga tab label"))}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("yep/assets/icons/navigation/book.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover" role="search">
        <NativeTabs.Trigger.Label>
          {String(fbs("Discover", "Discover tab label"))}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="notifications">
        <NativeTabs.Trigger.Label>
          {String(fbs("Notifications", "Notifications tab label"))}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("yep/assets/icons/navigation/bell.png")}
          renderingMode="template"
        />
        <NativeTabs.Trigger.Badge hidden={!unreadBadge}>
          {unreadBadge}
        </NativeTabs.Trigger.Badge>
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
  const unreadBadge = useUnreadBadge();

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
        name="manga"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              style={{
                tintColor: color,
                height: size,
                width: size,
              }}
              source={require("yep/assets/icons/navigation/book.png")}
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
        name="notifications"
        options={{
          href: accessToken ? "/notifications" : null,
          tabBarBadge: unreadBadge,
          tabBarBadgeStyle: {
            backgroundColor: darkTheme.accent,
            color: darkTheme.text,
          },
          tabBarIcon: ({ color, size }) => (
            <Image
              style={{
                tintColor: color,
                height: size,
                width: size,
              }}
              source={require("yep/assets/icons/navigation/bell.png")}
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
