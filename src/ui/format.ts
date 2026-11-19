import { bank } from "../planner/generate";
import type { Block, CourtAssignment, CourtType, Exercise, ExerciseType } from "../planner/types";

/** 59.5 -> "59½" */
export const fmtMin = (m: number) => (Number.isInteger(m) ? String(m) : `${Math.floor(m)}½`);
export const fmtRange = (a: number, b: number) => `${fmtMin(a)}–${fmtMin(b)}`;

export const THEMES = [
  { id: "1-mot-1", label: "1 mot 1" },
  { id: "lokk-og-spill", label: "Lokk og spill" },
  { id: "skudd", label: "Skudd" },
  { id: "forsvar", label: "Forsvar" },
  { id: "kontring", label: "Kontring" },
  { id: "ballkontroll", label: "Ballkontroll" },
];
export const themeLabel = (id: string) => THEMES.find((t) => t.id === id)?.label ?? id;

export const TYPE_LABELS: Record<ExerciseType, string> = {
  oppvarming: "Oppvarming",
  stasjon: "Stasjon",
  spill: "Spill",
  kamp: "Kamp",
  avslutning: "Avslutning",
};

export const COURT_LABELS: Record<CourtType, string> = {
  tverrbane: "Tverrbane",
  "halv-bane": "Halv bane",
  "hel-bane": "Hel bane",
  "hele-hallen": "Hele hallen",
};

/** «6 spillere · 3 mot 3», uten å gjenta antallet når formatet bare er antallet. */
export function courtLine(c: CourtAssignment): string {
  const n = `${c.players} spillere`;
  return c.format === n ? n : `${n} · ${c.format}`;
}

/** Slår sammen like advarsler på tvers av banene: «Bane 2 og 3: …». */
export function blockWarnings(block: Block): string[] {
  const byText = new Map<string, number[]>();
  for (const c of block.courts) for (const w of c.warnings) byText.set(w, [...(byText.get(w) ?? []), c.court]);
  const all = block.courts.length;
  const out = [...byText].map(([w, courts]) => {
    if (all === 1 || courts.length === all) return w;
    const names = courts.length === 1 ? `Bane ${courts[0]}` : `Bane ${courts.slice(0, -1).join(", ")} og ${courts.at(-1)}`;
    return `${names}: ${w}`;
  });
  return [...out, ...block.warnings];
}

const byId = new Map(bank.exercises.map((e) => [e.id, e]));
export const exById = (id: string): Exercise => byId.get(id)!;
