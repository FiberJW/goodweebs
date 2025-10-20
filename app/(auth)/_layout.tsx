import { Redirect, Stack } from "expo-router";

import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { useAccessToken } from "yep/useAccessToken";

export default function AuthLayout() {
  const { accessToken, checkedForToken } = useAccessToken();

  if (!checkedForToken) return null;

  if (!accessToken) {
    return <Redirect href="/auth" />;
  }

  return (
    <Stack
      screenOptions={{
        title: "",
        headerTitleStyle: {
          fontFamily: Manrope.semiBold,
        },
        headerStyle: {
          backgroundColor: darkTheme.navBackground,
        },
        headerTintColor: darkTheme.text,
        contentStyle: {
          backgroundColor: darkTheme.background,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
    </Stack>
  );
}
