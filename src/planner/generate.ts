import bankData from "../../data/exercises.json";
import { needsBallEach, resolveCourt } from "./equipment";
import { formatFor, MAX_PER_COURT, rotation3Teams, splitPlayers } from "./split";
import { layout, TEMPLATES, type TemplateBlock } from "./templates";
import type {
  Block,
  CourtAssignment,
  Exercise,
  ExerciseBank,
  ExerciseType,
  GeneratedSession,
  SessionInput,
  Slot,
} from "./types";

export const bank = bankData as ExerciseBank;

export const MIN_PLAYERS = 8;
export const MAX_PLAYERS = 24;
export const MIN_OPPONENT_SHARE = 0.6;
export const MAX_MINUTES_WITHOUT_DRINK = 30;

const SLOT_TYPE: Record<Exclude<Slot, "valg">, ExerciseType> = {
  oppvarming: "oppvarming",
  stasjoner: "stasjon",
  spill: "spill",
  kamp: "kamp",
};

/** Passer banetypen til hallen og antall baner? */
export function courtFits(ex: Exercise, hall: SessionInput["hall"], courts: number): boolean {
  switch (ex.court) {
    case "tverrbane":
    case "hele-hallen":
      return true;
    case "halv-bane":
      return hall === "halv" ? courts === 1 : courts <= 2;
    case "hel-bane":
      return hall === "hel";
  }
}

/** Øvelser som bruker hele hallen eller hel bane, samler alle spillerne i én gruppe. */
export function groupsFor(ex: Exercise, input: SessionInput): number[] {
  return ex.court === "hele-hallen" || ex.court === "hel-bane"
    ? [input.players]
    : splitPlayers(input.players, input.courts);
}

function playersFit(ex: Exercise, groups: number[]): boolean {
  return groups.every((g) => g >= ex.playersPerCourt.min && g <= ex.playersPerCourt.max);
}

function score(ex: Exercise, theme: string): number {
  return (ex.themes.includes(theme) ? 2 : 0) + (ex.withOpponent ? 1 : 0);
}

/** Øvelser av riktig type, best først: tema, så spill med motstander, så rekkefølgen i banken. */
export function ranked(type: ExerciseType, theme: string, exercises = bank.exercises): Exercise[] {
  return exercises
    .map((ex, i) => ({ ex, i }))
    .filter(({ ex }) => ex.type === type)
    .sort((a, b) => score(b.ex, theme) - score(a.ex, theme) || a.i - b.i)
    .map(({ ex }) => ex);
}

/** Kan øvelsen brukes slik oppsettet er (bane, antall spillere, utstyr)? */
export function isFeasible(ex: Exercise, input: SessionInput): boolean {
  if (!courtFits(ex, input.hall, input.courts)) return false;
  const groups = groupsFor(ex, input);
  if (!playersFit(ex, groups)) return false;
  let goalsLeft = input.inventory.handballmal;
  for (const g of groups) {
    const r = resolveCourt(ex, g, input.inventory, goalsLeft);
    if (!r.ok) return false;
    goalsLeft -= r.goalsUsed;
  }
  return true;
}

function pickBest(type: ExerciseType, input: SessionInput): Exercise {
  const list = ranked(type, input.theme);
  return list.find((ex) => isFeasible(ex, input)) ?? list.find((ex) => courtFits(ex, input.hall, input.courts)) ?? list[0];
}

function byId(id: string): Exercise {
  const ex = bank.exercises.find((e) => e.id === id);
  if (!ex) throw new Error(`Ukjent øvelse: ${id}`);
  return ex;
}

function formatText(ex: Exercise, slot: Slot, players: number): string {
  if (ex.court === "hele-hallen") return "Alle sammen";
  if (ex.teams === 3) {
    const size = Math.floor(players / 3);
    return `${size} mot ${size}, tre lag`;
  }
  if (ex.withOpponent && (slot === "spill" || slot === "kamp" || slot === "valg")) return formatFor(players);
  return `${players} spillere`;
}

/** Lager inndeling per bane. `perCourt[i]` er øvelsen på bane i+1. */
function assign(
  perCourt: Exercise[],
  groups: number[],
  input: SessionInput,
  slot: Slot,
): { courts: CourtAssignment[]; warnings: string[] } {
  let goalsLeft = input.inventory.handballmal;
  let balls = 0;
  let ballEach = false;
  const courts = groups.map((players, i) => {
    const ex = perCourt[i];
    const eq = resolveCourt(ex, players, input.inventory, goalsLeft);
    goalsLeft -= eq.goalsUsed;
    balls += eq.ballsNeeded;
    ballEach ||= needsBallEach(ex);
    const warnings = [...eq.warnings];
    if (players > MAX_PER_COURT && ex.court !== "hele-hallen" && ex.teams !== 3) {
      warnings.push("Mer enn 8 spillere på banen. Bruk én bane til, eller to øvelser på samme bane.");
    } else if (players < ex.playersPerCourt.min) {
      warnings.push(`For få spillere til denne øvelsen (minst ${ex.playersPerCourt.min}).`);
    } else if (players > ex.playersPerCourt.max) {
      warnings.push(`For mange spillere til denne øvelsen (høyst ${ex.playersPerCourt.max}).`);
    }
    return {
      court: i + 1,
      exerciseId: ex.id,
      players,
      format: formatText(ex, slot, players),
      equipmentUsed: eq.used,
      warnings,
    };
  });

  const warnings: string[] = [];
  const total = groups.reduce((a, b) => a + b, 0);
  if (input.inventory.baller < balls) {
    warnings.push(
      ballEach
        ? `Færre baller enn spillere: ${input.inventory.baller} baller til ${total} spillere, og alle skal ha ball.`
        : `Trenger ${balls} baller, dere har ${input.inventory.baller}.`,
    );
  }
  return { courts, warnings };
}

