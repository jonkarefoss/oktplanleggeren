import { bank } from "../planner/generate";
import type { GeneratedSession } from "../planner/types";
import { blockWarnings, exById, fmtMin, fmtRange, themeLabel } from "./format";
import { todaysExercises } from "./SessionView";

/** Vises bare ved utskrift. Side 1: plan. Side 2: øvelseskort og regelkort. */
export function PrintView({ session }: { session: GeneratedSession }) {
  const i = session.input;
  const ids = todaysExercises(session);
  const warnings = [
    ...new Set([
      ...session.warnings,
      ...session.blocks.flatMap(blockWarnings),
    ]),
  ];
  return (
    <div className="print print-only">
      <h1>Økt · {themeLabel(i.theme)}</h1>
      <p>
        {new Date().toLocaleDateString("nb-NO")} · {i.players} spillere · {i.courts} {i.courts === 1 ? "bane" : "baner"} ·{" "}
        {i.minutes} min · {fmtMin(session.playMinutes)} min spill, {Math.round(session.opponentShare * 100)} % med motstander
      </p>
      <table>
        <thead>
          <tr>
            <th style={{ width: "13%" }}>Tid</th>
            <th style={{ width: "20%" }}>Blokk</th>
            <th>Innhold</th>
          </tr>
        </thead>
        <tbody>
          {session.blocks.map((b) => (
            <tr key={b.id}>
              <td>{fmtRange(b.start, b.end)}</td>
              <td>
                <strong>{b.label}</strong>
                {b.sets && (
                  <>
                    <br />
                    {b.sets} × {fmtMin(b.setMinutes!)} min
                  </>
                )}
              </td>
              <td>
                {b.courts.length === 0 && b.why}
                {b.rotate
                  ? b.courts.map((c) => (
                      <div key={c.court}>
                        Bane {c.court}: {exById(c.exerciseId).name} ({c.players} spillere)
                      </div>
                    ))
                  : b.courts[0] && (
                      <>
                        {exById(b.courts[0].exerciseId).name}
                        {" – "}
                        {b.courts.map((c) => c.format).join(" / ")}
                      </>
                    )}
                {b.rotate && <div>Alle går én bane til høyre etter hvert sett.</div>}
                {b.rotation && <div>{b.rotation.map(([x, y]) => `${x}–${y}`).join(", ")}</div>}
                {b.slot === "valg" && <div>Barna stemmer over en øvelse fra dagen.</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {warnings.length > 0 && (
        <>
          <h2>Husk</h2>
          <ul>
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </>
      )}

      <div className="page2">
        <h2>Øvelser</h2>
        <div className="twocol">
          {ids.map((id) => {
            const ex = exById(id);
            return (
              <div className="excard" key={id}>
                <strong>{ex.name}</strong>
                <p>{ex.kidText}</p>
                <p>
                  <em>Rop:</em> {ex.cues.map((c) => `«${c}»`).join(" ")}
                  <br />
                  <em>Spør:</em> {ex.questions.join(" ")}
                  <br />
                  <em>Lettere:</em> {ex.easier}
                  <br />
                  <em>Vanskeligere:</em> {ex.harder}
                </p>
              </div>
            );
          })}
        </div>
        <h2>Regelkort</h2>
        <ul>
          {bank.ruleCards.map((c) => (
            <li key={c.id}>{c.text}</li>
          ))}
        </ul>
        <h2>Utfordringskort</h2>
        <ul>
          {bank.challengeCards.map((c) => (
            <li key={c.id}>{c.text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
