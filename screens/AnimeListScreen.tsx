import React from "react";
import { takimoto } from "yep/lib/takimoto";
import { Header } from "yep/components/Header";
import { useQuery } from "@apollo/client";
import { GetViewer } from "yep/graphql/queries/Viewer";
import {
  GetViewerQueryResult,
  GetViewerQueryVariables,
} from "yep/graphql/generated";

export function AnimeListScreen() {
  const { data } = useQuery<GetViewerQueryResult, GetViewerQueryVariables>(
    GetViewer
  );

  console.log({ data });

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
