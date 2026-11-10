import { describe, expect, test } from "bun:test";
import { parse, type FieldNode, type OperationDefinitionNode } from "graphql";

import { appendPage, pageContainerKey } from "./pagination";

const id = (entry: { id: number }) => entry.id;
const rows = (...ids: number[]) => ids.map((value) => ({ id: value }));

describe("appendPage", () => {
  test("page 1 replaces whatever was cached", () => {
    expect(appendPage(rows(1, 2), rows(9), 1, 2, id)).toEqual(rows(9));
  });

  test("the next page appends in order and drops repeated entries", () => {
    expect(appendPage(rows(1, 2), rows(2, 3), 2, 2, id)).toEqual(rows(1, 2, 3));
  });

  test("a stale deep page after a refresh is ignored", () => {
    expect(appendPage(rows(1, 2), rows(5, 6), 3, 2, id)).toEqual(rows(1, 2));
  });
});

function key(query: string, variables: Record<string, unknown> = {}) {
  const operation = parse(query).definitions[0] as OperationDefinitionNode;
  const field = operation.selectionSet.selections[0] as FieldNode;
  const args = Object.fromEntries(
    (field.arguments ?? []).map((arg) => [
      arg.name.value,
      arg.value.kind === "Variable"
        ? variables[arg.value.name.value]
        : (arg.value as { value: unknown }).value,
    ]),
  );
  return pageContainerKey(args, {
    typename: "Query",
    fieldName: "Page",
    field,
    variables,
  });
}

const activities = `query ($page: Int, $perPage: Int, $userId: Int, $isFollowing: Boolean) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { hasNextPage }
    activities(userId: $userId, isFollowing: $isFollowing, type: MEDIA_LIST) { __typename }
  }
}`;

describe("pageContainerKey", () => {
  test("feed scopes and the profile strip each get their own container", () => {
    const keys = [
      key(activities, { page: 1, perPage: 25, isFollowing: true }),
      key(activities, { page: 1, perPage: 25 }),
      key(activities, { page: 1, perPage: 25, userId: 42 }),
      key(activities, { page: 1, perPage: 10, userId: 42 }),
    ];
    expect(new Set(keys).size).toBe(4);
  });

  test("the page number never changes a container", () => {
    expect(key(activities, { page: 3, perPage: 25 })).toBe(
      key(activities, { page: 1, perPage: 25 }),
    );
  });

  test("user search, media search, trending and notifications never share", () => {
    const keys = [
      key(
        `query { Page(page: 1, perPage: 30) { users(search: "guts") { id } } }`,
      ),
      key(
        `query { Page(page: 1, perPage: 30) { media(search: "guts", type: ANIME) { id } } }`,
      ),
      key(`query { Page(page: 1, perPage: 30) { media(type: ANIME) { id } } }`),
      key(
        `query { Page(page: 1, perPage: 30) { notifications(resetNotificationCount: true) { __typename } } }`,
      ),
    ];
    expect(new Set(keys).size).toBe(4);
  });

  test("media lists key on their sort", () => {
    const list = (sort: string) =>
      key(
        `query ($sort: [MediaListSort]) { Page(page: 1, perPage: 50) { mediaList(userId: 42, type: ANIME, status: CURRENT, sort: $sort) { id } } }`,
        { sort: [sort] },
      );
    expect(list("SCORE_DESC")).not.toBe(list("UPDATED_TIME_DESC"));
  });
});