function buildActivity(
  t: TemplateBlock & { start: number; end: number },
  input: SessionInput,
  firstPlayExercise: Exercise | undefined,
): Block {
  const slot = t.slot!;
  const overrides = input.overrides ?? {};
  let why = t.why;
  let rotate = false;
  let perCourt: Exercise[];
  let groups: number[];

  if (slot === "stasjoner" && !input.oneAdult && input.courts > 1) {
    const candidates = ranked("stasjon", input.theme);
    const feasible = candidates.filter((ex) => isFeasible(ex, input));
    const pool = feasible.length > 0 ? feasible : candidates;
    groups = splitPlayers(input.players, input.courts);
    perCourt = groups.map((_, i) => {
      const id = overrides[`${t.id}:${i + 1}`] ?? overrides[t.id];
      return id ? byId(id) : pool[i % pool.length];
    });
    rotate = true;
    why += " Alle går én bane til høyre etter hvert sett.";
  } else {
    let ex: Exercise;
    if (overrides[t.id]) ex = byId(overrides[t.id]);
    else if (slot === "valg") ex = firstPlayExercise ?? pickBest("spill", input);
    else ex = pickBest(SLOT_TYPE[slot], input);
    groups = groupsFor(ex, input);
    perCourt = groups.map(() => ex);
    if (slot === "stasjoner") why += " Én voksen: samme øvelse på alle baner.";
  }

  const { courts, warnings } = assign(perCourt, groups, input, slot);
  const block: Block = {
    id: t.id,
    label: t.label,
    start: t.start,
    end: t.end,
    kind: t.kind,
    slot,
    sets: t.sets,
    setMinutes: t.setMinutes,
    changeMinutes: t.sets! > 1 ? 1.5 : undefined,
    rotate,
    courts,
    warnings,
    why,
  };
  if (perCourt[0].teams === 3) block.rotation = rotation3Teams(t.sets!);
  return block;
}

/** Andel av blokkas spilletid som er spill med motstander, sett fra én spiller. */
function opponentFraction(block: Block): number {
  const exs = block.courts.map((c) => byId(c.exerciseId));
  if (block.rotate) return exs.filter((e) => e.withOpponent).length / exs.length;
  const total = block.courts.reduce((a, c) => a + c.players, 0);
  return block.courts.reduce((a, c, i) => a + (exs[i].withOpponent ? c.players : 0), 0) / total;
}

export function generateSession(input: SessionInput): GeneratedSession {
  const blocks: Block[] = [];
  let firstPlay: Exercise | undefined;

  for (const t of layout(TEMPLATES[input.minutes])) {
    if (t.kind !== "aktivitet") {
      blocks.push({
        id: t.id,
        label: t.label,
        start: t.start,
        end: t.end,
        kind: t.kind,
        courts: [],
        warnings: [],
        why: t.why,
      });
      continue;
    }
    const block = buildActivity(t, input, firstPlay);
    if (t.slot === "spill" && !firstPlay) firstPlay = byId(block.courts[0].exerciseId);
    blocks.push(block);
  }

  let playMinutes = 0;
  let opponentMinutes = 0;
  for (const b of blocks) {
    if (b.kind !== "aktivitet") continue;
    const m = b.sets! * b.setMinutes!;
    playMinutes += m;
    opponentMinutes += m * opponentFraction(b);
  }
  const opponentShare = playMinutes > 0 ? opponentMinutes / playMinutes : 0;

  const warnings: string[] = [];
  if (input.players < MIN_PLAYERS || input.players > MAX_PLAYERS) {
    warnings.push(`Appen er laget for ${MIN_PLAYERS}–${MAX_PLAYERS} spillere.`);
  }
  if (opponentShare < MIN_OPPONENT_SHARE) {
    warnings.push(`Bare ${Math.round(opponentShare * 100)} % av spilletiden er spill med motstander. Målet er minst 60 %.`);
  }
  if (Math.min(...splitPlayers(input.players, input.courts)) < 3) {
    warnings.push("Under 3 spillere på en bane. Bruk færre baner.");
  }
  let lastDrink = 0;
  for (const b of [...blocks.filter((b) => b.kind === "pause"), { start: input.minutes, end: input.minutes }]) {
    if (b.start - lastDrink > MAX_MINUTES_WITHOUT_DRINK) {
      warnings.push(`Over ${MAX_MINUTES_WITHOUT_DRINK} minutter uten drikkepause (fra minutt ${lastDrink}).`);
    }
    lastDrink = b.end;
  }

  return { input, blocks, playMinutes, opponentShare, warnings };
}
