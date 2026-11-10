import LogRocket from "@logrocket/react-native";
import * as Sentry from "@sentry/react-native";
import { Observe } from "expo-observe";
import * as Updates from "expo-updates";
import { useState } from "react";
import { Platform } from "react-native";

import { Settings, readSetting } from "yep/storage";

type OptOutKey =
  | typeof Settings.optOutAnalytics
  | typeof Settings.optOutCrashReporting;

// localStorage is synchronous here thanks to the expo-sqlite polyfill.
export function optedOut(key: OptOutKey) {
  return readSetting(key) === true;
}

// Called at module scope (not a post-mount effect) so errors thrown before
// first render — e.g. a failed persisted-cache restore in createClient — are
// captured instead of dropped.
export function startTelemetry() {
  if (Platform.OS === "web") return false;
  const crashReporting = !optedOut(Settings.optOutCrashReporting);
  if (crashReporting) {
    Sentry.init({
      dsn: "https://b2756b0df548451d98707d024aff00d1@o58038.ingest.sentry.io/5248224",
      debug: __DEV__,
      enabled: !__DEV__,
    });
  }
  Observe.configure({
    dispatchingEnabled: !optedOut(Settings.optOutAnalytics),
  });
  return crashReporting;
}

let sessionReplay = Promise.resolve();
let replayState: "idle" | "recording" | "stopped" = "idle";

// Production only: LogRocket's session replay captures the screen
// continuously — in dev it queues captures unboundedly.
export function syncSessionReplay() {
  if (Platform.OS === "web" || __DEV__) return sessionReplay;
  sessionReplay = sessionReplay
    .then(async () => {
      if (optedOut(Settings.optOutAnalytics)) {
        if (replayState !== "recording") return;
        replayState = "stopped";
        await LogRocket.shutdown();
      } else if (replayState === "idle") {
        const started = await LogRocket.init(
          "iltgzt/goodweebs",
          logRocketOptions(),
        );
        replayState = Boolean(started) ? "recording" : "stopped";
      }
    })
    .catch(() => {});
  return sessionReplay;
}

function logRocketOptions(): Parameters<typeof LogRocket.init>[1] {
  return {
    updateId: Updates.isEmbeddedLaunch ? null : Updates.updateId,
    expoChannel: Updates.channel,
    network: {
      // LogRocket records every request's headers into session
      // recordings. Without this, the AniList bearer token (~1-year
      // lifetime) on every GraphQL request is uploaded to a third
      // party — a leaked recording would be account takeover.
      requestSanitizer: (request) => {
        for (const header of Object.keys(request.headers)) {
          if (header.toLowerCase() === "authorization") {
            request.headers[header] = null;
          }
        }
        return request;
      },
    },
  };
}

function stopCrashReporting() {
  const client = Sentry.getClient();
  if (!client) return;
  client.getOptions().enabled = false;
  void Sentry.close();
}

export function setOptOut(key: OptOutKey, value: boolean) {
  localStorage.setItem(key.key, JSON.stringify(value));
  if (Platform.OS === "web") return;
  if (key === Settings.optOutCrashReporting) {
    if (value) stopCrashReporting();
    return;
  }
  // Resume next launch: a disabled dispatch can skip backlog while SDK retry gates are set.
  if (value) Observe.configure({ dispatchingEnabled: false });
  else void Observe.dispatchEvents().catch(() => {});
  void syncSessionReplay();
}

export function useOptOut(key: OptOutKey) {
  const [value, setValue] = useState(() => optedOut(key));
  return [
    value,
    (next: boolean) => {
      setOptOut(key, next);
      setValue(next);
    },
  ] as const;
}
