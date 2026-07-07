import * as SecureStore from "expo-secure-store";
import React, { useState, createContext, use, useEffect } from "react";

import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";
import { primeAccessToken } from "yep/graphql/client";

type AccessTokenContextValue = {
  accessToken: string | undefined;
  checkedForToken: boolean;
  setAccessToken: React.Dispatch<React.SetStateAction<string | undefined>>;
  /**
   * Guest mode: the user tapped "continue without logging in". In-memory only
   * (not persisted) so a cold launch returns them to the auth screen, matching
   * the previous behavior. Drives the Stack.Protected guard alongside the
   * token so guests can still browse the tabs.
   */
  continuedWithoutLogin: boolean;
  setContinuedWithoutLogin: React.Dispatch<React.SetStateAction<boolean>>;
};

const AccessTokenContext = createContext<AccessTokenContextValue | null>(null);

export function useAccessToken() {
  const value = use(AccessTokenContext);

  if (!value) {
    throw new Error("useAccessToken must be used within a AccessTokenProvider");
  }

  return value;
}

export function AccessTokenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [checkedForToken, setCheckedForToken] = useState(false);
  const [continuedWithoutLogin, setContinuedWithoutLogin] = useState(false);

  useEffect(function fetchToken() {
    SecureStore.getItemAsync(ANILIST_ACCESS_TOKEN_STORAGE)
      .then((token) => {
        // Prime even when null so the auth link's lazy read never has to
        // touch the Keychain again this session.
        primeAccessToken(token);
        if (token) {
          setAccessToken(token);
        }
      })
      .catch(() => {})
      .finally(() => {
        setCheckedForToken(true);
      });
  }, []);

  return (
    <AccessTokenContext
      // eslint-disable-next-line react-doctor/jsx-no-constructed-context-values -- React Compiler memoizes the value object
      value={{
        accessToken,
        checkedForToken,
        setAccessToken,
        continuedWithoutLogin,
        setContinuedWithoutLogin,
      }}
    >
      {children}
    </AccessTokenContext>
  );
}
