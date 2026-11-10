import * as SecureStore from "expo-secure-store";
import { useSyncExternalStore } from "react";

import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";
import { StorageKeys } from "yep/hooks/helpers";

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

export function continueAsGuest() {
  transition({ status: "guest" });
}

export async function signOut() {
  transition({ status: "signedOut" });
  localStorage.removeItem(StorageKeys.ANILIST_VIEWER_ID);
  await SecureStore.deleteItemAsync(ANILIST_ACCESS_TOKEN_STORAGE);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSession() {
  return useSyncExternalStore(subscribe, getSession);
}

export function useAccessToken() {
  const session = useSession();
  return {
    accessToken: session.status === "signedIn" ? session.token : undefined,
  };
}
