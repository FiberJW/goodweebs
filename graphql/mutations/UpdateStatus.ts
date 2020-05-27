import gql from "graphql-tag";

export const UpdateStatus = gql`
  mutation UpdateStatus($id: Int, $status: MediaListStatus) {
    SaveMediaListEntry(id: $id, status: $status) {
      id
    }
  }
`;
