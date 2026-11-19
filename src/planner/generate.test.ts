import { describe, expect, it } from "vitest";
import { WARN_SMALL_GOAL, WARN_TIP_OVER } from "./equipment";
import { bank, courtFits, generateSession } from "./generate";
import type { Inventory, SessionInput } from "./types";

const fullInventory: Inventory = {
  baller: 30,
  handballmal: 6,
  have: {
    "fotballmal-lite": true,
    matte: true,
    benk: true,
    kjegler: true,
    "vester-2-farger": true,
    "vester-3-farger": true,
    tape: true,
    fløyte: true,
  },
};

const base: SessionInput = {
  players: 16,
  oneAdult: false,
  courts: 3,
  hall: "halv",
  inventory: fullInventory,
  minutes: 60,
  theme: "1-mot-1",
};

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe("60-minuttersmal (5.3, justert)", () => {
  const s = generateSession(base);

  it("har samme struktur og tider som malen", () => {
    expect(s.blocks.map((b) => [b.start, b.end, b.label])).toEqual([
      [0, 8, "Oppvarming"],
      [8, 10, "Pause og forklaring"],
      [10, 22, "Stasjoner"],
      [22, 37, "Spill"],
      [37, 39, "Drikkepause"],
      [39, 54, "Kamp"],
      [54, 57, "Spillernes valg"],
      [57, 60, "Samling"],
    ]);
  });

  it("velger de samme øvelsene som malen", () => {
    const ex = (id: string) => s.blocks.find((b) => b.id === id)!.courts.map((c) => c.exerciseId);
    expect(ex("oppvarming")).toEqual(["stjel-ballen"]);
    expect(ex("stasjoner")).toEqual(["1-mot-1-korridor", "2-mot-1", "skudd-med-valg"]);
    expect(ex("spill")).toEqual(["3-mot-3-regelkort", "3-mot-3-regelkort", "3-mot-3-regelkort"]);
    expect(ex("kamp")).toEqual(["kamp-korte-sett", "kamp-korte-sett", "kamp-korte-sett"]);
    expect(ex("valg")).toEqual(["3-mot-3-regelkort", "3-mot-3-regelkort", "3-mot-3-regelkort"]);
  });

  it("fordeler spillerne 6-5-5 med riktig format", () => {
    const spill = s.blocks.find((b) => b.id === "spill")!;
    expect(spill.courts.map((c) => [c.players, c.format])).toEqual([
      [6, "3 mot 3"],
      [5, "2 mot 2 + joker"],
      [5, "2 mot 2 + joker"],
    ]);
    expect(s.blocks.find((b) => b.id === "stasjoner")!.rotate).toBe(true);
  });

  it("har god andel spill med motstander og ingen advarsler", () => {
    expect(s.playMinutes).toBe(8 + 9 + 12 + 12 + 3);
    expect(s.opponentShare).toBeGreaterThanOrEqual(0.6);
    expect(s.warnings).toEqual([]);
    expect(s.blocks.flatMap((b) => [...b.warnings, ...b.courts.flatMap((c) => c.warnings)])).toEqual([]);
  });
});

describe("tidsbudsjett", () => {
  it.each([60, 75, 90] as const)("%i min: blokkene går opp, uten hull, og har nok drikkepauser", (minutes) => {
    const s = generateSession({ ...base, minutes });
    expect(s.blocks[0].start).toBe(0);
    expect(s.blocks.at(-1)!.end).toBe(minutes);
    for (let i = 1; i < s.blocks.length; i++) expect(s.blocks[i].start).toBe(s.blocks[i - 1].end);
    expect(sum(s.blocks.map((b) => b.end - b.start))).toBe(minutes);
    expect(s.blocks.filter((b) => b.kind === "pause")).toHaveLength(minutes === 60 ? 2 : 3);
    expect(s.warnings).toEqual([]);
  });

  it("forlenger spill og kamp, ikke stasjonene", () => {
    const stations = (m: 60 | 75 | 90) =>
      generateSession({ ...base, minutes: m }).blocks.find((b) => b.id === "stasjoner")!;
    expect(stations(75).end - stations(75).start).toBe(12);
    expect(stations(90).end - stations(90).start).toBe(12);
  });
});

