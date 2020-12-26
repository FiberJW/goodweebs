import gql from "graphql-tag";

export const AnimeRelationFragment = gql`
  fragment AnimeRelationFragment on Media {
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

export const AnimeFragment = gql`
  fragment StreamingLinkData on MediaStreamingEpisode {
    title
    thumbnail
    url
    site
  }

  fragment MediaExternalLinkData on MediaExternalLink {
    id
    url
    site
  }

  fragment MediaTrailerData on MediaTrailer {
    id
    thumbnail
    site
  }

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
    trailer {
      ...MediaTrailerData
    }
    streamingEpisodes {
      ...StreamingLinkData
    }
    externalLinks {
      ...MediaExternalLinkData
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
          ...AnimeRelationFragment
        }
      }
    }
  }

  ${AnimeRelationFragment}
`;
