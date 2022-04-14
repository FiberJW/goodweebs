import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, createContext, useContext, useEffect } from "react";

import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";

type AccessTokenContextValue = {
  accessToken?: string;
  checkedForToken: boolean;
  setAccessToken: (accountName?: string) => void;
};

const AccessTokenContext = createContext<AccessTokenContextValue | null>(null);

export function useAccessToken() {
  const context = useContext(AccessTokenContext);

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
        const token = await AsyncStorage.getItem(ANILIST_ACCESS_TOKEN_STORAGE);
        if (token) {
          setAccessToken(token);
        }
      } finally {
        setCheckedForToken(true);
      }
    })();
  });

  return (
    <AccessTokenContext.Provider
      value={{ accessToken, setAccessToken, checkedForToken }}
    >
      {children}
    </AccessTokenContext.Provider>
  );
}
