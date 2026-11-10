import { useApolloClient, useMutation } from "@apollo/client";
import type { ApolloCache, Reference } from "@apollo/client";
import { Image } from "expo-image";
import { fbs } from "fbtee";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

import { favoritedBackground, notFavoritedBackground, white } from "yep/colors";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { graphql } from "yep/graphql/tada";
import { useViewer } from "yep/graphql/viewer";

const likedIcon = require("yep/assets/icons/favorite-24.png");
const notLikedIcon = require("yep/assets/icons/favorite-border-24.png");

const ToggleFavorite = graphql(`
  mutation ToggleFavorite($animeId: Int, $mangaId: Int, $characterId: Int) {
    ToggleFavourite(
      animeId: $animeId
      mangaId: $mangaId
      characterId: $characterId
    ) {
      anime {
        pageInfo {
          total
        }
      }
      characters {
        pageInfo {
          total
        }
      }
    }
  }
`);

type FavoriteTarget =
  | { animeId: number }
  | { mangaId: number }
  | { characterId: number };

type FavouritesShelves = {
  anime?: { nodes?: readonly Reference[] | null } | null;
  characters?: { nodes?: readonly Reference[] | null } | null;
} | null;

function applyFavoriteToCache(
  cache: ApolloCache<unknown>,
  viewerId: number | undefined,
  target: FavoriteTarget,
  isFavourite: boolean,
) {
  const isMedia = "animeId" in target || "mangaId" in target;
  const id =
    "animeId" in target
      ? target.animeId
      : "mangaId" in target
        ? target.mangaId
        : target.characterId;
  const __typename = isMedia ? "Media" : "Character";

  cache.modify({
    id: cache.identify({ __typename, id }),
    fields: { isFavourite: () => isFavourite },
  });

  if (!viewerId || "mangaId" in target) return;

  const shelf = "animeId" in target ? "anime" : "characters";
  cache.modify({
    id: cache.identify({ __typename: "User", id: viewerId }),
    fields: {
      favourites(
        existing: FavouritesShelves | Reference,
        { toReference, readField, isReference },
      ) {
        if (existing && isReference(existing)) return existing;
        const shelves = existing ?? {};
        const nodes = shelves[shelf]?.nodes ?? [];
        const without = nodes.filter((node) => readField("id", node) !== id);
        // AniList appends new favorites, so the optimistic order matches.
        const ref = toReference({ __typename, id });
        const nextNodes = isFavourite && ref ? [...without, ref] : without;
        return {
          ...shelves,
          [shelf]: { ...shelves[shelf], nodes: nextNodes },
        };
      },
    },
  });
}

export function FavoriteButton({
  target,
  isFavourite,
}: {
  target: FavoriteTarget;
  isFavourite: boolean;
}) {
  const [toggleFavorite] = useMutation(ToggleFavorite);
  const { cache } = useApolloClient();
  const viewerId = useViewer().viewer?.id;
  const [loadingForLiked, setLoadingForLiked] = useState<boolean | null>(null);
  const loading = loadingForLiked === isFavourite;

  async function toggle() {
    setLoadingForLiked(isFavourite);
    applyFavoriteToCache(cache, viewerId, target, !isFavourite);
    try {
      await toggleFavorite({ variables: target });
    } catch (error) {
      applyFavoriteToCache(cache, viewerId, target, isFavourite);
      console.error(error);
    }
    setLoadingForLiked(null);
  }

  return (
    <PressableOpacity
      borderRadius={8}
      accessibilityRole="button"
      accessibilityLabel={String(
        isFavourite
          ? fbs(
              "Remove from favorites",
              "Unfavorite button accessibility label",
            )
          : fbs("Add to favorites", "Favorite button accessibility label"),
      )}
      style={[
        styles.pressable,
        {
          backgroundColor: isFavourite
            ? favoritedBackground
            : notFavoritedBackground,
        },
      ]}
      onPress={toggle}
      activeOpacity={1}
    >
      {loading ? (
        <ActivityIndicator size="small" color={white} />
      ) : (
        <Image
          source={isFavourite ? likedIcon : notLikedIcon}
          style={styles.icon}
        />
      )}
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  icon: { height: 24, width: 24 },
  pressable: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    padding: 16,
    width: 48,
  },
});
