import gql from "graphql-tag";

export const UpdateScore = gql`
  mutation UpdateScore($id: Int, $scoreRaw: Int) {
    SaveMediaListEntry(id: $id, scoreRaw: $scoreRaw) {
      id
    }
  }
`;
