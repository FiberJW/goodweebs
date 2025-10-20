import { Redirect } from "expo-router";
import { View } from "react-native";

import { darkTheme } from "yep/themes";
import { useAccessToken } from "yep/useAccessToken";

export default function Index() {
  const { accessToken, checkedForToken } = useAccessToken();

  if (!checkedForToken) {
    return <View style={{ flex: 1, backgroundColor: darkTheme.background }} />;
  }

  if (accessToken) {
    return <Redirect href="/(tabs)/anime" />;
  }

  return <Redirect href="/auth" />;
}
