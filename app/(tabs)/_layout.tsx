import { Image } from "expo-image";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { fbs } from "fbtee";
import React from "react";
import { Platform } from "react-native";

import { goodweebsPurple } from "yep/colors";
import { formatUnreadCount, useViewer } from "yep/graphql/viewer";
import { useAccessToken } from "yep/session";
import { darkTheme } from "yep/themes";
import { isLiquidGlass } from "yep/utils";

function useUnreadBadge(): string | undefined {
  const unreadCount = useViewer().viewer?.unreadNotificationCount ?? 0;
  return unreadCount > 0 ? formatUnreadCount(unreadCount) : undefined;
}

const TABS: {
  name: string;
  label: () => string;
  icon: number;
  isSearch?: boolean;
  showsUnreadBadge?: boolean;
  requiresLogin?: boolean;
}[] = [
  {
    name: "anime",
    label: () => String(fbs("Anime", "Anime tab label")),
    icon: require("yep/assets/icons/navigation/anime-tab.png"),
  },
  {
    name: "manga",
    label: () => String(fbs("Manga", "Manga tab label")),
    icon: require("yep/assets/icons/navigation/book.png"),
  },
  {
    name: "discover",
    label: () => String(fbs("Discover", "Discover tab label")),
    icon: require("yep/assets/icons/navigation/discover-tab.png"),
    isSearch: true,
  },
  {
    name: "feed",
    label: () => String(fbs("Feed", "List activity feed tab label")),
    icon: require("yep/assets/icons/navigation/satellite.png"),
    showsUnreadBadge: true,
  },
  {
    name: "profile",
    label: () => String(fbs("Profile", "Profile tab label")),
    icon: require("yep/assets/icons/navigation/profile-tab.png"),
    requiresLogin: true,
  },
];

// iOS gets the system tab bar (liquid glass on iOS 26); Android keeps the
// custom JS tab bar until we design a native Material one.
export default function TabsLayout() {
  return Platform.OS === "ios" ? <NativeTabsLayout /> : <JsTabsLayout />;
}

function NativeTabsLayout() {
  const unreadBadge = useUnreadBadge();

  return (
    // Pre-26 the native bar defaults to a transparent scroll-edge appearance,
    // so pin the old JS bar's background there.
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
      {/* Every trigger stays visible, including profile for guests: flipping
          `hidden` remounts the navigator (wiping every tab's state) and
          crashes in dev if the profile tab is focused during logout. */}
      {TABS.map((tab) => (
        <NativeTabs.Trigger
          key={tab.name}
          name={tab.name}
          role={tab.isSearch ? "search" : undefined}
        >
          <NativeTabs.Trigger.Label>{tab.label()}</NativeTabs.Trigger.Label>
          {/* template rendering keeps icon and selectedIcon the same native
              type; RNScreens throws on a mismatch. */}
          {tab.isSearch ? null : (
            <NativeTabs.Trigger.Icon src={tab.icon} renderingMode="template" />
          )}
          {tab.showsUnreadBadge ? (
            <NativeTabs.Trigger.Badge hidden={!unreadBadge}>
              {unreadBadge}
            </NativeTabs.Trigger.Badge>
          ) : null}
        </NativeTabs.Trigger>
      ))}
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
        tabBarBadgeStyle: {
          backgroundColor: darkTheme.accent,
          color: darkTheme.text,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            href: tab.requiresLogin && !accessToken ? null : undefined,
            tabBarBadge: tab.showsUnreadBadge ? unreadBadge : undefined,
            tabBarIcon: ({ color, size }) => (
              <Image
                style={{ tintColor: color, height: size, width: size }}
                source={tab.icon}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
