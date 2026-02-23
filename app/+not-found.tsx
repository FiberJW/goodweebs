import { useRouter, usePathname } from "expo-router";
import { fbs } from "fbtee";
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
        title={String(fbs("Page not found", "Not found page title"))}
        description={String(
          fbs(
            "The page you're looking for doesn't exist.",
            "Not found page description",
          ),
        )}
        cta={{
          label: String(fbs("Go home", "Not found page call to action label")),
          onPress: () => router.replace("/(tabs)/discover"),
        }}
      />
    </View>
  );
}
