import gql from "graphql-tag";

export const RemoveFromList = gql`
  mutation RemoveFromList($id: Int!) {
    DeleteMediaListEntry(id: $id) {
      deleted
    }
  }
`;
