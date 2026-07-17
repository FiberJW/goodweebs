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

export type ActivityFeedItem = ResultOf<typeof ActivityFeedFragment>;

// How many list activities the profile screens show (shared so the personal
// and public profile paths can't drift apart).
export const PROFILE_ACTIVITY_LIMIT = 10;

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
    // Callers select the fragment on every ListActivity member; the union's
    // other members only carry __typename, so this narrowing cast is safe.
    const listActivity = activity as unknown as ActivityFeedItem;
    return listActivity.user && listActivity.media ? [listActivity] : [];
  });
}
