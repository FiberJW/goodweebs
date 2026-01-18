import { Tabs } from "expo-router";
import React from "react";
import { Image } from "react-native";

import { darkTheme } from "yep/themes";
import { useAccessToken } from "yep/useAccessToken";

export default function TabsLayout() {
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
