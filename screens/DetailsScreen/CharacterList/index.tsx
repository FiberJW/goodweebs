import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { FlatList } from "react-native-gesture-handler";

import { CharacterDataFragment } from "yep/graphql/generated";
import { RootStackParamList } from "yep/navigation";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

import { CharacterItem } from "./CharacterItem";

const Header = takimoto.Text({
  fontFamily: Manrope.semiBold,
  color: darkTheme.text,
  fontSize: 16,
  marginBottom: 8,
});

interface Properties {
  characters: CharacterDataFragment[];
  navigation: StackNavigationProp<RootStackParamList>;
}

export function CharacterList({
  characters,

  navigation,
}: Properties) {
  return (
    <>
      <Header>Characters</Header>
      <FlatList
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{ width: "100%", marginBottom: 16 }}
        contentContainerStyle={{ gap: 8 }}
        horizontal
        keyExtractor={(item) => `${item.id}`}
        data={characters}
        renderItem={({ item }) => {
          return <CharacterItem character={item} navigation={navigation} />;
        }}
      />
    </>
  );
}
