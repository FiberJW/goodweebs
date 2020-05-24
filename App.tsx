import React, { useState, useEffect } from "react";
import { Image, StatusBar, AsyncStorage } from "react-native";
import * as Sentry from "sentry-expo";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { dark } from "yep/themes";
import { loadAsync, FontSource } from "expo-font";
import { AppLoading } from "expo";
import { createStackNavigator } from "@react-navigation/stack";
import { AnimeListScreen } from "yep/screens/AnimeListScreen";
import { DiscoverScreen } from "yep/screens/DiscoverScreen";
import { ProfileScreen } from "yep/screens/ProfileScreen";
import { DetailsScreen } from "yep/screens/DetailsScreen";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";
import { setContext } from "@apollo/link-context";

import {
  AuthScreen,
  ANILIST_ACCESS_TOKEN_STORAGE,
} from "yep/screens/AuthScreen";
// import { MangaListScreen } from "yep/screens/MangaListScreen";
// import { SettingsScreen } from "yep/screens/SettingsScreen";

Sentry.init({
  dsn:
    "https://b2756b0df548451d98707d024aff00d1@o58038.ingest.sentry.io/5248224",
});

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

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = await AsyncStorage.getItem(ANILIST_ACCESS_TOKEN_STORAGE);
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const httpLink = new HttpLink({
  uri: "https://graphql.anilist.co",
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});

export default function App() {
  const [checkedForToken, setCheckedForToken] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const fontsLoaded = useFonts({
    "Manrope-Bold": require("yep/assets/fonts/manrope/Manrope-Bold.otf"),
    "Manrope-ExtraBold": require("yep/assets/fonts/manrope/Manrope-ExtraBold.otf"),
    "Manrope-ExtraLight": require("yep/assets/fonts/manrope/Manrope-ExtraLight.otf"),
    "Manrope-Light": require("yep/assets/fonts/manrope/Manrope-Light.otf"),
    "Manrope-Medium": require("yep/assets/fonts/manrope/Manrope-Medium.otf"),
    "Manrope-Regular": require("yep/assets/fonts/manrope/Manrope-Regular.otf"),
    "Manrope-SemiBold": require("yep/assets/fonts/manrope/Manrope-SemiBold.otf"),
  });

  useEffect(function navigateIfAccessTokenExists() {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(ANILIST_ACCESS_TOKEN_STORAGE);
        if (token) {
          setAccessToken(token);
        }
      } catch (_) {
      } finally {
        setCheckedForToken(true);
      }
    })();
  });

  return fontsLoaded && checkedForToken ? (
    <ApolloProvider client={client}>
      <NavigationContainer theme={theme}>
        <StatusBar barStyle="light-content" />
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
    </ApolloProvider>
  ) : (
    <AppLoading />
  );
}
