import { graphql, type FragmentOf } from "yep/graphql/tada";

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

export type UserSearchResult = FragmentOf<typeof UserSearchResultFragment>;
