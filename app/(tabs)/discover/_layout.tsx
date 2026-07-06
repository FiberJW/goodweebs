import { Stack } from "expo-router";
import { fbs } from "fbtee";
import React from "react";

import { darkTheme } from "yep/themes";
import { isLiquidGlass } from "yep/utils";

// On liquid glass the search field lives in the native header, where the
// search tab's glass circle morphs into it (UIKit adopts the screen's
// UISearchController). Older iOS and Android keep headers hidden and render
// the in-screen Header + SearchBox instead.
export default function DiscoverLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: isLiquidGlass,
        headerLargeTitle: true,
        headerTransparent: isLiquidGlass,
        headerLargeStyle: { backgroundColor: darkTheme.background },
        title: String(fbs("Discover", "Discover tab header label")),
      }}
    />
  );
}
