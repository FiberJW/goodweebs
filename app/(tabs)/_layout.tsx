import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

import { darkTheme } from "yep/themes";
import { useAccessToken } from "yep/useAccessToken";

export default function TabsLayout() {
  const { accessToken } = useAccessToken();

  return (
    <NativeTabs
    // TODO: tune the native tabs to be consistently dark
    // blurEffect="systemUltraThinMaterialDark"
    // backgroundColor={darkTheme.accent}
    // labelStyle={{
    //   color: darkTheme.text,
    // }}
    // tintColor={darkTheme.accent}
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
