import * as SecureStore from "expo-secure-store";
import React, { useState, createContext, use, useEffect } from "react";

import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";

const missingContext = Symbol("missingContext");

const AccessTokenContext = createContext<
  string | undefined | typeof missingContext
>(missingContext);
const CheckedForTokenContext = createContext<boolean | typeof missingContext>(
  missingContext,
);
const SetAccessTokenContext = createContext<
  React.Dispatch<React.SetStateAction<string | undefined>> | typeof missingContext
>(missingContext);

export function useAccessToken() {
  const accessToken = use(AccessTokenContext);
  const checkedForToken = use(CheckedForTokenContext);
  const setAccessToken = use(SetAccessTokenContext);

  if (
    accessToken === missingContext ||
    checkedForToken === missingContext ||
    setAccessToken === missingContext
  ) {
    throw new Error("useAccessToken must be used within a AccessTokenProvider");
  }

  return { accessToken, checkedForToken, setAccessToken };
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
    <SetAccessTokenContext value={setAccessToken}>
      <CheckedForTokenContext value={checkedForToken}>
        <AccessTokenContext value={accessToken}>{children}</AccessTokenContext>
      </CheckedForTokenContext>
    </SetAccessTokenContext>
  );
}
