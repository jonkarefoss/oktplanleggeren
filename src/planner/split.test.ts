import { describe, expect, it } from "vitest";
import { formatFor, rotation3Teams, splitPlayers } from "./split";

describe("splitPlayers", () => {
  it.each([
    [14, [5, 5, 4]],
    [15, [5, 5, 5]],
    [16, [6, 5, 5]],
    [17, [6, 6, 5]],
    [18, [6, 6, 6]],
    [19, [7, 6, 6]],
    [20, [7, 7, 6]],
  ])("%i spillere på 3 baner gir %j", (n, expected) => {
    expect(splitPlayers(n, 3)).toEqual(expected);
  });

  it("summerer alltid til antall spillere", () => {
    for (let n = 8; n <= 24; n++) {
      for (const c of [1, 2, 3]) {
        const split = splitPlayers(n, c);
        expect(split.reduce((a, b) => a + b, 0)).toBe(n);
        expect(Math.max(...split) - Math.min(...split)).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("formatFor", () => {
  it.each([
    [3, "2 mot 1, roterer"],
    [4, "2 mot 2"],
    [5, "2 mot 2 + joker"],
    [6, "3 mot 3"],
    [7, "3 mot 3 + joker"],
    [8, "4 mot 4"],
  ])("%i spillere gir %s", (n, f) => {
    expect(formatFor(n)).toBe(f);
  });

  it("sier fra ved over 8", () => {
    expect(formatFor(9)).toMatch(/for mange/);
  });
});

describe("rotation3Teams", () => {
  it("roterer slik at hvert lag spiller to av tre kamper", () => {
    expect(rotation3Teams(4)).toEqual([
      ["A", "B"],
      ["B", "C"],
      ["C", "A"],
      ["A", "B"],
    ]);
    const counts: Record<string, number> = {};
    for (const pair of rotation3Teams(3)) for (const t of pair) counts[t] = (counts[t] ?? 0) + 1;
    expect(counts).toEqual({ A: 2, B: 2, C: 2 });
  });
});
