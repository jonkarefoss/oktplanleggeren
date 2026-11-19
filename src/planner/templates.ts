import type { BlockKind, SessionMinutes, Slot } from "./types";

export const CHANGE_MINUTES = 1.5;

export interface TemplateBlock {
  id: string;
  label: string;
  kind: BlockKind;
  slot?: Slot;
  sets?: number;
  setMinutes?: number;
  /** For pause og samling. */
  minutes?: number;
  why: string;
}

const warmup: TemplateBlock = {
  id: "oppvarming",
  label: "Oppvarming",
  kind: "aktivitet",
  slot: "oppvarming",
  sets: 1,
  setMinutes: 8,
  why: "Alle i gang med ball med en gang, med motspillere fra første minutt.",
};
const intro: TemplateBlock = {
  id: "pause-1",
  label: "Pause og forklaring",
  kind: "pause",
  minutes: 2,
  why: "Drikke, gå til banene og hør hva stasjonene er.",
};
const stations: TemplateBlock = {
  id: "stasjoner",
  label: "Stasjoner",
  kind: "aktivitet",
  slot: "stasjoner",
  sets: 3,
  setMinutes: 3,
  why: "Korte, ulike oppgaver med mange ballkontakter. Alle prøver alt.",
};
const play = (id: string, label: string, sets: number): TemplateBlock => ({
  id,
  label,
  kind: "aktivitet",
  slot: "spill",
  sets,
  setMinutes: 4,
  why: "Spill med motstander i korte sett. Regelkort gir utfordring uten å dele barna etter nivå.",
});
const drink = (id: string): TemplateBlock => ({
  id,
  label: "Drikkepause",
  kind: "pause",
  minutes: 2,
  why: "Drikke og les opp nye lag.",
});
const match = (sets: number): TemplateBlock => ({
  id: "kamp",
  label: "Kamp",
  kind: "aktivitet",
  slot: "kamp",
  sets,
  setMinutes: 4,
  why: "Vanlig kamp i korte sett med nye lag hver gang. Ingen tabell.",
});
const choice = (sets: number, setMinutes: number): TemplateBlock => ({
  id: "valg",
  label: "Spillernes valg",
  kind: "aktivitet",
  slot: "valg",
  sets,
  setMinutes,
  why: "Barna stemmer over en øvelse fra dagen. Det gir eierskap.",
});
const wrapUp = (minutes: number): TemplateBlock => ({
  id: "samling",
  label: "Samling",
  kind: "samling",
  minutes,
  why: "To spørsmål og «hvor gøy var det?» med 1–5 fingre.",
});

export const TEMPLATES: Record<SessionMinutes, TemplateBlock[]> = {
  60: [warmup, intro, stations, play("spill", "Spill", 3), drink("pause-2"), match(3), choice(1, 3), wrapUp(3)],
  75: [warmup, intro, stations, play("spill", "Spill", 3), drink("pause-2"), match(4), drink("pause-3"), choice(2, 4), wrapUp(4)],
  90: [
    warmup,
    intro,
    stations,
    play("spill", "Spill", 3),
    drink("pause-2"),
    play("spill-2", "Spill, del 2", 4),
    drink("pause-3"),
    match(4),
    choice(1, 4),
    wrapUp(4),
  ],
};

/** Lengden på en malblokk i minutter, med byttetid mellom settene. */
export function blockDuration(b: { sets?: number; setMinutes?: number; minutes?: number }): number {
  if (b.sets && b.setMinutes) return b.sets * b.setMinutes + (b.sets - 1) * CHANGE_MINUTES;
  return b.minutes ?? 0;
}

/** Legger på start og slutt ut fra rekkefølgen. */
export function layout(template: TemplateBlock[]): (TemplateBlock & { start: number; end: number })[] {
  let t = 0;
  return template.map((b) => {
    const start = t;
    t += blockDuration(b);
    return { ...b, start, end: t };
  });
}