describe("utstyr", () => {
  it("uten håndballmål foreslås erstatning og sikkerhetspåminnelse", () => {
    const s = generateSession({ ...base, inventory: { ...fullInventory, handballmal: 0 } });
    const kamp = s.blocks.find((b) => b.id === "kamp")!;
    for (const c of kamp.courts) {
      expect(c.equipmentUsed).toContain("fotballmal-lite");
      expect(c.warnings).toContain(WARN_TIP_OVER);
      expect(c.warnings).toContain(WARN_SMALL_GOAL);
    }
  });

  it("bruker håndballmål der de finnes, og erstatning på resten", () => {
    const s = generateSession({ ...base, inventory: { ...fullInventory, handballmal: 2 } });
    const kamp = s.blocks.find((b) => b.id === "kamp")!;
    expect(kamp.courts.map((c) => c.equipmentUsed.includes("handballmal"))).toEqual([true, false, false]);
  });

  it("bare matte som erstatning: ingen veltepåminnelse, men felt foran målet", () => {
    const s = generateSession({
      ...base,
      inventory: { ...fullInventory, handballmal: 0, have: { ...fullInventory.have, "fotballmal-lite": false } },
    });
    const c = s.blocks.find((b) => b.id === "kamp")!.courts[0];
    expect(c.equipmentUsed).toContain("matte");
    expect(c.warnings).not.toContain(WARN_TIP_OVER);
    expect(c.warnings).toContain(WARN_SMALL_GOAL);
  });

  it("varsler når det er færre baller enn spillere i oppvarmingen", () => {
    const s = generateSession({ ...base, inventory: { ...fullInventory, baller: 10 } });
    expect(s.blocks.find((b) => b.id === "oppvarming")!.warnings[0]).toMatch(/Færre baller enn spillere/);
  });

  it("uten vester velges ikke kamp med lag, og det varsles", () => {
    const s = generateSession({
      ...base,
      inventory: {
        ...fullInventory,
        have: { ...fullInventory.have, "vester-2-farger": false, "vester-3-farger": false },
      },
    });
    const kamp = s.blocks.find((b) => b.id === "kamp")!;
    expect(kamp.courts[0].warnings.some((w) => w.startsWith("Mangler vester"))).toBe(true);
  });
});

describe("baner, hall og voksne", () => {
  it("én voksen: samme stasjon på alle baner, uten rotasjon", () => {
    const s = generateSession({ ...base, oneAdult: true });
    const st = s.blocks.find((b) => b.id === "stasjoner")!;
    expect(new Set(st.courts.map((c) => c.exerciseId)).size).toBe(1);
    expect(st.rotate).toBe(false);
  });

  it("varsler ved mer enn 8 spillere på en bane", () => {
    const s = generateSession({ ...base, players: 20, courts: 2 });
    const spill = s.blocks.find((b) => b.id === "spill")!;
    expect(spill.courts[0].warnings.some((w) => w.startsWith("Mer enn 8"))).toBe(true);
  });

  it("hel bane bare i hel hall, halv bane etter antall baner", () => {
    const hel = bank.exercises.find((e) => e.court === "hel-bane")!;
    const halv = bank.exercises.find((e) => e.court === "halv-bane")!;
    expect(courtFits(hel, "halv", 1)).toBe(false);
    expect(courtFits(hel, "hel", 3)).toBe(true);
    expect(courtFits(halv, "halv", 1)).toBe(true);
    expect(courtFits(halv, "halv", 2)).toBe(false);
    expect(courtFits(halv, "hel", 2)).toBe(true);
    expect(courtFits(halv, "hel", 3)).toBe(false);
  });

  it("bytt øvelse: 5 mot 5 med tre lag på hel bane roterer A–B, B–C, C–A", () => {
    const s = generateSession({ ...base, players: 15, hall: "hel", overrides: { kamp: "kamp-5-mot-5-tre-lag" } });
    const kamp = s.blocks.find((b) => b.id === "kamp")!;
    expect(kamp.courts).toHaveLength(1);
    expect(kamp.courts[0].format).toBe("5 mot 5, tre lag");
    expect(kamp.rotation).toEqual([
      ["A", "B"],
      ["B", "C"],
      ["C", "A"],
    ]);
  });

  it("bytt øvelse på én stasjon endrer bare den banen", () => {
    const s = generateSession({ ...base, overrides: { "stasjoner:3": "2-mot-1" } });
    expect(s.blocks.find((b) => b.id === "stasjoner")!.courts.map((c) => c.exerciseId)).toEqual([
      "1-mot-1-korridor",
      "2-mot-1",
      "2-mot-1",
    ]);
  });

  it("spillernes valg følger valgt øvelse", () => {
    const s = generateSession({ ...base, overrides: { valg: "2-mot-1" } });
    expect(s.blocks.find((b) => b.id === "valg")!.courts[0].exerciseId).toBe("2-mot-1");
  });

  it("alle antall 8–24 på 1–3 baner gir en økt som går opp", () => {
    for (let players = 8; players <= 24; players++) {
      for (const courts of [1, 2, 3] as const) {
        const s = generateSession({ ...base, players, courts });
        expect(s.blocks.at(-1)!.end).toBe(60);
        for (const b of s.blocks) for (const c of b.courts) expect(c.exerciseId).toBeTruthy();
      }
    }
  });
});
