import { fbs } from "fbtee";
import React from "react";

import { MediaListScreen } from "yep/screens/MediaListScreen";

export function MangaScreen() {
  return (
    <MediaListScreen
      mediaType="MANGA"
      headerLabel={String(fbs("Manga", "Manga tab header label"))}
      loggedOutDescription={String(
        fbs(
          "Start tracking your manga by using an AniList account!",
          "Manga empty state login description",
        ),
      )}
      emptyListDescription={String(
        fbs(
          "Explore the world of manga by adding some series to your list!",
          "Manga empty state list description",
        ),
      )}
      discoverCtaLabel={String(
        fbs("Discover new manga", "Manga empty state discover call to action"),
      )}
    />
  );
}
