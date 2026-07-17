import { UserProfileFragment } from "yep/graphql/profile";
import { graphql } from "yep/graphql/tada";

// Shared viewer query: read across profile, the feed's notification badge,
// settings, media lists, and details. It has no single screen owner.
export const GetViewer = graphql(
  `
    query GetViewer {
      Viewer {
        ...UserProfileFragment
        unreadNotificationCount
        mediaListOptions {
          scoreFormat
        }
        options {
          titleLanguage
          staffNameLanguage
        }
      }
    }
  `,
  [UserProfileFragment],
);
