import React, { useState } from "react";
import { takimoto } from "yep/lib/takimoto";
import { Header } from "yep/components/Header";
import { useQuery } from "@apollo/react-hooks";
import { GetViewer } from "yep/graphql/queries/Viewer";
import {
  GetViewerQuery,
  GetViewerQueryVariables,
  GetAnimeListQuery,
  GetAnimeListQueryVariables,
  MediaListStatus,
} from "yep/graphql/generated";
import { GetAnimeList } from "yep/graphql/queries/AnimeList";

export function AnimeListScreen() {
  const [status, setStatus] = useState<MediaListStatus>(
    MediaListStatus.Current
  );
  const { loading: loadingViewer, data: viewerData } = useQuery<
    GetViewerQuery,
    GetViewerQueryVariables
  >(GetViewer);

  const { loading: loadingAnimeList, data: animeListData } = useQuery<
    GetAnimeListQuery,
    GetAnimeListQueryVariables
  >(GetAnimeList, {
    skip: !viewerData?.Viewer?.id,
    variables: {
      userId: viewerData?.Viewer?.id,
      status,
    },
  });

  console.log({ loadingViewer, loadingAnimeList, viewerData, animeListData });

  return (
    <Container>
      <Header label="Anime" />
    </Container>
  );
}

const Container = takimoto.View({
  flex: 1,
  alignItems: "center",
});
