import type { ExerciseBank } from "./types";

/** Fagord som barna ikke skal høre. Sjekkes som hele ord (også i bøyd form, f.eks. «sonen»). */
export const JARGON = [
  "stuss",
  "snapping",
  "gjennombrudd",
  "mannsmarkering",
  "ballfører",
  "svak hånd",
  "ballhøyde",
  "binde",
  "avslutte",
  "sone",
  "overtall",
  "undertall",
];

const LETTER = "a-zA-ZæøåÆØÅ";

/** Finner fagord i en tekst. Ordet må stå alene, men kan ha bøyningsendelse. */
export function findJargon(text: string): string[] {
  return JARGON.filter((word) => {
    const re = new RegExp(`(?<![${LETTER}])${word}(?:e|en|er|ene|et|n|ne|r|t|s)?(?![${LETTER}])`, "i");
    return re.test(text);
  });
}

/** Alle tekster barna skal høre, med hvor de står. */
export function kidFacingTexts(bank: ExerciseBank): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  for (const ex of bank.exercises) {
    out.push({ where: `${ex.id}.kidText`, text: ex.kidText });
    ex.cues.forEach((c, i) => out.push({ where: `${ex.id}.cues[${i}]`, text: c }));
  }
  for (const c of bank.ruleCards) out.push({ where: `regelkort ${c.id}`, text: c.text });
  for (const c of bank.challengeCards) out.push({ where: `utfordringskort ${c.id}`, text: c.text });
  return out;
}
