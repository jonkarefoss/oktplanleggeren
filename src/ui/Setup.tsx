import { useState } from "react";
import { EQUIPMENT_LABELS } from "../planner/equipment";
import { MAX_PLAYERS, MIN_PLAYERS } from "../planner/generate";
import type { EquipmentId, Inventory, SessionInput } from "../planner/types";
import { Segmented, Stepper } from "./controls";
import { THEMES, themeLabel } from "./format";
import type { SavedSession } from "./storage";

type CheckItem = Exclude<EquipmentId, "baller" | "handballmal">;
const CHECK_ITEMS: CheckItem[] = [
  "kjegler",
  "vester-2-farger",
  "vester-3-farger",
  "tape",
  "fotballmal-lite",
  "matte",
  "benk",
  "fløyte",
];

export const DEFAULT_INPUT: SessionInput = {
  players: 16,
  oneAdult: false,
  courts: 3,
  hall: "halv",
  minutes: 60,
  theme: "1-mot-1",
  inventory: {
    baller: 16,
    handballmal: 2,
    have: { kjegler: true, "vester-2-farger": true, tape: true, "fotballmal-lite": true, fløyte: true },
  },
};

export function Setup(props: {
  initial: SessionInput;
  saved: SavedSession[];
  onCreate: (input: SessionInput) => void;
  onOpenSaved: (s: SavedSession) => void;
  onDeleteSaved: (id: string) => void;
}) {
  const [input, setInput] = useState<SessionInput>({ ...props.initial, overrides: undefined });
  const set = <K extends keyof SessionInput>(k: K, v: SessionInput[K]) => setInput((i) => ({ ...i, [k]: v }));
  const setInv = (inv: Partial<Inventory>) => setInput((i) => ({ ...i, inventory: { ...i.inventory, ...inv } }));
  const toggle = (id: CheckItem) =>
    setInv({ have: { ...input.inventory.have, [id]: !input.inventory.have[id] } });

  return (
    <>
      <h1>Ny økt</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          props.onCreate(input);
        }}
      >
        <div className="field">
          <span className="label">Antall spillere</span>
          <Stepper label="spillere" value={input.players} min={MIN_PLAYERS} max={MAX_PLAYERS} onChange={(v) => set("players", v)} />
        </div>

        <div className="field">
          <span className="label">Voksne på trening</span>
          <Segmented
            label="Voksne"
            value={input.oneAdult ? "en" : "flere"}
            options={[
              { value: "en", label: "Én voksen" },
              { value: "flere", label: "Flere voksne" },
            ]}
            onChange={(v) => set("oneAdult", v === "en")}
          />
        </div>

        <div className="field">
          <span className="label">Hall</span>
          <Segmented
            label="Hall"
            value={input.hall}
            options={[
              { value: "halv", label: "Halv hall" },
              { value: "hel", label: "Hel hall" },
            ]}
            onChange={(v) => set("hall", v)}
          />
        </div>

        <div className="field">
          <span className="label">Antall baner</span>
          <Segmented
            label="Antall baner"
            value={input.courts}
            options={[1, 2, 3].map((n) => ({ value: n as 1 | 2 | 3, label: String(n) }))}
            onChange={(v) => set("courts", v)}
          />
          <p className="muted small" style={{ marginTop: 6 }}>
            Baner på tvers av hallen, med eller uten skillevegg.
          </p>
        </div>

        <div className="field">
          <span className="label">Lengde</span>
          <Segmented
            label="Lengde"
            value={input.minutes}
            options={([60, 75, 90] as const).map((m) => ({ value: m, label: `${m} min` }))}
            onChange={(v) => set("minutes", v)}
          />
        </div>

        <div className="field">
          <span className="label">Tema</span>
          <div className="chips">
            {THEMES.map((t) => (
              <button type="button" key={t.id} className="chip" aria-pressed={input.theme === t.id} onClick={() => set("theme", t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="label">Utstyr</span>
          <div className="card">
            <div className="spread" style={{ marginBottom: 10 }}>
              <span>Baller</span>
              <Stepper label="baller" value={input.inventory.baller} min={0} max={40} onChange={(v) => setInv({ baller: v })} />
            </div>
            <div className="spread" style={{ marginBottom: 10 }}>
              <span>Håndballmål</span>
              <Stepper label="håndballmål" value={input.inventory.handballmal} min={0} max={6} onChange={(v) => setInv({ handballmal: v })} />
            </div>
            <div className="checks">
              {CHECK_ITEMS.map((id) => (
                <label key={id}>
                  <input type="checkbox" checked={input.inventory.have[id] === true} onChange={() => toggle(id)} />
                  {EQUIPMENT_LABELS[id][0].toUpperCase() + EQUIPMENT_LABELS[id].slice(1)}
                </label>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="btn primary big">
          Lag økt
        </button>
      </form>

      {props.saved.length > 0 && (
        <>
          <h2>Lagrede økter</h2>
          {props.saved.map((s) => (
            <div className="card spread" key={s.id}>
              <button type="button" className="btn link" style={{ textAlign: "left" }} onClick={() => props.onOpenSaved(s)}>
                {s.name}
                <br />
                <span className="muted small">
                  {s.input.players} spillere · {s.input.minutes} min · {themeLabel(s.input.theme)}
                </span>
              </button>
              <button type="button" className="btn" aria-label={`Slett ${s.name}`} onClick={() => props.onDeleteSaved(s.id)}>
                Slett
              </button>
            </div>
          ))}
        </>
      )}
    </>
  );
}
