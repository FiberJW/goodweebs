import * as SecureStore from "expo-secure-store";
import React, { useState, createContext, use, useEffect } from "react";

import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";

type AccessTokenContextValue = {
  accessToken?: string;
  checkedForToken: boolean;
  setAccessToken: (accountName?: string) => void;
};

const AccessTokenContext = createContext<AccessTokenContextValue | null>(null);

export function useAccessToken() {
  const context = use(AccessTokenContext);

  if (context === null) {
    throw new Error("useAccessToken must be used within a AccessTokenProvider");
  }

  return context;
}

export function AccessTokenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [checkedForToken, setCheckedForToken] = useState(false);

  useEffect(function fetchToken() {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(
          ANILIST_ACCESS_TOKEN_STORAGE
        );
        if (token) {
          setAccessToken(token);
        }
      } finally {
        setCheckedForToken(true);
      }
    })();
  });

  return (
    <AccessTokenContext
      value={{ accessToken, setAccessToken, checkedForToken }}
    >
      {children}
    </AccessTokenContext>
  );
}
