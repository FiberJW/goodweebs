import { useLocalSearchParams, useNavigation } from "expo-router";
import { fbs } from "fbtee";
import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DescriptionRenderer } from "yep/components/DescriptionRenderer";
import { EmptyState } from "yep/components/EmptyState";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { LikeButton } from "yep/components/PosterAndTitle/LikeButton";
import {
  GetCharacterDocument,
  useToggleFavoriteMutation,
  useGetCharacterQuery,
} from "yep/graphql/generated";
import { CharacterSkeleton } from "yep/screens/CharacterScreen/CharacterSkeleton";

export default function Character() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const characterId = parseInt(id, 10);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { loading, data, error } = useGetCharacterQuery({
    variables: { id: characterId },
    notifyOnNetworkStatusChange: true,
  });

  const [toggleFavorite] = useToggleFavoriteMutation();

  const character = data?.Character;

  // Set navigation title dynamically
  useEffect(() => {
    if (character?.name?.full) {
      navigation.setOptions({
        title: character.name.full,
      });
    }
  }, [character, navigation]);

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
                    try {
                      await toggleFavorite({
                        variables: {
                          characterId: character?.id,
                        },
                        refetchQueries: [
                          {
                            query: GetCharacterDocument,
                            variables: { id: characterId },
                          },
                        ],
                      });
                    } catch (error) {
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
