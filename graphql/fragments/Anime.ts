import gql from "graphql-tag";

export const AnimeFragment = gql`
  fragment AnimeFragment on Media {
    id
    title {
      romaji
      native
      english
    }
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    status
    genres
    duration
    episodes
    description
    averageScore
    coverImage {
      large
      medium
      color
    }
    nextAiringEpisode {
      id
      airingAt
      episode
      timeUntilAiring
    }
  }
`;
