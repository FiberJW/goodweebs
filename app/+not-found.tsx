import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { darkTheme } from "yep/themes";

export default function NotFound() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: darkTheme.background }}>
      <EmptyState
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
        cta={{
          label: "Go Home",
          onPress: () => router.replace("/(tabs)/discover"),
        }}
      />
    </View>
  );
}
