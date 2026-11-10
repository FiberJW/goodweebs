import { ApolloError, useApolloClient, useMutation } from "@apollo/client";
import { fbs } from "fbtee";
import React, { useRef } from "react";

import { Button } from "yep/components/Button";
import { forgetFollowingFeed } from "yep/graphql/activity";
import { graphql } from "yep/graphql/tada";
import { useViewer } from "yep/graphql/viewer";
import { darkTheme } from "yep/themes";
import { showToast } from "yep/toast";

const ToggleUserFollow = graphql(`
  mutation ToggleUserFollow($userId: Int!) {
    ToggleFollow(userId: $userId) {
      id
      isFollowing
    }
  }
`);

export function FollowButton({
  userId,
  isFollowing,
}: {
  userId: number;
  isFollowing: boolean;
}) {
  const { viewer } = useViewer();
  const { cache } = useApolloClient();
  const [toggleFollow, { loading }] = useMutation(ToggleUserFollow);
  const inFlightRef = useRef(false);

  if (!viewer || viewer.id === userId) {
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
          forgetFollowingFeed(cache);
        } catch (error) {
          setCachedFollowState(isFollowing);
          console.error(error);
          const networkError =
            error instanceof ApolloError ? error.networkError : null;
          if (
            networkError &&
            (networkError as { statusCode?: number }).statusCode !== 429
          ) {
            showToast(
              String(
                fbs(
                  "Couldn't update follow. Check your connection and try again.",
                  "Follow toggle network failure toast",
                ),
              ),
            );
          }
        }
        // Not a `finally` clause: the React Compiler can't compile those yet
        // (react-hooks-js/todo) and the catch above never rethrows.
        inFlightRef.current = false;
      }}
    />
  );
}
