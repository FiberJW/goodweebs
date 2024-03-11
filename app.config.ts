import { ExpoConfig, ConfigContext } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_DEV ? "Goodweebs (Dev)" : "Goodweebs",
  slug: "goodweebs",
  platforms: ["ios", "android", "web"],
  version: "0.0.15",
  orientation: "portrait",
  icon: IS_DEV ? "./assets/launch/icon-dev.png" : "./assets/launch/icon.png",
  scheme: IS_DEV ? "goodweebs-dev" : "goodweebs",
  privacy: "unlisted",
  backgroundColor: "#010209",
  splash: {
    image: "./assets/launch/splash.png",
    resizeMode: "cover",
    backgroundColor: "#010209",
  },
  owner: "fiberjw",
  updates: {
    fallbackToCacheTimeout: 30000,
    url: "https://u.expo.dev/21cb2a71-d249-4289-abb6-3b9b39e3b0a3",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    buildNumber: "0.0.15",
    bundleIdentifier: IS_DEV
      ? "com.fiberjw.goodweebs.dev"
      : "com.fiberjw.goodweebs",
    config: {
      usesNonExemptEncryption: false,
    },
    requireFullScreen: false,
  },
  android: {
    package: IS_DEV ? "com.fiberjw.goodweebs.dev" : "com.fiberjw.goodweebs",
    versionCode: 15,
    permissions: [],
    adaptiveIcon: {
      backgroundColor: "#651FFF",
      backgroundImage: "./assets/launch/android-background.png",
      foregroundImage: IS_DEV
        ? "./assets/launch/android-foreground-dev.png"
        : "./assets/launch/android-foreground.png",
    },
  },
  web: {
    favicon: "./assets/favicon.png",
    output: "single",
    bundler: "metro",
  },
  plugins: [
    "expo-font",
    [
      "@sentry/react-native/expo",
      {
        project: "goodweebs",
        organization: "juwan-wheatley",
      },
    ],
    [
      "expo-updates",
      {
        username: "fiberjw",
      },
    ],
  ],
  runtimeVersion: {
    policy: "sdkVersion",
  },
  extra: {
    eas: {
      projectId: process.env.EXPO_STAGING
        ? "4678c342-b7f2-4911-ae87-0c5c0de6c188"
        : "21cb2a71-d249-4289-abb6-3b9b39e3b0a3",
    },
  },
});
