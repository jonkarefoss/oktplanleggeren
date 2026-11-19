/** Fordeler spillerne så jevnt som mulig, de største gruppene først. */
export function splitPlayers(n: number, courts: number): number[] {
  if (courts < 1) throw new Error("Minst én bane");
  const base = Math.floor(n / courts);
  const extra = n % courts;
  return Array.from({ length: courts }, (_, i) => base + (i < extra ? 1 : 0));
}

export const MAX_PER_COURT = 8;

/** Spillformat for en bane med motstander. */
export function formatFor(playersOnCourt: number): string {
  switch (playersOnCourt) {
    case 3:
      return "2 mot 1, roterer";
    case 4:
      return "2 mot 2";
    case 5:
      return "2 mot 2 + joker";
    case 6:
      return "3 mot 3";
    case 7:
      return "3 mot 3 + joker";
    case 8:
      return "4 mot 4";
  }
  if (playersOnCourt > MAX_PER_COURT) return `${playersOnCourt} spillere – for mange på én bane`;
  return `${playersOnCourt} spillere – for få på én bane`;
}

export const JOKER_HELP = "Jokeren spiller alltid med laget som har ballen.";

/** Tre lag på én bane: A–B, B–C, C–A … så hvert lag spiller to av tre kamper. */
export function rotation3Teams(sets: number): [string, string][] {
  const order: [string, string][] = [
    ["A", "B"],
    ["B", "C"],
    ["C", "A"],
  ];
  return Array.from({ length: sets }, (_, i) => order[i % 3]);
}
