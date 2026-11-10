import { useQuery } from "@apollo/client";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { fbs } from "fbtee";
import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DescriptionRenderer } from "yep/components/DescriptionRenderer";
import { EmptyState } from "yep/components/EmptyState";
import { FavoriteButton } from "yep/components/FavoriteButton";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { graphql, readFragment } from "yep/graphql/tada";
import { useGetName } from "yep/graphql/viewer";
import { CharacterSkeleton } from "yep/screens/CharacterScreen/CharacterSkeleton";

const CharacterData = graphql(`
  fragment CharacterData on Character {
    id
    isFavourite
    name {
      full
      native
    }
    image {
      large
      medium
    }
    description
  }
`);

const GetCharacter = graphql(
  `
    query GetCharacter($id: Int) {
      Character(id: $id) {
        ...CharacterData
      }
    }
  `,
  [CharacterData],
);

export default function Character() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const characterId = parseInt(id, 10);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { loading, data, error } = useQuery(GetCharacter, {
    variables: { id: characterId },
    notifyOnNetworkStatusChange: true,
  });

  const getName = useGetName();

  const character = data?.Character
    ? readFragment(CharacterData, data.Character)
    : null;

  useEffect(() => {
    const name = getName(character?.name);
    if (name) {
      navigation.setOptions({ title: name });
    }
  }, [character, navigation, getName]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {!data ? (
        loading ? (
          <CharacterSkeleton />
        ) : error ? (
          <EmptyState
            title={String(
              fbs(
                "Could not find character",
                "Character not found error title",
              ),
            )}
            description={`${String(
              fbs(
                "We ran into an unexpected error loading the requested character:",
                "Character not found error description prefix",
              ),
            )} ${error?.message}`}
          />
        ) : null
      ) : (
        <>
          <View style={styles.posterAndDescriptionContainer}>
            <PosterAndTitle
              size="details"
              uri={character?.image?.large ?? ""}
              style={{ marginRight: 16 }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  padding: 8,
                }}
              >
                {character ? (
                  <FavoriteButton
                    target={{ characterId: character.id }}
                    isFavourite={Boolean(character.isFavourite)}
                  />
                ) : null}
              </View>
            </PosterAndTitle>
          </View>
          {character?.description ? (
            <DescriptionRenderer description={character.description} />
          ) : null}
        </>
      )}
      {/* Bottom spacer instead of dynamic contentContainerStyle padding: works on
          Android (contentInset is iOS-only) and avoids react-doctor's dynamic-padding rule. */}
      <View style={{ height: insets.bottom + 16 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  posterAndDescriptionContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
});
