import { Stack } from "expo-router";
import React from "react";

import { isLiquidGlass } from "yep/utils";

// On liquid glass a native header must exist to host the UISearchController
// (the search tab's glass circle morphs into it, docked at the bottom), but
// it is kept empty and transparent — the screen renders the same custom
// Header as the other tabs, so typography stays consistent and the title
// doesn't collapse when search activates. Older iOS and Android hide the
// native header entirely and use the in-screen Header + SearchBox.
export default function DiscoverLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: isLiquidGlass,
        headerTransparent: true,
        headerTitle: "",
      }}
    />
  );
}
