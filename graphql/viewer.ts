import { graphql } from "yep/graphql/tada";

// Shared viewer query: read across the tab layout badge, profile, settings,
// notifications, the media-list screen, and details. Colocated here rather than
// in any single screen because it has no single owner.
export const GetViewer = graphql(`
  query GetViewer {
    Viewer {
      id
      name
      avatar {
        large
        medium
      }
      bannerImage
      unreadNotificationCount
      mediaListOptions {
        scoreFormat
      }
      options {
        titleLanguage
        staffNameLanguage
      }
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
  }
`);
