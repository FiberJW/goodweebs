import { describe, expect, test } from "bun:test";

import { getName, getTitle } from "./titleName";

const title = { romaji: "R", english: "E", native: "N" };

describe("getTitle", () => {
  test("no title is undefined", () => {
    expect(getTitle(null)).toBeUndefined();
  });

  test("account preference picks the matching field", () => {
    expect(getTitle(title, "en_US", "ROMAJI")).toBe("R");
    expect(getTitle(title, "en_US", "ENGLISH")).toBe("E");
    expect(getTitle(title, "en_US", "NATIVE")).toBe("N");
  });

  test("stylised variants collapse to their base field", () => {
    expect(getTitle(title, "en_US", "ROMAJI_STYLISED")).toBe("R");
    expect(getTitle(title, "en_US", "ENGLISH_STYLISED")).toBe("E");
    expect(getTitle(title, "en_US", "NATIVE_STYLISED")).toBe("N");
  });

  test("account preference wins over the device locale", () => {
    // ja_JP locale would give native; the ROMAJI account setting overrides it.
    expect(getTitle(title, "ja_JP", "ROMAJI")).toBe("R");
  });

  test("falls back down the chain when the preferred field is missing", () => {
    expect(getTitle({ romaji: null, english: "E", native: "N" }, "en_US", "ROMAJI")).toBe("E");
    expect(getTitle({ romaji: "R", english: null, native: null }, "en_US", "ENGLISH")).toBe("R");
  });

  test("no preference falls back to the device locale", () => {
    expect(getTitle(title, "ja_JP")).toBe("N");
    expect(getTitle(title, "en_US")).toBe("E");
  });
});

describe("getName", () => {
  test("no name is undefined", () => {
    expect(getName(null)).toBeUndefined();
  });

  test("native preference picks native, everything else picks full", () => {
    const name = { full: "Full", native: "ネイティブ" };
    expect(getName(name, "NATIVE")).toBe("ネイティブ");
    expect(getName(name, "ROMAJI")).toBe("Full");
    expect(getName(name, "ROMAJI_WESTERN")).toBe("Full");
    expect(getName(name)).toBe("Full");
  });

  test("native falls back to full when native is missing", () => {
    expect(getName({ full: "Full", native: null }, "NATIVE")).toBe("Full");
  });
});
