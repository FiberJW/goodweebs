import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import React from "react";
import { Platform } from "react-native";

import { darkTheme } from "yep/themes";
import { useAccessToken } from "yep/useAccessToken";

export default function TabsLayout() {
  const { accessToken } = useAccessToken();

  return (
    <NativeTabs
      backgroundColor={darkTheme.navBackground}
      tintColor={Platform.OS === "ios" ? darkTheme.accent : darkTheme.text}
      indicatorColor={darkTheme.button}
      labelVisibilityMode="unlabeled"
    >
      <NativeTabs.Trigger name="anime">
        <Icon
          src={<VectorIcon family={MaterialCommunityIcons} name="television" />}
        />
        <Label>Anime</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="discover">
        <Icon
          src={<VectorIcon family={MaterialCommunityIcons} name="search-web" />}
        />
        <Label>Discover</Label>
      </NativeTabs.Trigger>

      {accessToken && (
        <NativeTabs.Trigger name="profile">
          <Icon
            src={<VectorIcon family={MaterialCommunityIcons} name="account" />}
          />
          <Label>Profile</Label>
        </NativeTabs.Trigger>
      )}
    </NativeTabs>
  );
}
