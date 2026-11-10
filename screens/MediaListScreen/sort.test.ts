import { describe, expect, test } from "bun:test";

import { mediaSortValue } from "./sort";

describe("mediaSortValue", () => {
  test("TITLE with no account preference follows the device locale", () => {
    expect(mediaSortValue("TITLE", "ASC", "ja_JP", null)).toBe(
      "MEDIA_TITLE_NATIVE",
    );
    expect(mediaSortValue("TITLE", "ASC", "en_US", null)).toBe(
      "MEDIA_TITLE_ENGLISH",
    );
    expect(mediaSortValue("TITLE", "ASC", undefined, undefined)).toBe(
      "MEDIA_TITLE_ENGLISH",
    );
  });

  test("TITLE follows the account preference over the locale, per direction", () => {
    expect(mediaSortValue("TITLE", "ASC", "en_US", "ROMAJI")).toBe(
      "MEDIA_TITLE_ROMAJI",
    );
    expect(mediaSortValue("TITLE", "DESC", "en_US", "NATIVE")).toBe(
      "MEDIA_TITLE_NATIVE_DESC",
    );
    expect(mediaSortValue("TITLE", "ASC", "ja_JP", "ENGLISH_STYLISED")).toBe(
      "MEDIA_TITLE_ENGLISH",
    );
  });

  test("other fields ignore locale and language", () => {
    expect(mediaSortValue("SCORE", "DESC", "ja_JP", "NATIVE")).toBe(
      "SCORE_DESC",
    );
  });
});
