import type { EquipmentId, Exercise, Inventory } from "./types";

export const EQUIPMENT_LABELS: Record<EquipmentId, string> = {
  handballmal: "håndballmål",
  "fotballmal-lite": "lite fotballmål",
  matte: "matte på høykant",
  benk: "benk",
  kjegler: "kjegler",
  "vester-2-farger": "vester i 2 farger",
  "vester-3-farger": "vester i 3 farger",
  baller: "baller",
  tape: "tape",
  fløyte: "fløyte",
};

const SMALL_GOALS: EquipmentId[] = ["fotballmal-lite", "matte", "kjegler"];

export const WARN_TIP_OVER = "Sikre fotballmålene mot velt.";
export const WARN_SMALL_GOAL = "Små mål: ingen målvakt, og et felt på 3–4 m foran målet som ingen går inn i.";

export interface CourtEquipment {
  /** false hvis noe mangler og ikke kan erstattes. */
  ok: boolean;
  used: EquipmentId[];
  warnings: string[];
  goalsUsed: number;
  ballsNeeded: number;
}

/**
 * Finner utstyr til én øvelse på én bane.
 * `goalsLeft` er håndballmål som ikke er brukt av tidligere baner i samme blokk.
 * Annet utstyr enn baller og håndballmål er avkrysset (= nok) eller ikke.
 */
export function resolveCourt(
  exercise: Exercise,
  players: number,
  inv: Inventory,
  goalsLeft: number,
): CourtEquipment {
  const has = (id: EquipmentId) =>
    id === "baller" ? inv.baller > 0 : id === "handballmal" ? goalsLeft > 0 : inv.have[id] === true;

  const used: EquipmentId[] = [];
  const warnings: string[] = [];
  let ok = true;
  let goalsUsed = 0;
  let ballsNeeded = 0;

  for (const need of exercise.equipment) {
    if (need.need === "baller") {
      ballsNeeded += need.perPlayer !== undefined ? players * need.perPlayer : (need.perCourt ?? 1);
      used.push("baller");
      continue;
    }

    let chosen: EquipmentId | null = null;
    if (need.need === "handballmal") {
      const count = need.perCourt ?? 1;
      if (goalsLeft - goalsUsed >= count) {
        goalsUsed += count;
        chosen = "handballmal";
      }
    } else if (has(need.need)) {
      chosen = need.need;
    }
    if (!chosen) chosen = need.substitutes.find((s) => s !== "handballmal" && has(s)) ?? null;

    if (!chosen) {
      ok = false;
      warnings.push(`Mangler ${EQUIPMENT_LABELS[need.need]}, og ingen erstatning er krysset av.`);
      continue;
    }
    used.push(chosen);
    if (chosen !== need.need) {
      const label = EQUIPMENT_LABELS[chosen];
      warnings.push(`${label[0].toUpperCase()}${label.slice(1)} i stedet for ${EQUIPMENT_LABELS[need.need]}.`);
    }
    if (chosen === "fotballmal-lite") warnings.push(WARN_TIP_OVER);
    if (need.need === "handballmal" && SMALL_GOALS.includes(chosen)) warnings.push(WARN_SMALL_GOAL);
  }

  return { ok, used, warnings, goalsUsed, ballsNeeded };
}

export function needsBallEach(exercise: Exercise): boolean {
  return exercise.equipment.some((e) => e.need === "baller" && e.perPlayer !== undefined);
}
