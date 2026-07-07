import { fbs } from "fbtee";
import React from "react";

import { MediaListScreen } from "yep/screens/MediaListScreen";

export function AnimeScreen() {
  return (
    <MediaListScreen
      mediaType="ANIME"
      headerLabel={String(fbs("Anime", "Anime tab header label"))}
      loggedOutDescription={String(
        fbs(
          "Start tracking your anime by using an AniList account!",
          "Anime empty state login description",
        ),
      )}
      emptyListDescription={String(
        fbs(
          "Explore the world of anime by adding some shows to your list!",
          "Anime empty state list description",
        ),
      )}
      discoverCtaLabel={String(
        fbs("Discover new anime", "Anime empty state discover call to action"),
      )}
    />
  );
}
