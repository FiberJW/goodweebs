import React from "react";
import { takimoto } from "yep/lib/takimoto";
import { Header } from "yep/components/Header";
import { useQuery } from "@apollo/react-hooks";
import { GetViewer } from "yep/graphql/queries/Viewer";
import { GetViewerQuery, GetViewerQueryVariables } from "yep/graphql/generated";

export function AnimeListScreen() {
  const { data } = useQuery<GetViewerQuery, GetViewerQueryVariables>(GetViewer);

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
