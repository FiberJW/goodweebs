import gql from "graphql-tag";

import { AnimeFragment } from "../fragments/Anime";

export const GetAnime = gql`
  query GetAnime($id: Int!) {
    Media(id: $id) {
      ...AnimeFragment
    }
  }
  ${AnimeFragment}
`;
