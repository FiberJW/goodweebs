import {
  makeRedirectUri,
  AuthRequest,
  AuthRequestPromptOptions,
  AuthSessionResult,
} from "expo-auth-session";
import { useEffect, useState, useCallback } from "react";

import { CLIENT_ID } from "yep/constants";

const IS_DEV = process.env.APP_VARIANT === "development";

const redirectUri = makeRedirectUri({
  scheme: IS_DEV ? "goodweebs-dev" : "goodweebs",
  path: "redirect",
});

export function useAniListAuthRequest(): [
  AuthRequest | null,
  AuthSessionResult | null,
  (options?: AuthRequestPromptOptions) => Promise<AuthSessionResult>
] {
  const [request, setRequest] = useState<AuthRequest | null>(null);
  const [result, setResult] = useState<AuthSessionResult | null>(null);

  const AniListURL = `https://anilist.co/api/v2/oauth/authorize?client_id=${CLIENT_ID}&response_type=token`;

  const promptAsync = useCallback(
    async (options: AuthRequestPromptOptions = {}) => {
      if (!request) {
        throw new Error(
          "Cannot prompt to authenticate until the request has finished loading."
        );
      }
      const result = await request?.promptAsync(
        { authorizationEndpoint: AniListURL },
        options
      );
      setResult(result);
      return result;
    },
    [request, AniListURL]
  );

  useEffect(() => {
    if (AniListURL) {
      const request = new AuthRequest({
        usePKCE: false,
        redirectUri,
        scopes: [],
        clientId: "",
      });
      request.url = AniListURL;
      setRequest(request);
    }
  }, [AniListURL]);

  return [request, result, promptAsync];
}
