import { beforeEach, describe, expect, mock, test } from "bun:test";

Object.assign(globalThis, { __DEV__: false });

const platform = { OS: "ios", select: (o: any) => o.ios ?? o.default };
mock.module("react-native", () => ({
  Platform: platform,
  useWindowDimensions: () => ({ width: 0, height: 0 }),
}));
mock.module("expo-modules-core", () => ({
  Platform: platform,
  CodedError: class CodedError extends Error {
    constructor(
      public code: string,
      message: string,
    ) {
      super(message);
    }
  },
}));
mock.module("expo-constants", () => ({
  default: {
    expoConfig: { scheme: "goodweebs" },
    executionEnvironment: "standalone",
  },
  ExecutionEnvironment: {
    Bare: "bare",
    Standalone: "standalone",
    StoreClient: "storeClient",
  },
}));
mock.module("expo-linking", () => ({
  createURL: (path: string, { scheme }: { scheme: string }) =>
    `${scheme}://${path}`,
}));
mock.module("expo-crypto", () => ({
  getRandomValues: (buffer: Uint8Array) => crypto.getRandomValues(buffer),
}));

type BrowserResult = { type: string; url?: string };
let respond: (authUrl: URL) => BrowserResult | Promise<BrowserResult>;
const openedUrls: URL[] = [];
mock.module("expo-web-browser", () => ({
  openAuthSessionAsync: async (startUrl: string) => {
    const authUrl = new URL(startUrl);
    openedUrls.push(authUrl);
    return respond(authUrl);
  },
  dismissAuthSession: () => {},
}));

const storedTokens: string[] = [];
mock.module("expo-secure-store", () => ({
  getItemAsync: async () => null,
  setItemAsync: async (_key: string, value: string) => {
    storedTokens.push(value);
  },
  deleteItemAsync: async () => {},
}));

const {
  logInWithAniList: login,
  getSession,
  sessionLoaded,
  signOut,
} = await import("./session");
await sessionLoaded;

const callback = (fragment: Record<string, string>) => ({
  type: "success",
  url: `goodweebs://redirect#${new URLSearchParams(fragment)}`,
});
const token = "dummy-access-token";

beforeEach(async () => {
  Object.assign(globalThis, { localStorage: { removeItem: () => {} } });
  await signOut();
  openedUrls.length = 0;
  storedTokens.length = 0;
});

describe("AniList login", () => {
  test("opens an implicit-grant URL bound to a fresh state", async () => {
    respond = () => ({ type: "cancel" });
    await login();
    await login();

    const [first, second] = openedUrls;
    expect(first.origin + first.pathname).toBe(
      "https://anilist.co/api/v2/oauth/authorize",
    );
    expect(first.searchParams.get("client_id")).toBe("3568");
    expect(first.searchParams.get("response_type")).toBe("token");
    expect(first.searchParams.has("redirect_uri")).toBe(false);
    expect(first.searchParams.has("code_challenge")).toBe(false);
    expect(first.searchParams.get("state")).toBeTruthy();
    expect(second.searchParams.get("state")).not.toBe(
      first.searchParams.get("state"),
    );
  });

  test("signs in when the callback echoes the request state", async () => {
    respond = (authUrl) =>
      callback({
        access_token: token,
        state: authUrl.searchParams.get("state")!,
      });
    await login();

    expect(storedTokens).toEqual([token]);
    expect(getSession()).toEqual({ status: "signedIn", token });
  });

  test.each([
    ["a wrong state", () => ({ access_token: token, state: "forged" })],
    ["no state", () => ({ access_token: token })],
    [
      "a provider error",
      (state: string) => ({
        access_token: token,
        state,
        error: "access_denied",
      }),
    ],
  ])("rejects a callback token with %s", async (_, fragment) => {
    respond = (authUrl) =>
      callback(fragment(authUrl.searchParams.get("state")!));
    await login();

    expect(storedTokens).toEqual([]);
    expect(getSession()).toEqual({ status: "signedOut" });
  });

  test("rejects a token replayed from an earlier attempt's state", async () => {
    respond = () => ({ type: "cancel" });
    await login();
    const earlierState = openedUrls[0].searchParams.get("state")!;

    respond = () => callback({ access_token: token, state: earlierState });
    await login();

    expect(storedTokens).toEqual([]);
    expect(getSession()).toEqual({ status: "signedOut" });
  });

  test("does not sign in from a second attempt while one is open", async () => {
    let finishFirst!: () => void;
    respond = (authUrl) =>
      new Promise((resolve) => {
        finishFirst = () =>
          resolve(
            callback({
              access_token: token,
              state: authUrl.searchParams.get("state")!,
            }),
          );
      });
    const first = login();
    await login();
    expect(storedTokens).toEqual([]);
    expect(getSession()).toEqual({ status: "signedOut" });

    finishFirst();
    await first;
    expect(storedTokens).toEqual([token]);
    expect(openedUrls).toHaveLength(1);
  });

  test.each(["cancel", "dismiss"])("does not sign in on %s", async (type) => {
    respond = () => ({ type });
    await login();

    expect(storedTokens).toEqual([]);
    expect(getSession()).toEqual({ status: "signedOut" });
  });
});
