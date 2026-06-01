const fs = require("fs");

const generatedPath = "graphql/generated.ts";
const localMutationHooks = [
  "useRemoveFromListMutation",
  "useUpdateProgressMutation",
  "useUpdateScoreMutation",
  "useUpdateStatusMutation",
];
const localMutationHookExportRegex = new RegExp(
  `export function (${localMutationHooks.join("|")})\\b`,
  "g",
);
const fragmentDocumentExportRegex =
  /export const ([A-Za-z0-9_]+FragmentDoc\b)/g;
const lazyOrSuspenseHookExportRegex =
  /export function (use[A-Za-z]+(?:LazyQuery|SuspenseQuery)\b)/g;

let source = fs.readFileSync(generatedPath, "utf8");

source = source.replace(localMutationHookExportRegex, "function $1");
source = source.replace(fragmentDocumentExportRegex, "const $1");
source = source.replace(lazyOrSuspenseHookExportRegex, "function $1");

fs.writeFileSync(generatedPath, source);
