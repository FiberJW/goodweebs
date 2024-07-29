import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { StyleSheet, View, ScrollView, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DescriptionRenderer } from "yep/components/DescriptionRenderer";
import { EmptyState } from "yep/components/EmptyState";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { LikeButton } from "yep/components/PosterAndTitle/LikeButton";
import {
  refetchGetCharacterQuery,
  useToggleFavoriteMutation,
  useGetCharacterQuery,
} from "yep/graphql/generated";
import { RootStackParamList } from "yep/navigation";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

interface Properties {
  navigation: StackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, "Character">;
}

export function CharacterScreen({ route }: Properties) {
  const insets = useSafeAreaInsets();

  const { loading, data, error } = useGetCharacterQuery({
    variables: { id: route.params.id },
    notifyOnNetworkStatusChange: true,
  });

  const [toggleFavorite] = useToggleFavoriteMutation();

  const character = data?.Character;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      showsVerticalScrollIndicator={false}
    >
      {data ? (
        <>
          <Text style={styles.title} numberOfLines={5}>
            {character?.name?.full}
          </Text>
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
                          refetchGetCharacterQuery({ id: route.params.id }),
                        ],
                      });
                    } catch (error) {
                      console.error(error);
                      // TODO: toast this error
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
      ) : (
        !loading && error ? (
          <EmptyState
            title="Could not find character"
            description={`We ran into an unexpected error loading the requested character: ${error?.message}`}
          />
        ) : null
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  posterAndDescriptionContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  title: {
    color: darkTheme.text,
    fontFamily: Manrope.extraBold,
    fontSize: 31.25,
    marginBottom: 16,
  },
});
