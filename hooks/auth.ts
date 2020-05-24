import {
  makeRedirectUri,
  AuthRequest,
  AuthRequestPromptOptions,
  AuthSessionResult,
} from "expo-auth-session";
import Constants from "expo-constants";
import { useEffect, useState, useCallback } from "react";
import { AniListClientID } from "yep/constants";

const redirectUri = makeRedirectUri({
  native: "goodweebs://redirect",
  useProxy: Constants.isDevice,
});

export function useAniListAuthRequest({
  clientID,
}: {
  clientID: AniListClientID;
}): [
  AuthRequest | null,
  AuthSessionResult | null,
  (options?: AuthRequestPromptOptions) => Promise<AuthSessionResult>
] {
  const [request, setRequest] = useState<AuthRequest | null>(null);
  const [result, setResult] = useState<AuthSessionResult | null>(null);

  const AniListURL = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientID}&response_type=token`;

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
    [request?.url, AniListURL]
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
