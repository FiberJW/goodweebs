import { useApolloClient, useQuery, useMutation } from "@apollo/client";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { fbs } from "fbtee";
import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DescriptionRenderer } from "yep/components/DescriptionRenderer";
import { EmptyState } from "yep/components/EmptyState";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { LikeButton } from "yep/components/PosterAndTitle/LikeButton";
import { applyFavoriteToCache, ToggleFavorite } from "yep/graphql/favorites";
import { graphql, readFragment } from "yep/graphql/tada";
import { CharacterSkeleton } from "yep/screens/CharacterScreen/CharacterSkeleton";
import { useGetName } from "yep/utils";

const CharacterData = graphql(`
  fragment CharacterData on Character {
    id
    isFavourite
    name {
      first
      last
      full
      native
      alternative
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

  const [toggleFavorite] = useMutation(ToggleFavorite);
  const { cache } = useApolloClient();
  const getName = useGetName();

  const character = data?.Character
    ? readFragment(CharacterData, data.Character)
    : null;

  // Set navigation title dynamically
  useEffect(() => {
    const name = getName(character?.name);
    if (name) {
      navigation.setOptions({ title: name });
    }
  }, [character, navigation, getName]);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {!data ? (
        loading ? (
          <CharacterSkeleton />
        ) : error ? (
          <EmptyState
            title={String(
              fbs("Could not find character", "Character not found error title"),
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
                <LikeButton
                  isLiked={Boolean(character?.isFavourite)}
                  onPress={async () => {
                    if (!character) return;
                    // Flip the heart (and patch the Profile shelf) in cache
                    // before the request so the tap feels instant; revert on
                    // failure. The global onError link already toasts.
                    const next = !character.isFavourite;
                    applyFavoriteToCache(
                      cache,
                      { characterId: character.id },
                      next,
                    );
                    try {
                      await toggleFavorite({
                        variables: { characterId: character.id },
                      });
                    } catch (error) {
                      applyFavoriteToCache(
                        cache,
                        { characterId: character.id },
                        !next,
                      );
                      console.error(error);
                    }
                  }}
                />
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
