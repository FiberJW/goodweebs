import * as SecureStore from "expo-secure-store";
import React, { useState, createContext, use, useEffect } from "react";

import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";

type AccessTokenContextValue = {
  accessToken: string | undefined;
  checkedForToken: boolean;
  setAccessToken: React.Dispatch<React.SetStateAction<string | undefined>>;
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

  useEffect(function fetchToken() {
    SecureStore.getItemAsync(ANILIST_ACCESS_TOKEN_STORAGE)
      .then((token) => {
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
    // eslint-disable-next-line react-doctor/jsx-no-constructed-context-values -- React Compiler memoizes the value object
    <AccessTokenContext value={{ accessToken, checkedForToken, setAccessToken }}>
      {children}
    </AccessTokenContext>
  );
}
