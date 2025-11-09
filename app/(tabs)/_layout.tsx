import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";
import { Platform } from "react-native";

import { officialSiteFallback } from "yep/colors";
import { darkTheme } from "yep/themes";
import { useAccessToken } from "yep/useAccessToken";

export default function TabsLayout() {
  const { accessToken } = useAccessToken();

  return (
    <NativeTabs
      backgroundColor={darkTheme.navBackground}
      tintColor={Platform.OS === "ios" ? officialSiteFallback : darkTheme.text}
      indicatorColor={darkTheme.button}
      disableIndicator
      labelVisibilityMode="unlabeled"
      // TODO: figure out how to configure a background color and inset for < iOS 26 native tabs
    >
      <NativeTabs.Trigger name="anime">
        <Icon src={require("yep/assets/icons/navigation/anime-tab.png")} />
        <Label>Anime</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="discover">
        <Icon src={require("yep/assets/icons/navigation/discover-tab.png")} />
        <Label>Discover</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger hidden={!accessToken} name="profile">
        <Icon src={require("yep/assets/icons/navigation/profile-tab.png")} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
