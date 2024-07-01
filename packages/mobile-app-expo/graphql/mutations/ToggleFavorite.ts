import gql from "graphql-tag";

export const ToggleFavorite = gql`
  mutation ToggleFavorite($animeId: Int, $characterId: Int) {
    ToggleFavourite(animeId: $animeId, characterId: $characterId) {
      ...FavouritesData
    }
  }

  fragment FavouritesData on Favourites {
    anime {
      pageInfo {
        total
      }
    }
    characters {
      pageInfo {
        total
      }
    }
  }
`;
