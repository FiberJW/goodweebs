import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { Image, StatusBar } from "react-native";

import { AnimeListScreen } from "yep/screens/AnimeListScreen";
import { AuthScreen } from "yep/screens/AuthScreen";
import { DetailsScreen } from "yep/screens/DetailsScreen";
import { DiscoverScreen } from "yep/screens/DiscoverScreen";
import { ProfileScreen } from "yep/screens/ProfileScreen";
import { darkTheme } from "yep/themes";

export type RootStackParamList = {
  Tabs: undefined;
  Auth: undefined;
  Details: { id: string };
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

function Tabs() {
  return (
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
              source={require("yep/assets/icons/navigation/anime-tab.png")}
            />
          ),
        }}
      />
      {/* <Tab.Screen
        name="Manga"
        // TODO: I've got too much anime on my "planned" list,
        // so I'll finish that before I start on manga
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
  accessToken: string | null;
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
            fontFamily: "Manrope-SemiBold",
          },
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
