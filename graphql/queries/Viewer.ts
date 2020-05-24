import { gql } from "@apollo/client";

export const GetViewer = gql`
  query GetViewer {
    Viewer {
      id
      name
      avatar {
        large
        medium
      }
    }
  }
`;

export const GetGenres = gql`
  query GetGenres {
    GenreCollection
  }
`;
