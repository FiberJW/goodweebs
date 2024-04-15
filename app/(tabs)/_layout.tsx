import { Tabs } from "expo-router/tabs";
import React from "react";

export default function AppLayout() {
  const showAnimeTabFirst = true; // TODO: decide if this is even the right thing to do. i might want to just hide the anime list tab entirely unless logged in instead of making it the initial route

  return (
    <Tabs>
      <Tabs.Screen
        // Name of the route to hide.
        name="anime"
        options={{
          // This tab will no longer show up in the tab bar.
          href: null,
        }}
      />
    </Tabs>
  );
}
