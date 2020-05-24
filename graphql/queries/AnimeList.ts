import gql from "graphql-tag";

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
            id
            title {
              romaji
              english
              native
              userPreferred
            }
            type
            format
            status
            description
            endDate {
              year
              month
              day
            }
            startDate {
              year
              month
              day
            }
            episodes
            coverImage {
              extraLarge
              large
              medium
              color
            }
            bannerImage
            nextAiringEpisode {
              id
            }
          }
        }
      }
      hasNextChunk
    }
  }
`;
