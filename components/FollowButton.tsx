import { useApolloClient, useMutation } from "@apollo/client";
import { fbs } from "fbtee";
import React from "react";

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
        setCachedFollowState(!isFollowing);
        try {
          await toggleFollow({ variables: { userId } });
        } catch (error) {
          setCachedFollowState(isFollowing);
          console.error(error);
        }
      }}
    />
  );
}
