import { ApolloClient, InMemoryCache, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { HttpLink } from "@apollo/client/link/http";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
import { persistCache, AsyncStorageWrapper } from "apollo3-cache-persist";
import Toast from "react-native-root-toast";

import { ANILIST_ACCESS_TOKEN_STORAGE } from "yep/constants";

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = await AsyncStorage.getItem(ANILIST_ACCESS_TOKEN_STORAGE);

  const Authorization = token ? `Bearer ${token}` : undefined;

  // return the headers to the context so httpLink can read them
  return Authorization
    ? {
        headers: {
          ...headers,
          Authorization,
        },
      }
    : // for some reason, the request gets messed up when Authorization is undefined, so just don't
      // specify the key at all
      {};
});

const httpLink = new HttpLink({
  uri: "https://graphql.anilist.co",
});

const cache = new InMemoryCache();

export async function createClient() {
  await persistCache({
    cache,
    storage: new AsyncStorageWrapper(AsyncStorage),
  });

  return new ApolloClient({
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.forEach(async (e) => {
            Sentry.captureMessage(e.message);

            console.error("[GraphQL error]:", e);

            if (e.message.toLowerCase().includes("invalid token")) {
              await AsyncStorage.removeItem(ANILIST_ACCESS_TOKEN_STORAGE);
              Toast.show("You've been logged out. Please log in again.", {
                duration: Toast.durations.LONG,
                position: Toast.positions.TOP,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 0,
              });
            } else {
              Toast.show(e.message, {
                duration: Toast.durations.LONG,
                position: Toast.positions.TOP,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 0,
              });
            }
          });
        if (networkError) {
          Sentry.captureException(networkError);
          console.error(`[Network error]: ${networkError}`);
        }
      }),
      authLink.concat(httpLink),
    ]),
    cache,
  });
}
