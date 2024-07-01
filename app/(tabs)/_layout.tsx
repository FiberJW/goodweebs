import { Tabs } from "expo-router/tabs";
import React from "react";

export default function AppLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        // Name of the route to hide.
        name="anime"
        options={
          {
            // This tab will no longer show up in the tab bar.
            // href: null,
          }
        }
      />
      <Tabs.Screen
        // Name of the route to hide.
        name="discover"
        options={
          {
            // This tab will no longer show up in the tab bar.
            // href: null,
          }
        }
      />
      <Tabs.Screen
        // Name of the route to hide.
        name="profile"
        options={
          {
            // This tab will no longer show up in the tab bar.
            // href: null,
          }
        }
      />
    </Tabs>
  );
}
