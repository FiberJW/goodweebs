import { describe, expect, test } from "bun:test";

import { getNotificationText } from "./notificationText";

describe("getNotificationText", () => {
  test("splices episode and title into airing contexts", () => {
    expect(
      getNotificationText(
        {
          __typename: "AiringNotification",
          episode: 5,
          contexts: ["Episode ", " of ", " aired."],
        },
        "Frieren",
      ),
    ).toBe("Episode 5 of Frieren aired.");
  });

  test("appends related-media context to the title", () => {
    expect(
      getNotificationText(
        {
          __typename: "RelatedMediaAdditionNotification",
          context: " was recently added to the site.",
        },
        "Frieren S2",
      ),
    ).toBe("Frieren S2 was recently added to the site.");
  });

  test("survives null contexts", () => {
    expect(
      getNotificationText(
        { __typename: "AiringNotification", episode: 2, contexts: null },
        "X",
      ),
    ).toBe("Episode 2 of X aired.");
  });
});
