import { fbs } from "fbtee";
import React from "react";
import { Text, StyleSheet } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import type { CharacterListItemDataFragment } from "yep/graphql/generated";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

import { CharacterItem } from "./CharacterItem";

type Props = {
  characters: CharacterListItemDataFragment[];
};

function keyExtractor(item: CharacterListItemDataFragment) {
  return `${item.id}`;
}

function renderCharacterItem({ item }: { item: CharacterListItemDataFragment }) {
  return <CharacterItem character={item} />;
}

export function CharacterList({ characters }: Props) {
  return (
    <>
      <Text style={styles.header}>
        {String(fbs("Characters", "Characters section title"))}
      </Text>
      <FlatList
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{ width: "100%", marginBottom: 16 }}
        contentContainerStyle={{ gap: 8 }}
        horizontal
        keyExtractor={keyExtractor}
        data={characters}
        renderItem={renderCharacterItem}
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
