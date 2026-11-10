import { graphql } from "yep/graphql/tada";

export type MediaType = ReturnType<typeof graphql.scalar<"MediaType">>;
export type MediaListStatus = ReturnType<
  typeof graphql.scalar<"MediaListStatus">
>;
export type ScoreFormat = ReturnType<typeof graphql.scalar<"ScoreFormat">>;
export type MediaRelation = ReturnType<typeof graphql.scalar<"MediaRelation">>;
export type MediaStatus = ReturnType<typeof graphql.scalar<"MediaStatus">>;
export type MediaListSort = ReturnType<typeof graphql.scalar<"MediaListSort">>;
export type UserTitleLanguage = ReturnType<
  typeof graphql.scalar<"UserTitleLanguage">
>;
export type UserStaffNameLanguage = ReturnType<
  typeof graphql.scalar<"UserStaffNameLanguage">
>;
