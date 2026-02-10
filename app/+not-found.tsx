import { useRouter, usePathname } from "expo-router";
import React from "react";
import { View } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { darkTheme } from "yep/themes";

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  console.error("Unhandled route: ", pathname);

  return (
    <View style={{ flex: 1, backgroundColor: darkTheme.background }}>
      <EmptyState
        title="Page not found"
        description="The page you're looking for doesn't exist."
        cta={{
          label: "Go home",
          onPress: () => router.replace("/(tabs)/discover"),
        }}
      />
    </View>
  );
}
