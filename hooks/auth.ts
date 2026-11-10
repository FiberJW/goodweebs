import { makeRedirectUri, AuthRequest } from "expo-auth-session";
import Constants from "expo-constants";
import { useState } from "react";

import { CLIENT_ID } from "yep/constants";
import { signIn } from "yep/session";

const appScheme = Array.isArray(Constants.expoConfig?.scheme)
  ? Constants.expoConfig?.scheme[0]
  : Constants.expoConfig?.scheme;

const redirectUri = makeRedirectUri({
  scheme: appScheme ?? (__DEV__ ? "goodweebs-dev" : "goodweebs"),
  path: "redirect",
});

const AniListURL = `https://anilist.co/api/v2/oauth/authorize?client_id=${CLIENT_ID}&response_type=token`;

function createAniListAuthRequest() {
  const request = new AuthRequest({
    usePKCE: false,
    redirectUri,
    scopes: [],
    clientId: "",
  });
  request.url = AniListURL;
  return request;
}

export function useAniListLogin() {
  const [request] = useState(createAniListAuthRequest);

  return async function login() {
    const result = await request.promptAsync({
      authorizationEndpoint: AniListURL,
    });
    if (
      (result.type === "success" || result.type === "error") &&
      result.params.access_token
    ) {
      await signIn(result.params.access_token);
    }
  };
}
