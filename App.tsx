import React from "react";
import { Text, View, Image } from "react-native";
import * as Sentry from "sentry-expo";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { dark } from "./themes";

Sentry.init({
  dsn:
    "https://b2756b0df548451d98707d024aff00d1@o58038.ingest.sentry.io/5248224",
});

function AnimeListScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Anime!</Text>
    </View>
  );
}

function MangaListScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Manga!</Text>
    </View>
  );
}

function DiscoverScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Discover!</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile!</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Settings!</Text>
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

export default function App() {
  return (
    <NavigationContainer theme={theme}>
      <Tab.Navigator tabBarOptions={{ style: { padding: 16 } }}>
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
                  marginBottom: 8,
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
                  marginBottom: 8,
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
                  marginBottom: 8,
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
                  marginBottom: 8,
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
                  marginBottom: 8,
                }}
                source={require("./assets/icons/navigation/settings-tab.png")}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
