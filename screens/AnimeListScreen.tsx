import { useQuery } from "@apollo/react-hooks";
import React, { useState } from "react";
import { Header } from "yep/components/Header";
import {
  GetViewerQuery,
  GetViewerQueryVariables,
  GetAnimeListQuery,
  GetAnimeListQueryVariables,
  MediaListStatus,
} from "yep/graphql/generated";
import { GetAnimeList } from "yep/graphql/queries/AnimeList";
import { GetViewer } from "yep/graphql/queries/Viewer";
import { takimoto } from "yep/lib/takimoto";
import { getString, StringCase } from "yep/strings";

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
      <Header label={getString("anime", StringCase.TITLE)} />
    </Container>
  );
}

const Container = takimoto.View({
  flex: 1,
  alignItems: "center",
});
