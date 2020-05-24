import { useQuery } from "@apollo/react-hooks";
import React, { useState } from "react";
import { Header } from "yep/components/Header";
import { StatusChip } from "yep/components/StatusChip";
import { STATUSES } from "yep/constants";
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
      <StatusChipList
        horizontal
        data={STATUSES}
        ItemSeparatorComponent={StatusChipListDivider}
        keyExtractor={({ label }) => label}
        renderItem={({ item: { label, value } }) => (
          <StatusChip
            label={label}
            key={label}
            onPress={() => setStatus(value)}
            isSelected={status === value}
          />
        )}
      />
    </Container>
  );
}

const Container = takimoto.View({
  flex: 1,
  alignItems: "center",
});

const StatusChipList = takimoto.FlatList<{
  label: string;
  value: MediaListStatus;
}>(
  {
    margin: 16,
  },
  {
    alignItems: "flex-start",
  }
);

const StatusChipListDivider = takimoto.View({ width: 4 });
