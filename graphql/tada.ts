import { initGraphQLTada } from "gql.tada";

import type { introspection } from "yep/graphql/graphql-env";

// Central gql.tada instance, wired to the AniList schema introspection.
// `graphql()` here returns a TadaDocumentNode (a TypedDocumentNode) that Apollo's
// useQuery/useMutation consume directly. No custom scalars are selected by any
// operation, so `scalars` is empty — add a mapping here only if a field starts
// typing as `unknown` (e.g. Json, CountryCode, FuzzyDateInt).
export const graphql = initGraphQLTada<{
  introspection: introspection;
}>();

export type { FragmentOf, ResultOf, VariablesOf } from "gql.tada";
export { readFragment } from "gql.tada";
