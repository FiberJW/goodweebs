import { graphql } from "yep/graphql/tada";

// AniList enum types, derived from the schema via gql.tada. These replace the
// codegen `enumsAsTypes` string-literal unions (e.g. MediaType = "ANIME" | "MANGA").
// `graphql.scalar<"X">` type-checks and returns the enum's value union.
export type MediaType = ReturnType<typeof graphql.scalar<"MediaType">>;
export type MediaListStatus = ReturnType<typeof graphql.scalar<"MediaListStatus">>;
export type ScoreFormat = ReturnType<typeof graphql.scalar<"ScoreFormat">>;
export type MediaRelation = ReturnType<typeof graphql.scalar<"MediaRelation">>;
export type MediaStatus = ReturnType<typeof graphql.scalar<"MediaStatus">>;
export type MediaListSort = ReturnType<typeof graphql.scalar<"MediaListSort">>;
export type MediaFormat = ReturnType<typeof graphql.scalar<"MediaFormat">>;
