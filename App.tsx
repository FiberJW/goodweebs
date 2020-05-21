import React from "react";
import { Text, View, Image, StatusBar } from "react-native";
import * as Sentry from "sentry-expo";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { dark } from "./themes";
import { loadAsync, FontSource } from "expo-font";
import { AppLoading } from "expo";

Sentry.init({
  dsn:
    "https://b2756b0df548451d98707d024aff00d1@o58038.ingest.sentry.io/5248224",
});

function AnimeListScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        style={{
          color: dark.text,
          fontFamily: "Manrope-ExtraBold",
          fontSize: 25,
        }}
      >
        Anime!
      </Text>
    </View>
  );
}

function MangaListScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        style={{
          color: dark.text,
          fontFamily: "Manrope-ExtraBold",
          fontSize: 25,
        }}
      >
        Manga!
      </Text>
    </View>
  );
}

function DiscoverScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        style={{
          color: dark.text,
          fontFamily: "Manrope-ExtraBold",
          fontSize: 25,
        }}
      >
        Discover!
      </Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        style={{
          color: dark.text,
          fontFamily: "Manrope-ExtraBold",
          fontSize: 25,
        }}
      >
        Profile!
      </Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        style={{
          color: dark.text,
          fontFamily: "Manrope-ExtraBold",
          fontSize: 25,
        }}
      >
        Settings!
      </Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

const theme: typeof DefaultTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: dark.text,
    background: dark.background,
    card: dark.navBackground,
    text: dark.text,
    border: "transparent",
  },
};

function useFonts(map: FontMap): boolean {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      await loadAsync(map);
      setLoaded(true);
    })();
  }, []);

  return loaded;
}

interface FontMap {
  [name: string]: FontSource;
}

export default function App() {
  const fontsLoaded = useFonts({
    "Manrope-Bold": require("./assets/fonts/manrope/Manrope-Bold.otf"),
    "Manrope-ExtraBold": require("./assets/fonts/manrope/Manrope-ExtraBold.otf"),
    "Manrope-ExtraLight": require("./assets/fonts/manrope/Manrope-ExtraLight.otf"),
    "Manrope-Light": require("./assets/fonts/manrope/Manrope-Light.otf"),
    "Manrope-Medium": require("./assets/fonts/manrope/Manrope-Medium.otf"),
    "Manrope-Regular": require("./assets/fonts/manrope/Manrope-Regular.otf"),
    "Manrope-SemiBold": require("./assets/fonts/manrope/Manrope-SemiBold.otf"),
  });

  return fontsLoaded ? (
    <NavigationContainer theme={theme}>
      <StatusBar barStyle="light-content" />
      <Tab.Navigator
        tabBarOptions={{
          showLabel: false,
          labelStyle: {
            fontSize: 12.8,
            fontFamily: "Manrope-Medium",
          },
        }}
      >
        <Tab.Screen
          name="Anime"
          component={AnimeListScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Image
                style={{
                  tintColor: color,
                  height: size,
                  width: size,
                }}
                source={require("./assets/icons/navigation/anime-tab.png")}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Manga"
          component={MangaListScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Image
                style={{
                  tintColor: color,
                  height: size,
                  width: size,
                }}
                source={require("./assets/icons/navigation/manga-tab.png")}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Discover"
          component={DiscoverScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Image
                style={{
                  tintColor: color,
                  height: size,
                  width: size,
                }}
                source={require("./assets/icons/navigation/discover-tab.png")}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Image
                style={{
                  tintColor: color,
                  height: size,
                  width: size,
                }}
                source={require("./assets/icons/navigation/profile-tab.png")}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Image
                style={{
                  tintColor: color,
                  height: size,
                  width: size,
                }}
                source={require("./assets/icons/navigation/settings-tab.png")}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  ) : (
    <AppLoading />
  );
}
