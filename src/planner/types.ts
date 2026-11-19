// Datamodell for regelmotoren. Ingen React her: alt i src/planner/ er rene funksjoner.

export type ExerciseType = "oppvarming" | "stasjon" | "spill" | "kamp" | "avslutning";

export type CourtType = "tverrbane" | "halv-bane" | "hel-bane" | "hele-hallen";

export type EquipmentId =
  | "handballmal"
  | "fotballmal-lite"
  | "matte"
  | "benk"
  | "kjegler"
  | "vester-2-farger"
  | "vester-3-farger"
  | "baller"
  | "tape"
  | "fløyte";

export interface EquipmentNeed {
  need: EquipmentId;
  perCourt?: number;
  perGroup?: number;
  perPlayer?: number;
  /** Erstatninger i prioritert rekkefølge. */
  substitutes: EquipmentId[];
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  themes: string[];
  withOpponent: boolean;
  playersPerCourt: { min: number; max: number };
  /** 3 = tre lag på én bane som roterer (A–B, B–C, C–A). */
  teams?: 3;
  court: CourtType;
  equipment: EquipmentNeed[];
  setMinutes: { min: number; max: number };
  kidText: string;
  cues: string[];
  questions: string[];
  easier: string;
  harder: string;
  ruleCards?: boolean;
  figure: null;
  source: string;
  version: number;
}

export interface Card {
  id: string;
  text: string;
}

export interface ExerciseBank {
  version: number;
  exercises: Exercise[];
  ruleCards: Card[];
  challengeCards: Card[];
}

/**
 * Forenklet utstyrsliste: antall for baller og håndballmål,
 * avkrysning (true = nok) for resten.
 */
export interface Inventory {
  baller: number;
  handballmal: number;
  have: Partial<Record<Exclude<EquipmentId, "baller" | "handballmal">, boolean>>;
}

export type SessionMinutes = 60 | 75 | 90;

export interface SessionInput {
  players: number; // 8–24
  oneAdult: boolean;
  courts: 1 | 2 | 3;
  hall: "hel" | "halv";
  inventory: Inventory;
  minutes: SessionMinutes;
  theme: string;
  /** «Bytt øvelse»: blockId -> exerciseId, eller `${blockId}:${court}` for én stasjon. */
  overrides?: Record<string, string>;
}

export type BlockKind = "aktivitet" | "pause" | "samling";

/** Hvilken rolle en aktivitetsblokk har i malen. */
export type Slot = "oppvarming" | "stasjoner" | "spill" | "kamp" | "valg";

export interface CourtAssignment {
  court: number; // 1..3
  exerciseId: string;
  players: number;
  format: string;
  equipmentUsed: EquipmentId[];
  warnings: string[];
}

export interface Block {
  id: string;
  label: string;
  start: number; // minutter fra start, kan være x,5
  end: number;
  kind: BlockKind;
  slot?: Slot;
  sets?: number;
  setMinutes?: number;
  /** Byttetid mellom sett, regnet inn i start–end. */
  changeMinutes?: number;
  /** Stasjoner: alle går én bane til høyre etter hvert sett. */
  rotate?: boolean;
  /** Tre lag på hel bane: rekkefølgen på kampene. */
  rotation?: [string, string][];
  courts: CourtAssignment[];
  /** Advarsler for hele blokka, for eksempel for få baller. */
  warnings: string[];
  why: string;
}

export interface GeneratedSession {
  input: SessionInput;
  blocks: Block[];
  playMinutes: number;
  opponentShare: number; // 0..1
  warnings: string[];
}
