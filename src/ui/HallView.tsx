import { useState } from "react";
import { bank, MAX_PLAYERS } from "../planner/generate";
import type { Block, Card, GeneratedSession } from "../planner/types";
import { Stepper, Warnings } from "./controls";
import { ExerciseCard } from "./ExerciseCard";
import { blockWarnings, courtLine, exById, fmtMin, fmtRange } from "./format";
import { ExercisePicker, todaysExercises } from "./SessionView";
import { SetClock } from "./SetClock";

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function CardDraw({ title, cards, count, labels, intro }: { title: string; cards: Card[]; count: number; labels: string[]; intro: string }) {
  const [drawn, setDrawn] = useState<Card[]>([]);
  return (
    <div className="card">
      <div className="spread">
        <h3>{title}</h3>
        <button type="button" className="btn primary" onClick={() => setDrawn(shuffle(cards).slice(0, count))}>
          {drawn.length ? "Trekk på nytt" : "Trekk"}
        </button>
      </div>
      <p className="muted small">{intro}</p>
      {drawn.length > 0 && (
        <div className="drawn">
          {drawn.map((c, i) => (
            <div key={c.id}>
              {labels[i] && <span className="muted small">{labels[i]}: </span>}
              {c.text}
            </div>
          ))}
        </div>
      )}
      <details>
        <summary>Se alle ({cards.length})</summary>
        <ul>
          {cards.map((c) => (
            <li key={c.id}>{c.text}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function ActivityBlock({
  block,
  session,
  onOverride,
  onNext,
}: {
  block: Block;
  session: GeneratedSession;
  onOverride: (k: string, id: string | null) => void;
  onNext?: () => void;
}) {
  const ids = [...new Set(block.courts.map((c) => c.exerciseId))];
  const usesRuleCards = ids.some((id) => exById(id).ruleCards);
  return (
    <>
      <SetClock key={block.id} defaultMinutes={block.setMinutes ?? 4} sets={block.sets ?? 1} onNext={onNext} />

      {block.slot === "valg" && (
        <div className="card">
          <ExercisePicker block={block} session={session} value={block.courts[0].exerciseId} overrideKey={block.id} onOverride={onOverride} />
        </div>
      )}

      <div className="card">
        <h3>Inndeling</h3>
        {block.courts.map((c) => (
          <div className="court" key={c.court}>
            <div className="spread">
              <strong>{block.courts.length > 1 ? `Bane ${c.court}` : c.format}</strong>
              <span className="muted small">{block.courts.length > 1 ? courtLine(c) : `${c.players} spillere`}</span>
            </div>
            {block.rotate && <div>{exById(c.exerciseId).name}</div>}
          </div>
        ))}
        {block.rotate && <p style={{ marginTop: 8, fontWeight: 600 }}>Etter hvert sett: alle går én bane til høyre.</p>}
        {block.rotation && (
          <p style={{ marginTop: 8 }}>
            {block.rotation.map(([a, b], i) => `Kamp ${i + 1}: ${a}–${b}`).join(" · ")}
            <br />
            <span className="muted small">Laget som hviler, kaster mot veggen og teller mottak.</span>
          </p>
        )}
        <Warnings items={blockWarnings(block)} />
      </div>

      {usesRuleCards && (
        <CardDraw
          title="Regelkort"
          cards={bank.ruleCards}
          count={2}
          labels={["Lag 1", "Lag 2"]}
          intro="Hvert lag får ett regelkort før settet."
        />
      )}

      {ids.map((id) => (
        <ExerciseCard key={id} ex={exById(id)} />
      ))}
    </>
  );
}

function WrapUp({ session }: { session: GeneratedSession }) {
  const questions = [...new Set(todaysExercises(session).flatMap((id) => exById(id).questions))].slice(0, 4);
  return (
    <div className="card">
      <h3>Spør barna</h3>
      <ul className="kidtext">
        {questions.map((q) => (
          <li key={q}>{q}</li>
        ))}
        <li>Hvor gøy var det? Vis med 1–5 fingre.</li>
      </ul>
    </div>
  );
}

export function HallView(props: {
  session: GeneratedSession;
  attending: number;
  setAttending: (n: number) => void;
  onOverride: (key: string, id: string | null) => void;
}) {
  const { session } = props;
  const blocks = session.blocks;
  const [index, setIndex] = useState(0);
  const block = blocks[Math.min(index, blocks.length - 1)];
  const next = blocks[index + 1];
  const goNext = () => {
    setIndex(index + 1);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <div className="spread" style={{ marginTop: 8 }}>
        <h1 style={{ margin: 0 }}>I hallen</h1>
        <div style={{ textAlign: "right" }}>
          <div className="small muted">Hvor mange kom?</div>
          <Stepper label="spillere som kom" value={props.attending} min={3} max={MAX_PLAYERS} onChange={props.setAttending} />
        </div>
      </div>
      <Warnings items={session.warnings} />

      <nav className="blocknav" aria-label="Blokker" style={{ marginTop: 12 }}>
        {blocks.map((b, i) => (
          <button
            type="button"
            key={b.id}
            aria-current={i === index ? "step" : undefined}
            ref={i === index ? (el) => el?.scrollIntoView({ inline: "center", block: "nearest" }) : undefined}
            onClick={() => setIndex(i)}
          >
            <span className="t">{fmtRange(b.start, b.end)}</span>
            {b.label}
          </button>
        ))}
      </nav>

      <div className="spread">
        <h2 style={{ margin: "4px 0 8px" }}>
          {block.label}
          {block.sets && (
            <span className="muted" style={{ fontWeight: 400 }}>
              {" "}
              · {block.sets} × {fmtMin(block.setMinutes!)} min
            </span>
          )}
        </h2>
        <span className="muted small">{fmtRange(block.start, block.end)}</span>
      </div>

      {block.kind === "aktivitet" ? (
        <ActivityBlock block={block} session={session} onOverride={props.onOverride} onNext={next ? goNext : undefined} />
      ) : (
        <div className="card">
          <p className="kidtext">{block.why}</p>
        </div>
      )}
      {block.kind === "samling" && <WrapUp session={session} />}

      {next && (
        <button type="button" className="btn big" onClick={goNext}>
          Neste: {next.label} →
        </button>
      )}

      <h2>Utfordringskort</h2>
      <CardDraw
        title="Utfordring"
        cards={bank.challengeCards}
        count={1}
        labels={[]}
        intro="Frivillig for den som vil prøve noe ekstra. Kan brukes i alle øvelser."
      />
    </>
  );
}
