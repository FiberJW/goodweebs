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
    mediaListEntry {
      progress
      status
      score(format: POINT_10)
      id
    }
    relations {
      edges {
        id
        relationType
        node {
          ...AnimeRelation
        }
      }
    }
  }

  fragment AnimeRelation on Media {
    id
    title {
      romaji
      native
      english
    }
    type
    format
    coverImage {
      large
      medium
      color
    }
  }
`;
