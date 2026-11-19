import { describe, expect, it } from "vitest";
import { bank } from "./generate";
import { findJargon, kidFacingTexts } from "./language";

describe("språk", () => {
  it("øvelsesbanken har ingen fagord i tekster til barna", () => {
    const hits = kidFacingTexts(bank)
      .map(({ where, text }) => ({ where, words: findJargon(text) }))
      .filter((h) => h.words.length > 0);
    expect(hits).toEqual([]);
  });

  it("finner fagord, også bøyd", () => {
    expect(findJargon("Skyt fra sonen")).toEqual(["sone"]);
    expect(findJargon("Lag overtall og avslutte")).toEqual(["avslutte", "overtall"]);
    expect(findJargon("Bruk svak hånd")).toEqual(["svak hånd"]);
  });

  it("reagerer ikke på ord som bare inneholder fagordet", () => {
    expect(findJargon("Alle personer kan forbinde seg")).toEqual([]);
    expect(findJargon("Stussen er borte")).toEqual(["stuss"]);
  });
});
