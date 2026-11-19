import { useState } from "react";
import { bank } from "../planner/generate";
import type { ExerciseType } from "../planner/types";
import { ExerciseCard } from "./ExerciseCard";
import { TYPE_LABELS } from "./format";

const TYPES = [...new Set(bank.exercises.map((e) => e.type))] as ExerciseType[];

export function BankView() {
  const [type, setType] = useState<ExerciseType | null>(null);
  const list = bank.exercises.filter((e) => !type || e.type === type);
  return (
    <>
      <h1>Øvelser</h1>
      <div className="chips" role="group" aria-label="Filtrer på type" style={{ marginBottom: 12 }}>
        <button type="button" className="chip" aria-pressed={type === null} onClick={() => setType(null)}>
          Alle
        </button>
        {TYPES.map((t) => (
          <button type="button" key={t} className="chip" aria-pressed={type === t} onClick={() => setType(t)}>
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>
      {list.map((ex) => (
        <ExerciseCard key={ex.id} ex={ex} details />
      ))}
      <h2>Regelkort</h2>
      <div className="card">
        <ul style={{ margin: 0 }}>
          {bank.ruleCards.map((c) => (
            <li key={c.id}>{c.text}</li>
          ))}
        </ul>
      </div>
      <h2>Utfordringskort</h2>
      <div className="card">
        <ul style={{ margin: 0 }}>
          {bank.challengeCards.map((c) => (
            <li key={c.id}>{c.text}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
