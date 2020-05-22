import React from "react";
import { Image, StatusBar } from "react-native";
import * as Sentry from "sentry-expo";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { dark } from "yep/themes";
import { loadAsync, FontSource } from "expo-font";
import { AppLoading } from "expo";
import { createStackNavigator } from "@react-navigation/stack";
import { AnimeListScreen } from "yep/screens/AnimeListScreen";
import { MangaListScreen } from "yep/screens/MangaListScreen";
import { DiscoverScreen } from "yep/screens/DiscoverScreen";
import { ProfileScreen } from "yep/screens/ProfileScreen";
import { SettingsScreen } from "yep/screens/SettingsScreen";
import { DetailsScreen } from "yep/screens/DetailScreen";

Sentry.init({
  dsn:
    "https://b2756b0df548451d98707d024aff00d1@o58038.ingest.sentry.io/5248224",
});

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
              source={require("yep/assets/icons/navigation/manga-tab.png")}
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
              source={require("yep/assets/icons/navigation/settings-tab.png")}
            />
          ),
        }}
      />
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

export default function App() {
  const fontsLoaded = useFonts({
    "Manrope-Bold": require("yep/assets/fonts/manrope/Manrope-Bold.otf"),
    "Manrope-ExtraBold": require("yep/assets/fonts/manrope/Manrope-ExtraBold.otf"),
    "Manrope-ExtraLight": require("yep/assets/fonts/manrope/Manrope-ExtraLight.otf"),
    "Manrope-Light": require("yep/assets/fonts/manrope/Manrope-Light.otf"),
    "Manrope-Medium": require("yep/assets/fonts/manrope/Manrope-Medium.otf"),
    "Manrope-Regular": require("yep/assets/fonts/manrope/Manrope-Regular.otf"),
    "Manrope-SemiBold": require("yep/assets/fonts/manrope/Manrope-SemiBold.otf"),
  });

  return fontsLoaded ? (
    <NavigationContainer theme={theme}>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator
        initialRouteName="Tabs"
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
      </Stack.Navigator>
    </NavigationContainer>
  ) : (
    <AppLoading />
  );
}
