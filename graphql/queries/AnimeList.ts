import { gql } from "graphql-tag";

import { AnimeFragment } from "yep/graphql/fragments/Anime";

export const GetAnimeList = gql`
  query GetAnimeList(
    $userId: Int
    $status: MediaListStatus
    $sort: [MediaListSort]
  ) {
    MediaListCollection(
      userId: $userId
      type: ANIME
      status: $status
      sort: $sort
    ) {
      lists {
        status
        name
        entries {
          id
          mediaId
          progress
          status
          score(format: POINT_10)
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
