import { AuthRequest, makeRedirectUri } from "expo-auth-session";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { useSyncExternalStore } from "react";

import { ANILIST_ACCESS_TOKEN_STORAGE, CLIENT_ID } from "yep/constants";
import { StorageKeys } from "yep/hooks/helpers";

const AUTHORIZE_URL = `https://anilist.co/api/v2/oauth/authorize?client_id=${CLIENT_ID}&response_type=token`;

const appScheme = Array.isArray(Constants.expoConfig?.scheme)
  ? Constants.expoConfig?.scheme[0]
  : Constants.expoConfig?.scheme;

const redirectUri = makeRedirectUri({
  scheme: appScheme ?? (__DEV__ ? "goodweebs-dev" : "goodweebs"),
  path: "redirect",
});

export type Session =
  | { status: "checking" }
  | { status: "signedOut" }
  | { status: "guest" }
  | { status: "signedIn"; token: string };

let session: Session = { status: "checking" };
const listeners = new Set<() => void>();

function transition(next: Session) {
  session = next;
  listeners.forEach((listener) => listener());
}

export const sessionLoaded = SecureStore.getItemAsync(
  ANILIST_ACCESS_TOKEN_STORAGE,
)
  .catch(() => null)
  .then((token) =>
    transition(token ? { status: "signedIn", token } : { status: "signedOut" }),
  );

export function getSession() {
  return session;
}

export function getAccessToken() {
  return session.status === "signedIn" ? session.token : undefined;
}

export function canBrowse({ status }: Session) {
  return status === "signedIn" || status === "guest";
}

export async function signIn(token: string) {
  await SecureStore.setItemAsync(ANILIST_ACCESS_TOKEN_STORAGE, token);
  transition({ status: "signedIn", token });
}

export async function logInWithAniList() {
  const request = new AuthRequest({
    usePKCE: false,
    redirectUri,
    scopes: [],
    clientId: "",
  });
  request.url = AUTHORIZE_URL;
  const result = await request.promptAsync({
    authorizationEndpoint: AUTHORIZE_URL,
  });
  if (
    (result.type === "success" || result.type === "error") &&
    result.params.access_token
  ) {
    await signIn(result.params.access_token);
  }
}

export function continueAsGuest() {
  transition({ status: "guest" });
}

export async function signOut() {
  transition({ status: "signedOut" });
  localStorage.removeItem(StorageKeys.ANILIST_VIEWER_ID);
  await SecureStore.deleteItemAsync(ANILIST_ACCESS_TOKEN_STORAGE);
}

export function subscribeToSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSession() {
  return useSyncExternalStore(subscribeToSession, getSession);
}

export function useAccessToken() {
  const session = useSession();
  return {
    accessToken: session.status === "signedIn" ? session.token : undefined,
  };
}
