import { ExpoConfig, ConfigContext } from "expo/config";

const APP_VARIANT = process.env.APP_VARIANT;
const IS_DEV = APP_VARIANT === "development";
const IS_PREVIEW = APP_VARIANT === "preview";

const name = (() => {
  if (IS_DEV) return "Goodweebs (Dev)";
  if (IS_PREVIEW) return "Goodweebs (Preview)";
  if (process.env.EXPO_STAGING) return "Goodweebs (Staging)";
  return "Goodweebs";
})();

const scheme = (() => {
  if (IS_DEV) return "goodweebs-dev";
  if (IS_PREVIEW) return "goodweebs-preview";
  if (process.env.EXPO_STAGING) return "goodweebs-staging";
  return "goodweebs";
})();

const appId = (() => {
  if (IS_DEV) return "com.fiberjw.goodweebs.dev";
  if (IS_PREVIEW) return "com.fiberjw.goodweebs.preview";
  return "com.fiberjw.goodweebs";
})();

const icon = (() => {
  if (IS_DEV) return "./assets/launch/icon-dev.png";
  if (IS_PREVIEW) return "./assets/launch/icon-preview.png";
  return "./assets/launch/icon.png";
})();

const androidForegroundImage = (() => {
  if (IS_DEV) return "./assets/launch/android-foreground-dev.png";
  if (IS_PREVIEW) return "./assets/launch/icon-preview.png";
  return "./assets/launch/android-foreground.png";
})();

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name,
  version: "0.0.32",
  slug: "goodweebs",
  platforms: ["ios", "android", "web"],
  orientation: "portrait",
  icon,
  scheme,
  backgroundColor: "#010209",
  owner: "fiberjw",
  updates: {
    fallbackToCacheTimeout: 30000,
    url: process.env.EXPO_STAGING
      ? "https://staging-u.expo.dev/4678c342-b7f2-4911-ae87-0c5c0de6c188"
      : "https://u.expo.dev/21cb2a71-d249-4289-abb6-3b9b39e3b0a3",
  },
  ios: {
    userInterfaceStyle: "dark",
    entitlements: {
      "aps-environment": "development",
    },
    supportsTablet: true,
    bundleIdentifier: appId,
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
    package: appId,
    permissions: [],
    adaptiveIcon: {
      backgroundColor: "#651FFF",
      backgroundImage: "./assets/launch/android-background.png",
      foregroundImage: androidForegroundImage,
    },
  },
  web: {
    favicon: "./assets/favicon.png",
    output: "single",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    [
      // Declares the app's localizations so the OS shows a per-app Language
      // picker (iOS Settings › Goodweebs › Language; Android 13+ App language).
      // Sets iOS CFBundleLocalizations + Android res/xml/locales_config.xml.
      "expo-localization",
      {
        supportedLocales: ["en", "ja"],
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#ffffff",
        image: "./assets/launch/splash-logo-wrapped.png",
        imageWidth: 200,
        dark: {
          backgroundColor: "#010209",
          image: "./assets/launch/splash-logo-wrapped-dark.png",
        },
      },
    ],
    "expo-image",
    [
      "expo-font",
      {
        fonts: [
          "./assets/fonts/manrope/Manrope-Bold.otf",
          "./assets/fonts/manrope/Manrope-ExtraBold.otf",
          "./assets/fonts/manrope/Manrope-ExtraLight.otf",
          "./assets/fonts/manrope/Manrope-Light.otf",
          "./assets/fonts/manrope/Manrope-Medium.otf",
          "./assets/fonts/manrope/Manrope-Regular.otf",
          "./assets/fonts/manrope/Manrope-SemiBold.otf",
          "./assets/fonts/LINESeedJP/LINESeedJP_OTF_Rg.otf",
          "./assets/fonts/LINESeedJP/LINESeedJP_OTF_Eb.otf",
          "./assets/fonts/LINESeedJP/LINESeedJP_OTF_Bd.otf",
          "./assets/fonts/LINESeedJP/LINESeedJP_OTF_Th.otf",
        ],
      },
    ],
    [
      "expo-secure-store",
      {
        configureAndroidBackup: true,
        faceIDPermission:
          "Allow Goodweebs to access your Face ID biometric data.",
      },
    ],
    "expo-web-browser",
    "@logrocket/react-native",
    [
      "expo-build-properties",
      {
        android: {
          // compileSdk/targetSdk pins dropped: RN 0.86 defaults to 36.
          // minSdk 35 is intentionally kept — a deliberate pre-existing
          // experiment (commit "try minsdk 35"). Note it limits installs to
          // Android 15+; delete it if that was never the intent.
          minSdkVersion: 35,
        },
      },
    ],
    // remove sentry plugin if staging
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
  experiments: {
    reactCompiler: true,
  },
});
