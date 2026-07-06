import {
  makeRedirectUri,
  AuthRequest,
  AuthRequestPromptOptions,
  AuthSessionResult,
} from "expo-auth-session";
import Constants from "expo-constants";
import { useState } from "react";

import { CLIENT_ID } from "yep/constants";

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

export function useAniListAuthRequest(): [
  AuthRequest | null,
  AuthSessionResult | null,
  (options?: AuthRequestPromptOptions) => Promise<AuthSessionResult>,
] {
  const [request] = useState(createAniListAuthRequest);
  const [result, setResult] = useState<AuthSessionResult | null>(null);

  async function promptAsync(options: AuthRequestPromptOptions = {}) {
    if (!request) {
      throw new Error(
        "Cannot prompt to authenticate until the request has finished loading.",
      );
    }
    const result = await request.promptAsync(
      { authorizationEndpoint: AniListURL },
      options,
    );
    setResult(result);
    return result;
  }

  return [request, result, promptAsync];
}
