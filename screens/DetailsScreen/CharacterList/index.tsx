import React from "react";
import { Text, StyleSheet } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { CharacterDataFragment } from "yep/graphql/generated";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

import { CharacterItem } from "./CharacterItem";

type Props = {
  characters: CharacterDataFragment[];
};

export function CharacterList({ characters }: Props) {
  return (
    <>
      <Text style={styles.header}>Characters</Text>
      <FlatList
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{ width: "100%", marginBottom: 16 }}
        contentContainerStyle={{ gap: 8 }}
        horizontal
        keyExtractor={(item) => `${item.id}`}
        data={characters}
        renderItem={({ item }) => {
          return <CharacterItem character={item} />;
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    fontFamily: Manrope.semiBold,
    color: darkTheme.text,
    fontSize: 16,
    marginBottom: 8,
  },
});
