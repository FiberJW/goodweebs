import type { ApolloCache } from "@apollo/client";

import { graphql } from "yep/graphql/tada";
import type { ResultOf } from "yep/graphql/tada";

export const ActivityFeedFragment = graphql(`
  fragment ActivityFeedFragment on ListActivity @_unmask {
    id
    createdAt
    status
    progress
    user {
      id
      name
      avatar {
        medium
        large
      }
    }
    media {
      id
      title {
        romaji
        native
        english
      }
      coverImage {
        medium
        large
      }
    }
  }
`);

export const GetListActivityFeed = graphql(
  `
    query GetListActivityFeed(
      $page: Int!
      $perPage: Int!
      $userId: Int
      $isFollowing: Boolean
      $activityType: ActivityType!
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
        }
        activities(
          userId: $userId
          isFollowing: $isFollowing
          type: $activityType
          sort: ID_DESC
        ) {
          __typename
          ... on ListActivity {
            ...ActivityFeedFragment
          }
        }
      }
    }
  `,
  [ActivityFeedFragment],
);

export function forgetFollowingFeed(cache: ApolloCache<unknown>) {
  cache.modify({
    fields: {
      Page: (existing, { storeFieldName, DELETE }) =>
        storeFieldName.includes("isFollowing") ? DELETE : existing,
    },
  });
}

export type ActivityFeedItem = ResultOf<typeof ActivityFeedFragment>;

export type ListActivityAction =
  | "completed"
  | "dropped"
  | "pausedReading"
  | "pausedWatching"
  | "plansToRead"
  | "plansToWatch"
  | "readChapter"
  | "rereadChapter"
  | "rewatchedEpisode"
  | "updated"
  | "watchedEpisode";

// AniList sends these as English display strings rather than an enum. Collapse
// them to stable app values so every visible action can be localized, while an
// unknown future status still gets a safe generic label.
export function getListActivityAction(
  status: string | null | undefined,
): ListActivityAction {
  switch (status) {
    case "completed":
    case "dropped":
      return status;
    case "paused reading":
      return "pausedReading";
    case "paused watching":
      return "pausedWatching";
    case "plans to read":
      return "plansToRead";
    case "plans to watch":
      return "plansToWatch";
    case "read chapter":
      return "readChapter";
    case "reread chapter":
      return "rereadChapter";
    case "rewatched episode":
      return "rewatchedEpisode";
    case "watched episode":
      return "watchedEpisode";
    default:
      return "updated";
  }
}

// Shared normalization for every activities(...) query: keep only concrete
// ListActivity entries whose user and media survived (AniList allows both to
// be null, e.g. after moderation).
export function filterListActivities(
  activities:
    | readonly ({ __typename: string } | null | undefined)[]
    | null
    | undefined,
): ActivityFeedItem[] {
  return (activities ?? []).flatMap((activity) => {
    if (activity?.__typename !== "ListActivity") return [];
    const listActivity = activity as unknown as ActivityFeedItem;
    return listActivity.user && listActivity.media ? [listActivity] : [];
  });
}
