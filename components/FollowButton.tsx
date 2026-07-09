import { ApolloError, useApolloClient, useMutation } from "@apollo/client";
import { fbs } from "fbtee";
import React, { useRef } from "react";
import Toast from "react-native-root-toast";

import { Button } from "yep/components/Button";
import { ToggleUserFollow } from "yep/graphql/mutations";
import { darkTheme } from "yep/themes";
import { useAccessToken } from "yep/useAccessToken";

export function FollowButton({
  userId,
  isFollowing,
  isOwnProfile = false,
}: {
  userId: number;
  isFollowing: boolean;
  isOwnProfile?: boolean;
}) {
  const { accessToken } = useAccessToken();
  const { cache } = useApolloClient();
  const [toggleFollow, { loading }] = useMutation(ToggleUserFollow);
  // `loading` only disables the button after a re-render; this synchronous
  // guard stops a rapid double-tap from firing two toggles (which would land
  // on the opposite of the intended state).
  const inFlightRef = useRef(false);

  if (!accessToken || isOwnProfile) {
    return null;
  }

  const setCachedFollowState = (value: boolean) =>
    cache.modify({
      id: cache.identify({ __typename: "User", id: userId }),
      fields: { isFollowing: () => value },
    });

  return (
    <Button
      size="small"
      containerStyle={{ minWidth: 112 }}
      loading={loading}
      label={
        isFollowing
          ? String(fbs("Following", "Unfollow user button label"))
          : String(fbs("Follow", "Follow user button label"))
      }
      color={isFollowing ? darkTheme.button : darkTheme.selectedChipFill}
      labelColor={isFollowing ? darkTheme.text : darkTheme.textInverted}
      onPress={async () => {
        if (inFlightRef.current) return;
        inFlightRef.current = true;
        setCachedFollowState(!isFollowing);
        try {
          await toggleFollow({ variables: { userId } });
        } catch (error) {
          setCachedFollowState(isFollowing);
          console.error(error);
          // GraphQL errors and surviving 429s already toast via the client's
          // error link; this covers the silent plain-network drop (offline).
          const networkError =
            error instanceof ApolloError ? error.networkError : null;
          if (
            networkError &&
            (networkError as { statusCode?: number }).statusCode !== 429
          ) {
            Toast.show(
              "Couldn't update follow. Check your connection and try again.",
              {
                duration: Toast.durations.LONG,
                position: Toast.positions.TOP,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 0,
              },
            );
          }
        } finally {
          inFlightRef.current = false;
        }
      }}
    />
  );
}
