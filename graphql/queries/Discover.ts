import gql from "graphql-tag";

import { AnimeFragment } from "yep/graphql/fragments/Anime";
import { MediaSeason } from "yep/graphql/generated";

function getSeason(month: number) {
  if (3 <= month && month <= 5) {
    return MediaSeason.Spring;
  }

  if (6 <= month && month <= 8) {
    return MediaSeason.Summer;
  }

  if (9 <= month && month <= 11) {
    return MediaSeason.Fall;
  }

  // Months 12, 01, 02
  return MediaSeason.Winter;
}

export const mediaSeason = getSeason(new Date().getMonth());

export const year = new Date().getUTCFullYear();

export const GetTrendingTVAnime = gql`
  query GetTrendingAnime(
    $season: MediaSeason
    $year: Int
    $page: Int = 1
    $perPage: Int = 20
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        total
      }
      media(
        season: $season
        seasonYear: $year
        format: TV
        isAdult: false
        type: ANIME
        sort: [TRENDING_DESC]
      ) {
        ...AnimeFragment
      }
    }
  }
  ${AnimeFragment}
`;

export const SearchAnime = gql`
  query SearchAnime($search: String) {
    Page {
      pageInfo {
        hasNextPage
        total
      }
      media(search: $search, format: TV, isAdult: false, type: ANIME) {
        ...AnimeFragment
      }
    }
  }
  ${AnimeFragment}
`;
