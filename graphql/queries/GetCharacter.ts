import gql from "graphql-tag";

import { CharacterData } from "../fragments/Character";

export const GetCharacter = gql`
  query GetCharacter($id: Int) {
    Character(id: $id) {
      ...CharacterData
    }
  }
  ${CharacterData}
`;
