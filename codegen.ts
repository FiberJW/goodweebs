import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://graphql.anilist.co",
  documents: "graphql/**/*.graphql",
  generates: {
    "graphql/generated.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
        {
          add: {
            placement: "append",
            content: [
              "",
              "export {",
              "  GetCharacterDocument,",
              "  RemoveFromListDocument,",
              "  UpdateProgressDocument,",
              "  UpdateScoreDocument,",
              "  UpdateStatusDocument,",
              "};",
              "",
              "export type {",
              "  AnimeFragmentFragment,",
              "  AnimeRelationFragmentFragment,",
              "  CharacterDataFragment,",
              "  FuzzyDate,",
              "  Maybe,",
              "  MediaExternalLinkDataFragment,",
              "  MediaListSort,",
              "  MediaListStatus,",
              "  MediaRelation,",
              "  MediaStatus,",
              "  MediaTitle,",
              "  MediaTrailerDataFragment,",
              "  MediaType,",
              "  RemoveFromListMutation,",
              "  RemoveFromListMutationVariables,",
              "  UpdateProgressMutation,",
              "  UpdateProgressMutationVariables,",
              "  UpdateScoreMutation,",
              "  UpdateScoreMutationVariables,",
              "  UpdateStatusMutation,",
              "  UpdateStatusMutationVariables,",
              "};",
            ].join("\n"),
          },
        },
      ],
      config: {
        enumsAsTypes: true,
        noExport: true,
        reactApolloVersion: 3,
        withRefetchFn: false,
      },
    },
    "./graphql.schema.json": {
      plugins: ["introspection"],
    },
  },
};

export default config;
