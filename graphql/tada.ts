import { initGraphQLTada } from "gql.tada";

import type { introspection } from "yep/graphql/graphql-env";

// No custom scalars are selected yet; map one here if a field types as
// `unknown` (e.g. Json, CountryCode, FuzzyDateInt).
export const graphql = initGraphQLTada<{
  introspection: introspection;
}>();

export type { FragmentOf, ResultOf } from "gql.tada";
export { readFragment } from "gql.tada";
