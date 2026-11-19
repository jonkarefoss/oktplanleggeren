import { EQUIPMENT_LABELS } from "../planner/equipment";
import type { Exercise } from "../planner/types";
import { COURT_LABELS, fmtMin, TYPE_LABELS } from "./format";

/** Øvelseskort: det treneren sier til barna, stikkord og varianter. */
export function ExerciseCard({ ex, details = false }: { ex: Exercise; details?: boolean }) {
  return (
    <div className="card excard">
      <div className="spread">
        <h3>{ex.name}</h3>
        <span className="tag">{TYPE_LABELS[ex.type]}</span>
      </div>
      <p className="kidtext">{ex.kidText}</p>
      <div className="cues" aria-label="Stikkord">
        {ex.cues.map((c) => (
          <span key={c}>«{c}»</span>
        ))}
      </div>
      <p className="small">
        <strong>Spør i pausen:</strong> {ex.questions.join(" ")}
      </p>
      <p className="small">
        <strong>Lettere:</strong> {ex.easier}
        <br />
        <strong>Vanskeligere:</strong> {ex.harder}
      </p>
      {details && (
        <dl className="facts">
          <dt>Spillere</dt>
          <dd>
            {ex.playersPerCourt.min === ex.playersPerCourt.max
              ? ex.playersPerCourt.min
              : `${ex.playersPerCourt.min}–${ex.playersPerCourt.max}`}{" "}
            per bane
          </dd>
          <dt>Bane</dt>
          <dd>{COURT_LABELS[ex.court]}</dd>
          <dt>Sett</dt>
          <dd>
            {ex.setMinutes.min === ex.setMinutes.max
              ? fmtMin(ex.setMinutes.min)
              : `${fmtMin(ex.setMinutes.min)}–${fmtMin(ex.setMinutes.max)}`}{" "}
            min
          </dd>
          <dt>Utstyr</dt>
          <dd>
            {ex.equipment
              .map((e) => {
                const n = e.perPlayer ? `${e.perPlayer} per spiller` : e.perCourt ? `${e.perCourt} per bane` : "";
                const subs = e.substitutes.length ? ` (eller ${e.substitutes.map((s) => EQUIPMENT_LABELS[s]).join(", ")})` : "";
                return `${EQUIPMENT_LABELS[e.need]} ${n}${subs}`;
              })
              .join("; ")}
          </dd>
          <dt>Motstander</dt>
          <dd>{ex.withOpponent ? "Ja" : "Nei"}</dd>
          <dt>Kilde</dt>
          <dd>{ex.source}</dd>
        </dl>
      )}
    </div>
  );
}
