import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

const storage = new Map<string, string>();
const testStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};
Object.assign(globalThis, { __DEV__: false, localStorage: testStorage });

const platform = { OS: "ios" };
const calls: string[] = [];
const delivered: string[] = [];

const sentry = {
  client: null as null | { options: { enabled?: boolean } },
};
const observe = { dispatchingEnabled: true };
const logRocket = {
  active: false,
  pendingInit: null as null | (() => void),
  holdInit: false,
};

mock.module("react-native", () => ({
  Platform: platform,
  useWindowDimensions: () => ({ width: 0, height: 0 }),
}));
mock.module("expo-updates", () => ({
  isEmbeddedLaunch: true,
  updateId: null,
  channel: "test",
}));
mock.module("@sentry/react-native", () => ({
  init: (options: { enabled?: boolean }) => {
    calls.push("sentry.init");
    sentry.client = { options: { ...options } };
  },
  getClient: () =>
    sentry.client && { getOptions: () => sentry.client!.options },
  close: async () => {
    calls.push("sentry.close");
  },
  captureMessage: (message: string) => {
    const client = sentry.client;
    if (client && client.options.enabled !== false) {
      delivered.push(`sentry:${message}`);
    }
  },
}));
mock.module("expo-observe", () => ({
  Observe: {
    configure: (config: { dispatchingEnabled?: boolean }) => {
      calls.push(`observe.configure:${config.dispatchingEnabled}`);
      observe.dispatchingEnabled = config.dispatchingEnabled ?? true;
    },
    logEvent: (name: string) => {
      if (observe.dispatchingEnabled) delivered.push(`observe:${name}`);
    },
  },
}));
mock.module("@logrocket/react-native", () => ({
  default: {
    init: async (_appId: string, options: unknown) => {
      calls.push("logrocket.init");
      lastLogRocketOptions = options;
      if (logRocket.holdInit) {
        await new Promise<void>((resolve) => (logRocket.pendingInit = resolve));
      }
      logRocket.active = true;
      return true;
    },
    shutdown: async () => {
      calls.push("logrocket.shutdown");
      logRocket.active = false;
    },
    track: (name: string) => {
      if (logRocket.active) delivered.push(`logrocket:${name}`);
    },
  },
}));

let lastLogRocketOptions: unknown;

const { Settings } = await import("./storage");
type Telemetry = typeof import("./telemetry");
let app: Telemetry;
let launches = 0;
const setOptOut: Telemetry["setOptOut"] = (...args) => app.setOptOut(...args);
const startTelemetry = () => app.startTelemetry();
const syncSessionReplay = () => app.syncSessionReplay();
const Sentry = await import("@sentry/react-native");
const { Observe } = await import("expo-observe");
const LogRocket = (await import("@logrocket/react-native")).default;

const ANALYTICS = Settings.optOutAnalytics;
const CRASH = Settings.optOutCrashReporting;

function emitMarkers(tag: string) {
  Sentry.captureMessage(tag);
  Observe.logEvent(tag);
  LogRocket.track(tag);
}

async function relaunch() {
  app = await import(`./telemetry?launch=${++launches}`);
  const crashReportingStarted = startTelemetry();
  await syncSessionReplay();
  return crashReportingStarted;
}

async function launch(optOuts: { analytics?: boolean; crash?: boolean }) {
  storage.set(ANALYTICS.key, JSON.stringify(optOuts.analytics ?? false));
  storage.set(CRASH.key, JSON.stringify(optOuts.crash ?? false));
  return relaunch();
}

beforeEach(async () => {
  Object.assign(globalThis, { localStorage: testStorage });
  app = await import(`./telemetry?launch=${++launches}`);
  calls.length = 0;
  delivered.length = 0;
  sentry.client = null;
  observe.dispatchingEnabled = true;
  logRocket.holdInit = false;
  logRocket.active = false;
  platform.OS = "ios";
  Object.assign(globalThis, { __DEV__: false });
});

afterEach(async () => {
  platform.OS = "ios";
  Object.assign(globalThis, { __DEV__: false });
  logRocket.pendingInit?.();
  logRocket.pendingInit = null;
  storage.clear();
});

describe("startup", () => {
  test("starts every SDK when nothing is opted out", async () => {
    expect(await launch({})).toBe(true);
    emitMarkers("startup");
    expect(calls).toEqual([
      "sentry.init",
      "observe.configure:true",
      "logrocket.init",
    ]);
    expect(delivered).toEqual([
      "sentry:startup",
      "observe:startup",
      "logrocket:startup",
    ]);
  });

  test("persisted opt-outs keep every SDK quiet from launch", async () => {
    expect(await launch({ analytics: true, crash: true })).toBe(false);
    emitMarkers("startup");
    expect(calls).toEqual(["observe.configure:false"]);
    expect(delivered).toEqual([]);
  });

  test("session replay keeps the Authorization sanitizer", async () => {
    await launch({});
    const options = lastLogRocketOptions as {
      network: {
        requestSanitizer: (r: { headers: Record<string, unknown> }) => {
          headers: Record<string, unknown>;
        };
      };
    };
    expect(
      options.network.requestSanitizer({
        headers: { Authorization: "Bearer secret", Accept: "json" },
      }).headers,
    ).toEqual({ Authorization: null, Accept: "json" });
  });
});

