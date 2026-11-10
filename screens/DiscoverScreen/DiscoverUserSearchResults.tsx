import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { fbs } from "fbtee";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { FollowButton } from "yep/components/FollowButton";
import { PagedList } from "yep/components/PagedList";
import { PressableOpacity } from "yep/components/PressableOpacity";
import type { PaginatedQuery } from "yep/graphql/pagination";
import { graphql, readFragment, type FragmentOf } from "yep/graphql/tada";
import { fakeHandle } from "yep/screenshotMode";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { notEmpty } from "yep/utils";

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
  title: string;
  results: PaginatedQuery & { items: readonly (UserResult | null)[] };
};

function keyExtractor(item: UserResult) {
  return `${readFragment(UserSearchResultFragment, item).id}`;
}

function UserSearchRow({ item }: { item: UserResult }) {
  const router = useRouter();
  const user = readFragment(UserSearchResultFragment, item);
  const avatarUrl = user.avatar?.medium ?? user.avatar?.large;

  return (
    <View style={styles.row}>
      <PressableOpacity
        accessibilityRole="link"
        accessibilityLabel={String(
          fbs(
            [fbs.param("username", user.name), "'s profile"],
            "User profile link accessibility label",
          ),
        )}
        onPress={() => router.push(`/user/${user.id}`)}
        style={styles.profileLink}
      >
        <Image
          source={
            // Nullish sizes inside a non-null avatar object still need the
            // placeholder — { uri: null } renders a broken image.
            avatarUrl
              ? { uri: avatarUrl }
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
      <FollowButton userId={user.id} isFollowing={Boolean(user.isFollowing)} />
    </View>
  );
}

function renderUser({ item }: { item: UserResult }) {
  return <UserSearchRow item={item} />;
}

export function DiscoverUserSearchResults({ title, results }: Props) {
  return (
    <PagedList
      paging={results}
      showsVerticalScrollIndicator
      contentContainerStyle={styles.content}
      ListHeaderComponent={<Text style={styles.listHeader}>{title}</Text>}
      data={results.items.filter(notEmpty)}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListEmptyComponent={
        <EmptyState
          title={String(fbs("No users found", "No user search results title"))}
          description={String(
            fbs(
              "Try another username or check the spelling.",
              "No user search results description",
            ),
          )}
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
