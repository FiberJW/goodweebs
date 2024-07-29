import { ExpoConfig, ConfigContext } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";

const name = (() => {
  if (IS_DEV) return "Goodweebs (Dev)";
  if (process.env.EXPO_STAGING) return "Goodweebs (Staging)";
  return "Goodweebs";
})();

const scheme = (() => {
  if (IS_DEV) return "goodweebs-dev";
  if (process.env.EXPO_STAGING) return "goodweebs-staging";
  return "goodweebs";
})();

const buildNumber = 16;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name,
  slug: "goodweebs",
  platforms: ["ios", "android", "web"],
  version: `0.0.${buildNumber}`,
  orientation: "portrait",
  icon: IS_DEV ? "./assets/launch/icon-dev.png" : "./assets/launch/icon.png",
  scheme,
  privacy: "unlisted",
  backgroundColor: "#010209",
  splash: {
    image: "./assets/launch/splash.png",
    resizeMode: "cover",
    backgroundColor: "#010209",
  },
  owner: "fiberjw",
  updates: {
    fallbackToCacheTimeout: 30_000,
    url: process.env.EXPO_STAGING
      ? "https://staging-u.expo.dev/4678c342-b7f2-4911-ae87-0c5c0de6c188"
      : "https://u.expo.dev/21cb2a71-d249-4289-abb6-3b9b39e3b0a3",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    buildNumber: `0.0.${buildNumber}`,
    bundleIdentifier: IS_DEV
      ? "com.fiberjw.goodweebs.dev"
      : "com.fiberjw.goodweebs",
    config: {
      usesNonExemptEncryption: false,
    },
    requireFullScreen: false,
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
          NSPrivacyAccessedAPITypeReasons: ["CA92.1"],
        },
      ],
    },
  },
  android: {
    package: IS_DEV ? "com.fiberjw.goodweebs.dev" : "com.fiberjw.goodweebs",
    versionCode: buildNumber,
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
    process.env.EXPO_STAGING
      ? undefined
      : [
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
    // remove sentry plugin if staging
  ].filter(Boolean) as ExpoConfig["plugins"],
  runtimeVersion: {
    policy: "fingerprint",
  },
  extra: {
    eas: {
      projectId: process.env.EXPO_STAGING
        ? "4678c342-b7f2-4911-ae87-0c5c0de6c188"
        : "21cb2a71-d249-4289-abb6-3b9b39e3b0a3",
    },
  },
});
