import { describe, expect, test } from "bun:test";

import { getListActivityAction } from "./activity";

describe("getListActivityAction", () => {
  test("normalizes every AniList list-activity status", () => {
    expect(
      [
        "completed",
        "dropped",
        "paused reading",
        "paused watching",
        "plans to read",
        "plans to watch",
        "read chapter",
        "reread chapter",
        "rewatched episode",
        "watched episode",
      ].map(getListActivityAction),
    ).toEqual([
      "completed",
      "dropped",
      "pausedReading",
      "pausedWatching",
      "plansToRead",
      "plansToWatch",
      "readChapter",
      "rereadChapter",
      "rewatchedEpisode",
      "watchedEpisode",
    ]);
  });

  test("uses a localizable fallback for unknown or missing statuses", () => {
    expect(getListActivityAction("future status")).toBe("updated");
    expect(getListActivityAction(null)).toBe("updated");
  });
});
