import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { DynamicColorIOS } from "react-native";

import { useAccessToken } from "yep/useAccessToken";

export default function TabsLayout() {
  const { accessToken } = useAccessToken();

  return (
    <NativeTabs
      blurEffect="systemUltraThinMaterial"
      labelStyle={{
        color: DynamicColorIOS({
          dark: "white",
          light: "black",
        }),
      }}
      tintColor={DynamicColorIOS({
        dark: "#651FFF",
        light: "#651FFF",
      })}
    >
      <NativeTabs.Trigger name="anime">
        <Icon sf="film.fill" />
        <Label>Anime</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="discover">
        <Icon sf="sparkles" />
        <Label>Discover</Label>
      </NativeTabs.Trigger>

      {accessToken && (
        <NativeTabs.Trigger name="profile">
          <Icon sf="person.fill" />
          <Label>Profile</Label>
        </NativeTabs.Trigger>
      )}
    </NativeTabs>
  );
}
