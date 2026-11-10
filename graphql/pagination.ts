import {
  NetworkStatus,
  useQuery,
  type FieldPolicy,
  type OperationVariables,
  type Reference,
  type TypedDocumentNode,
  type WatchQueryFetchPolicy,
} from "@apollo/client";
import { storeKeyNameFromField } from "@apollo/client/utilities";
import { useEffect, useRef } from "react";

const PAGED_FIELDS = [
  "mediaList",
  "notifications",
  "activities",
  "users",
  "media",
] as const;

// Ceil, not floor: when AniList shifts an entry across a page boundary
// between fetches, dedupe nets fewer than perPage rows, and floor would
// re-request the same page forever.
function nextPageForCount(loaded: number, perPage: number): number {
  return Math.ceil(loaded / perPage) + 1;
}

type KeyArgsFunction = Extract<
  FieldPolicy["keyArgs"],
  (...args: never[]) => unknown
>;

export const pageContainerKey: KeyArgsFunction = (
  args,
  { field, variables },
) => {
  const { page: _page, ...containerArgs } = args ?? {};
  const lists = (field?.selectionSet?.selections ?? []).flatMap((selection) =>
    selection.kind === "Field" &&
    (PAGED_FIELDS as readonly string[]).includes(selection.name.value)
      ? [storeKeyNameFromField(selection, variables)]
      : [],
  );
  return JSON.stringify([containerArgs, ...lists]);
};

export function appendPage<T>(
  existing: readonly T[] | undefined,
  incoming: readonly T[],
  page: number,
  perPage: number,
  idOf: (entry: T) => unknown,
): readonly T[] {
  if (!existing || page <= 1) return incoming;
  if (page !== nextPageForCount(existing.length, perPage)) return existing;
  const seen = new Set(existing.map(idOf));
  return [...existing, ...incoming.filter((entry) => !seen.has(idOf(entry)))];
}

const pagedFieldPolicy: FieldPolicy<readonly Reference[]> = {
  keyArgs: false,
  merge: (existing, incoming, { variables, readField }) =>
    appendPage(
      existing,
      incoming,
      variables?.page ?? 1,
      variables?.perPage,
      (entry) => readField("id", entry),
    ),
};

export const pagedTypePolicies = {
  Query: { fields: { Page: { keyArgs: pageContainerKey, merge: true } } },
  Page: {
    fields: Object.fromEntries(
      PAGED_FIELDS.map((field) => [field, pagedFieldPolicy]),
    ),
  },
};

type PagedData = {
  Page?: { pageInfo?: { hasNextPage?: boolean | null } | null } | null;
};

export function usePaginatedQuery<
  TData extends PagedData,
  TVariables extends OperationVariables & { page: number; perPage: number },
  TItem,
>(
  query: TypedDocumentNode<TData, TVariables>,
  {
    variables,
    perPage,
    skip = false,
    fetchPolicy,
    items: selectItems,
  }: {
    variables: Omit<TVariables, "page" | "perPage">;
    perPage: number;
    skip?: boolean;
    fetchPolicy?: WatchQueryFetchPolicy;
    items: (
      page: NonNullable<TData["Page"]>,
    ) => readonly TItem[] | null | undefined;
  },
) {
  const result = useQuery(query, {
    variables: { ...variables, page: 1, perPage } as unknown as TVariables,
    skip,
    fetchPolicy,
    notifyOnNetworkStatusChange: true,
  });
  const page = result.data?.Page;
  const items = (page ? selectItems(page) : null) ?? [];
  const isRefetching = result.networkStatus === NetworkStatus.refetch;

  const stateRef = useRef({ loadedCount: 0, hasNextPage: false, isRefetching });
  const inFlightRef = useRef(false);
  useEffect(() => {
    stateRef.current = {
      loadedCount: items.length,
      hasNextPage: Boolean(page?.pageInfo?.hasNextPage),
      isRefetching,
    };
  });

  return {
    ...result,
    items,
    isInitialLoading: !skip && !result.data && !result.error,
    isRefetching,
    isFetchingMore: result.networkStatus === NetworkStatus.fetchMore,
    refresh() {
      result
        .refetch({ page: 1 } as unknown as Partial<TVariables>)
        .catch(() => {});
    },
    loadNextPage() {
      const state = stateRef.current;
      if (inFlightRef.current || state.isRefetching || !state.hasNextPage) {
        return;
      }
      inFlightRef.current = true;
      result
        .fetchMore({
          variables: {
            page: nextPageForCount(state.loadedCount, perPage),
          } as unknown as Partial<TVariables>,
        })
        .finally(() => {
          inFlightRef.current = false;
        })
        .catch(() => {});
    },
  };
}

export type PaginatedQuery = Pick<
  ReturnType<typeof usePaginatedQuery>,
  "isRefetching" | "isFetchingMore" | "refresh" | "loadNextPage"
>;
