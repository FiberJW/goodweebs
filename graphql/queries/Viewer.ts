import gql from "graphql-tag";

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
