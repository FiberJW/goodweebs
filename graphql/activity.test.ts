import { InMemoryCache } from "@apollo/client";
import { describe, expect, test } from "bun:test";

import {
  GetListActivityFeed,
  forgetFollowingFeed,
  getListActivityAction,
} from "./activity";
import { pagedTypePolicies } from "./pagination";

describe("getListActivityAction", () => {
  test("normalizes every AniList list-activity status", () => {
    expect(
      [
        "completed",
        "dropped",
        "paused reading",
        "paused watching",
        "plans to read",
        "plans to watch",
        "read chapter",
        "reread chapter",
        "rewatched episode",
        "watched episode",
      ].map(getListActivityAction),
    ).toEqual([
      "completed",
      "dropped",
      "pausedReading",
      "pausedWatching",
      "plansToRead",
      "plansToWatch",
      "readChapter",
      "rereadChapter",
      "rewatchedEpisode",
      "watchedEpisode",
    ]);
  });

  test("uses a localizable fallback for unknown or missing statuses", () => {
    expect(getListActivityAction("future status")).toBe("updated");
    expect(getListActivityAction(null)).toBe("updated");
  });
});

describe("forgetFollowingFeed", () => {
  const activity = {
    __typename: "ListActivity" as const,
    id: 1,
    createdAt: 0,
    status: "completed",
    progress: null,
    user: { __typename: "User", id: 2, name: "a", avatar: null },
    media: {
      __typename: "Media",
      id: 3,
      title: { romaji: "r", native: null, english: null },
      coverImage: null,
    },
  };
  const variables = (isFollowing?: boolean) => ({
    page: 1,
    perPage: 25,
    isFollowing,
    activityType: "MEDIA_LIST" as const,
  });
  const write = (cache: InMemoryCache, isFollowing?: boolean) =>
    cache.writeQuery({
      query: GetListActivityFeed,
      variables: variables(isFollowing),
      data: {
        Page: {
          __typename: "Page",
          pageInfo: { __typename: "PageInfo", hasNextPage: false },
          activities: [activity],
        },
      } as never,
    });
  const read = (cache: InMemoryCache, isFollowing?: boolean) =>
    cache.readQuery({
      query: GetListActivityFeed,
      variables: variables(isFollowing),
    });

  test("drops the Following feed and keeps the global one", () => {
    const cache = new InMemoryCache({
      typePolicies: pagedTypePolicies,
      possibleTypes: { ActivityUnion: ["ListActivity"] },
    });
    write(cache, true);
    write(cache);
    forgetFollowingFeed(cache);
    expect(read(cache, true)).toBeNull();
    expect(read(cache)).not.toBeNull();
  });
});
