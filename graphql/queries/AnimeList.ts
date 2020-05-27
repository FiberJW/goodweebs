import gql from "graphql-tag";

import { AnimeFragment } from "yep/graphql/fragments/Anime";

export const GetAnimeList = gql`
  query GetAnimeList($userId: Int, $status: MediaListStatus) {
    MediaListCollection(userId: $userId, type: ANIME, status: $status) {
      lists {
        entries {
          id
          mediaId
          score
          progress
          media {
            ...AnimeFragment
          }
        }
      }
      hasNextChunk
    }
  }
  ${AnimeFragment}
`;
