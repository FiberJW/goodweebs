import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { Image, Platform, StatusBar } from "react-native";

import { AnimeListScreen } from "yep/screens/AnimeListScreen";
import { AuthScreen } from "yep/screens/AuthScreen";
import { CharacterScreen } from "yep/screens/CharacterScreen";
import { DetailsScreen } from "yep/screens/DetailsScreen";
import { DiscoverScreen } from "yep/screens/DiscoverScreen";
import { ProfileScreen } from "yep/screens/ProfileScreen";
import { darkTheme } from "yep/themes";

import { Manrope } from "./typefaces";
import { useAccessToken } from "./useAccessToken";

export type RootStackParamList = {
  Tabs: undefined;
  Auth: undefined;
  Details: { id: number };
  Character: { id: number };
};

export type TabParamList = {
  Anime: undefined;
  Discover: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function Tabs() {
  const { accessToken } = useAccessToken();

  return (
    <Tab.Navigator
      initialRouteName={accessToken ? "Anime" : "Discover"}
      screenOptions={{
        tabBarShowLabel: false,
        lazy: Platform.OS !== "ios",
        headerShown: false,
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
              source={require("yep/assets/icons/navigation/anime-tab.png")}
            />
          ),
        }}
      />
      {/* <Tab.Screen
        name="Manga"
        // TODO: if i ever start reading manga
        component={MangaListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              style={{
                tintColor: color,
                height: size,
                width: size,
              }}
              source={require("yep/assets/icons/navigation/manga-tab.png")}
            />
          ),
        }}
      /> */}
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
              source={require("yep/assets/icons/navigation/discover-tab.png")}
            />
          ),
        }}
      />
      {accessToken && (
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
                source={require("yep/assets/icons/navigation/profile-tab.png")}
              />
            ),
          }}
        />
      )}
      {/* <Tab.Screen
        name="Settings"
        // TODO: there is currently only one "setting",
        // and that is being logged in or not,
        // so I'll put that on the profile and save this for later
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              style={{
                tintColor: color,
                height: size,
                width: size,
              }}
              source={require("yep/assets/icons/navigation/settings-tab.png")}
            />
          ),
        }}
      /> */}
    </Tab.Navigator>
  );
}

export const theme: typeof DefaultTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: darkTheme.text,
    background: darkTheme.background,
    card: darkTheme.navBackground,
    text: darkTheme.text,
    border: "transparent",
  },
};

type NavigationProps = {
  accessToken?: string;
};

export function Navigation({ accessToken }: NavigationProps) {
  return (
    <NavigationContainer theme={theme}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={darkTheme.navBackground}
      />
      <Stack.Navigator
        initialRouteName={accessToken ? "Tabs" : "Auth"}
        screenOptions={{
          title: "",
          headerTitleStyle: {
            fontFamily: Manrope.semiBold,
          },
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="Character" component={CharacterScreen} />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
