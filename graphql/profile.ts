import { graphql } from "yep/graphql/tada";

export const UserProfileFragment = graphql(`
  fragment UserProfileFragment on User @_unmask {
    id
    name
    isFollowing
    avatar {
      large
      medium
    }
    bannerImage
    favourites {
      anime {
        nodes {
          id
          title {
            english
            romaji
            native
          }
          coverImage {
            large
            medium
          }
        }
      }
      characters {
        nodes {
          id
          name {
            full
            native
          }
          image {
            large
            medium
          }
        }
      }
    }
    statistics {
      anime {
        count
        minutesWatched
      }
      manga {
        count
        chaptersRead
      }
    }
  }
`);
