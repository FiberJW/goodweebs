import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { fbs } from "fbtee";
import React from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { FollowButton } from "yep/components/FollowButton";
import { ListFooterSpinner } from "yep/components/ListFooterSpinner";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { graphql, readFragment, type FragmentOf } from "yep/graphql/tada";
import { fakeHandle } from "yep/screenshotMode";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

export const UserSearchResultFragment = graphql(`
  fragment UserSearchResultFragment on User {
    id
    name
    isFollowing
    avatar {
      medium
      large
    }
    statistics {
      anime {
        count
      }
      manga {
        count
      }
    }
  }
`);

type UserResult = FragmentOf<typeof UserSearchResultFragment>;
type Props = {
  data: readonly UserResult[];
  searchTerm: string;
  viewerId?: number;
  loading: boolean;
  isFetchingMore: boolean;
  isRefetching: boolean;
  onEndReached: () => void;
  onRefresh: () => void;
};

function keyExtractor(item: UserResult) {
  return `${readFragment(UserSearchResultFragment, item).id}`;
}

function UserSearchRow({
  item,
  viewerId,
}: {
  item: UserResult;
  viewerId?: number;
}) {
  const router = useRouter();
  const user = readFragment(UserSearchResultFragment, item);

  return (
    <View style={styles.row}>
      <PressableOpacity
        accessibilityRole="link"
        accessibilityLabel={`${user.name}'s profile`}
        onPress={() => router.push(`/user/${user.id}`)}
        style={styles.profileLink}
      >
        <Image
          source={
            user.avatar
              ? { uri: user.avatar.medium ?? user.avatar.large }
              : require("yep/assets/icons/avatar-placeholder.png")
          }
          style={styles.avatar}
        />
        <View style={styles.textColumn}>
          <Text style={styles.username} numberOfLines={1}>
            {fakeHandle(user.name)}
          </Text>
          <Text style={styles.stats} numberOfLines={1}>
            {String(
              fbs(
                [
                  fbs.param(
                    "animeCount",
                    `${user.statistics?.anime?.count ?? 0}`,
                  ),
                  " anime · ",
                  fbs.param(
                    "mangaCount",
                    `${user.statistics?.manga?.count ?? 0}`,
                  ),
                  " manga",
                ],
                "User search result list counts",
              ),
            )}
          </Text>
        </View>
      </PressableOpacity>
      <View style={styles.followButton}>
        <FollowButton
          userId={user.id}
          isFollowing={Boolean(user.isFollowing)}
          isOwnProfile={user.id === viewerId}
        />
      </View>
    </View>
  );
}

export function DiscoverUserSearchResults({
  data,
  searchTerm,
  viewerId,
  loading,
  isFetchingMore,
  isRefetching,
  onEndReached,
  onRefresh,
}: Props) {
  function renderUser({ item }: { item: UserResult }) {
    return <UserSearchRow item={item} viewerId={viewerId} />;
  }

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <Text style={styles.listHeader}>
          {String(
            fbs(
              ["Search results for: ", fbs.param("searchTerm", searchTerm)],
              "User search results header",
            ),
          )}
        </Text>
      }
      data={data}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetchingMore ? <ListFooterSpinner /> : null}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListEmptyComponent={() =>
        loading ? null : (
          <EmptyState
            title={String(
              fbs("No users found", "No user search results title"),
            )}
            description={String(
              fbs(
                "Try another username or check the spelling.",
                "No user search results description",
              ),
            )}
          />
        )
      }
      // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop -- RefreshControl must be a live element; React Compiler memoizes it
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={onRefresh}
          tintColor={darkTheme.text}
          titleColor={darkTheme.text}
        />
      }
      keyExtractor={keyExtractor}
      renderItem={renderUser}
    />
  );
}

const styles = StyleSheet.create({
  avatar: { borderRadius: 24, height: 48, width: 48 },
  content: { gap: 8, paddingBottom: 16 },
  followButton: { minWidth: 96 },
  listHeader: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 20,
    marginBottom: 16,
  },
  profileLink: { alignItems: "center", flex: 1, flexDirection: "row", gap: 12 },
  row: {
    alignItems: "center",
    backgroundColor: darkTheme.listItemBackground,
    borderCurve: "continuous",
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  stats: {
    color: darkTheme.subText,
    fontFamily: Manrope.regular,
    fontSize: 12.8,
  },
  textColumn: { flex: 1, gap: 4 },
  username: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 16,
  },
});
