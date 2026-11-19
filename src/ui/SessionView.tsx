import { isFeasible, ranked } from "../planner/generate";
import type { Block, ExerciseType, GeneratedSession, SessionInput, Slot } from "../planner/types";
import { Warnings } from "./controls";
import { blockWarnings, courtLine, exById, fmtMin, fmtRange, themeLabel } from "./format";

const SLOT_TYPE: Record<Exclude<Slot, "valg">, ExerciseType> = {
  oppvarming: "oppvarming",
  stasjoner: "stasjon",
  spill: "spill",
  kamp: "kamp",
};

/** Øvelser som er brukt i dagens økt, utenom spillernes valg. */
export function todaysExercises(session: GeneratedSession): string[] {
  const ids = session.blocks.filter((b) => b.slot && b.slot !== "valg").flatMap((b) => b.courts.map((c) => c.exerciseId));
  return [...new Set(ids)];
}

export function ExercisePicker(props: {
  block: Block;
  session: GeneratedSession;
  value: string;
  overrideKey: string;
  onOverride: (key: string, id: string | null) => void;
}) {
  const { block, session } = props;
  const input: SessionInput = session.input;
  const options =
    block.slot === "valg"
      ? todaysExercises(session).map(exById)
      : ranked(SLOT_TYPE[block.slot as Exclude<Slot, "valg">], input.theme);
  const overridden = input.overrides?.[props.overrideKey] !== undefined;
  if (options.length <= 1 && !overridden) return null;
  return (
    <label className="row small" style={{ marginTop: 6 }}>
      <span className="muted">{block.slot === "valg" ? "Barna valgte:" : "Bytt øvelse:"}</span>
      <select
        value={props.value}
        onChange={(e) => props.onOverride(props.overrideKey, e.target.value)}
        aria-label={`Bytt øvelse i ${block.label}`}
      >
        {options.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
            {block.slot !== "valg" && !isFeasible(ex, input) ? " (passer dårlig)" : ""}
          </option>
        ))}
      </select>
      {overridden && (
        <button type="button" className="btn link" onClick={() => props.onOverride(props.overrideKey, null)}>
          Tilbake til forslag
        </button>
      )}
    </label>
  );
}

function BlockCard({
  block,
  session,
  onOverride,
}: {
  block: Block;
  session: GeneratedSession;
  onOverride: (key: string, id: string | null) => void;
}) {
  const isActivity = block.kind === "aktivitet";
  const sameEverywhere = !block.rotate;
  const first = block.courts[0];
  return (
    <div className={`card block ${isActivity ? "" : "pause"}`}>
      <div className="time">{fmtRange(block.start, block.end)}</div>
      <div>
        <h3>
          {block.label}
          {isActivity && block.sets && (
            <span className="muted" style={{ fontWeight: 400 }}>
              {" "}
              · {block.sets} × {fmtMin(block.setMinutes!)} min
            </span>
          )}
        </h3>
        {isActivity && sameEverywhere && first && (
          <>
            <p style={{ margin: 0, fontWeight: 600 }}>{exById(first.exerciseId).name}</p>
            <ExercisePicker block={block} session={session} value={first.exerciseId} overrideKey={block.id} onOverride={onOverride} />
          </>
        )}
        {block.courts.map((c) => (
          <div className="court" key={c.court}>
            <div className="spread">
              <span className="label">
                {block.courts.length > 1 ? `Bane ${c.court} · ` : ""}
                {courtLine(c)}
              </span>
            </div>
            {block.rotate && (
              <>
                <div style={{ fontWeight: 600 }}>{exById(c.exerciseId).name}</div>
                <ExercisePicker
                  block={block}
                  session={session}
                  value={c.exerciseId}
                  overrideKey={`${block.id}:${c.court}`}
                  onOverride={onOverride}
                />
              </>
            )}
          </div>
        ))}
        {block.rotation && (
          <p className="small" style={{ marginTop: 8 }}>
            Rekkefølge: {block.rotation.map(([a, b]) => `${a}–${b}`).join(", ")}. Laget som hviler, kaster mot veggen og
            teller mottak.
          </p>
        )}
        <Warnings items={blockWarnings(block)} />
        <p className="muted small" style={{ marginTop: 8 }}>
          {block.why}
        </p>
      </div>
    </div>
  );
}

export function SessionView(props: {
  session: GeneratedSession;
  onOverride: (key: string, id: string | null) => void;
  onHall: () => void;
  onPrint: () => void;
  onSave: () => void;
  saved: boolean;
}) {
  const { session } = props;
  const share = Math.round(session.opponentShare * 100);
  const i = session.input;
  return (
    <>
      <h1>Økta</h1>
      <p className="muted">
        {i.players} spillere · {i.courts} {i.courts === 1 ? "bane" : "baner"} · {i.hall === "hel" ? "hel" : "halv"} hall ·{" "}
        {themeLabel(i.theme)}
      </p>
      <div className="summary">
        <div>
          <strong>{i.minutes}</strong>
          <span className="small muted">min totalt</span>
        </div>
        <div>
          <strong>{fmtMin(session.playMinutes)}</strong>
          <span className="small muted">min spill</span>
        </div>
        <div>
          <strong style={{ color: share >= 60 ? "var(--ok)" : "var(--accent)" }}>{share} %</strong>
          <span className="small muted">med motstander</span>
        </div>
      </div>
      <Warnings items={session.warnings} />

      <div className="row" style={{ margin: "12px 0" }}>
        <button type="button" className="btn primary" onClick={props.onHall}>
          Til hallen
        </button>
        <button type="button" className="btn" onClick={props.onPrint}>
          Skriv ut
        </button>
        <button type="button" className="btn" onClick={props.onSave} disabled={props.saved}>
          {props.saved ? "Lagret" : "Lagre økt"}
        </button>
      </div>

      {session.blocks.map((b) => (
        <BlockCard key={b.id} block={b} session={session} onOverride={props.onOverride} />
      ))}
    </>
  );
}