describe("withdrawing consent without remounting", () => {
  test("analytics opt-out stops Observe dispatch and LogRocket recording", async () => {
    await launch({});
    setOptOut(ANALYTICS, true);
    await syncSessionReplay();
    emitMarkers("after");
    expect(calls.slice(3)).toEqual([
      "observe.configure:false",
      "logrocket.shutdown",
    ]);
    expect(delivered).toEqual(["sentry:after"]);
    expect(storage.get(ANALYTICS.key)).toBe("true");
  });

  test("crash reporting opt-out stops Sentry and leaves analytics alone", async () => {
    await launch({});
    setOptOut(CRASH, true);
    await syncSessionReplay();
    emitMarkers("after");
    expect(calls.slice(3)).toEqual(["sentry.close"]);
    expect(delivered).toEqual(["observe:after", "logrocket:after"]);
    expect(storage.get(CRASH.key)).toBe("true");
  });

  test("withdrawal during an in-flight LogRocket init shuts it down once it finishes", async () => {
    storage.set(ANALYTICS.key, "false");
    storage.set(CRASH.key, "false");
    logRocket.holdInit = true;
    startTelemetry();
    const started = syncSessionReplay();
    await new Promise((resolve) => setTimeout(resolve, 0));
    setOptOut(ANALYTICS, true);
    emitMarkers("during");
    logRocket.pendingInit!();
    await started;
    await syncSessionReplay();
    emitMarkers("after");
    expect(calls).toEqual([
      "sentry.init",
      "observe.configure:true",
      "logrocket.init",
      "observe.configure:false",
      "logrocket.shutdown",
    ]);
    expect(logRocket.active).toBe(false);
    expect(delivered).toEqual(["sentry:during", "sentry:after"]);
  });
});

describe("re-enabling", () => {
  test("analytics opted out at launch starts both SDKs live", async () => {
    await launch({ analytics: true });
    setOptOut(ANALYTICS, false);
    await syncSessionReplay();
    emitMarkers("after");
    expect(calls.slice(2)).toEqual([
      "observe.configure:true",
      "logrocket.init",
    ]);
    expect(delivered).toEqual([
      "sentry:after",
      "observe:after",
      "logrocket:after",
    ]);
  });

  test("crash reporting stays stopped until next launch, then starts", async () => {
    await launch({});
    setOptOut(CRASH, true);
    setOptOut(CRASH, false);
    emitMarkers("same-session");
    expect(calls.filter((c) => c.startsWith("sentry"))).toEqual([
      "sentry.init",
      "sentry.close",
    ]);
    expect(delivered).not.toContain("sentry:same-session");

    calls.length = 0;
    expect(await relaunch()).toBe(true);
    expect(calls).toContain("sentry.init");
  });

  test("rapid off/on/off/on resumes Observe live and LogRocket at next launch", async () => {
    await launch({});
    for (const value of [true, false, true, false]) {
      setOptOut(ANALYTICS, value);
      await syncSessionReplay();
    }
    emitMarkers("same-session");
    expect(calls.slice(3)).toEqual([
      "observe.configure:false",
      "logrocket.shutdown",
      "observe.configure:true",
      "observe.configure:false",
      "observe.configure:true",
    ]);
    expect(delivered).toEqual(["sentry:same-session", "observe:same-session"]);

    calls.length = 0;
    delivered.length = 0;
    await relaunch();
    emitMarkers("next-launch");
    expect(calls).toContain("logrocket.init");
    expect(delivered).toContain("logrocket:next-launch");
  });

  test("toggles queued before the SDK catches up apply only the last one", async () => {
    await launch({});
    setOptOut(ANALYTICS, true);
    setOptOut(ANALYTICS, false);
    setOptOut(ANALYTICS, true);
    await syncSessionReplay();
    emitMarkers("after");
    expect(calls.filter((c) => c.startsWith("logrocket"))).toEqual([
      "logrocket.init",
      "logrocket.shutdown",
    ]);
    expect(delivered).toEqual(["sentry:after"]);
  });
});

describe("guards", () => {
  test("web never touches the native SDKs but still persists the choice", async () => {
    platform.OS = "web";
    expect(await launch({})).toBe(false);
    setOptOut(ANALYTICS, true);
    setOptOut(CRASH, true);
    await syncSessionReplay();
    expect(calls).toEqual([]);
    expect(storage.get(ANALYTICS.key)).toBe("true");
    expect(storage.get(CRASH.key)).toBe("true");
  });

  test("dev builds never start LogRocket, even after re-enabling", async () => {
    Object.assign(globalThis, { __DEV__: true });
    await launch({ analytics: true });
    setOptOut(ANALYTICS, false);
    await syncSessionReplay();
    expect(calls).toEqual([
      "sentry.init",
      "observe.configure:false",
      "observe.configure:true",
    ]);
    expect(sentry.client?.options.enabled).toBe(false);
  });
});
