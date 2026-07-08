import type { ApolloCache, Reference } from "@apollo/client";

import { graphql } from "yep/graphql/tada";
import { GetViewer } from "yep/graphql/viewer";

// Shared favorite toggle (details heart + character screen). The FavouritesData
// selection is inlined since no other operation reuses it; the result feeds
// AniList's server-side favourite counts, though the UI updates optimistically
// via applyFavoriteToCache below.
export const ToggleFavorite = graphql(`
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
  manga?: { nodes?: readonly Reference[] | null } | null;
  characters?: { nodes?: readonly Reference[] | null } | null;
} | null;

// Favoriting used to refetch the entire viewer (both favorites shelves plus
// statistics) after every heart tap — a full round-trip against AniList's
// rate-limited API just to flip one flag. Instead, write the flip into the
// cache directly: the entity's isFavourite drives the LikeButton, and the
// viewer's favourites shelf is patched so the Profile tab stays in sync.
// Callers apply this optimistically BEFORE the mutation and re-apply with the
// opposite value to revert if the server rejects (the same pattern as the
// progress stepper).
export function applyFavoriteToCache(
  cache: ApolloCache<unknown>,
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

  // Patch the Profile shelf. readQuery returns null if GetViewer was never
  // fully cached — safe to skip then, because the profile's cache-first query
  // will hit the network and come back correct anyway.
  const viewerId = cache.readQuery({
    query: GetViewer,
  })?.Viewer?.id;
  if (!viewerId) return;

  const shelf =
    "animeId" in target ? "anime" : "mangaId" in target ? "manga" : "characters";
  cache.modify({
    id: cache.identify({ __typename: "User", id: viewerId }),
    fields: {
      favourites(
        existing: FavouritesShelves | Reference,
        { toReference, readField, isReference },
      ) {
        // Favourites has no id, so it's always embedded — but the Modifier
        // type still requires handling the Reference case.
        if (existing && isReference(existing)) return existing;
        const shelves = existing ?? {};
        const nodes = shelves[shelf]?.nodes ?? [];
        const without = nodes.filter((node) => readField("id", node) !== id);
        // Append on favorite — AniList adds new favorites at the end of the
        // list, so the optimistic order matches the next real fetch.
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
