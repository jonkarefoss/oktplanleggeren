import { useEffect, useMemo, useState } from "react";
import { generateSession } from "./planner/generate";
import type { SessionInput } from "./planner/types";
import { BankView } from "./ui/BankView";
import { themeLabel } from "./ui/format";
import { HallView } from "./ui/HallView";
import { PrintView } from "./ui/PrintView";
import { SessionView } from "./ui/SessionView";
import { DEFAULT_INPUT, Setup } from "./ui/Setup";
import { addSaved, loadInput, loadSaved, removeSaved, saveInput } from "./ui/storage";

type View = "oppsett" | "okt" | "hall" | "ovelser";

const TABS: { view: View; label: string; icon: string }[] = [
  { view: "oppsett", label: "Oppsett", icon: "⚙︎" },
  { view: "okt", label: "Økt", icon: "☰" },
  { view: "hall", label: "I hallen", icon: "⏱" },
  { view: "ovelser", label: "Øvelser", icon: "▤" },
];

export function App() {
  const [input, setInput] = useState<SessionInput | null>(() => loadInput());
  const [view, setView] = useState<View>(() => (loadInput() ? "okt" : "oppsett"));
  const [attending, setAttending] = useState<number | null>(null);
  const [saved, setSaved] = useState(loadSaved);
  const [savedThis, setSavedThis] = useState(false);

  useEffect(() => {
    if (input) saveInput(input);
    setSavedThis(false);
  }, [input]);

  const session = useMemo(() => (input ? generateSession(input) : null), [input]);
  const hallSession = useMemo(
    () => (input ? generateSession({ ...input, players: attending ?? input.players }) : null),
    [input, attending],
  );

  const go = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0 });
  };

  const onOverride = (key: string, id: string | null) =>
    setInput((i) => {
      if (!i) return i;
      const overrides = { ...i.overrides };
      if (id === null) delete overrides[key];
      else overrides[key] = id;
      return { ...i, overrides };
    });

  return (
    <>
      <main className="screen-only">
        {view === "oppsett" && (
          <Setup
            initial={input ?? DEFAULT_INPUT}
            saved={saved}
            onCreate={(i) => {
              setInput({ ...i, overrides: {} });
              setAttending(null);
              go("okt");
            }}
            onOpenSaved={(s) => {
              setInput(s.input);
              setAttending(null);
              go("okt");
            }}
            onDeleteSaved={(id) => setSaved(removeSaved(id))}
          />
        )}
        {view === "okt" && session && (
          <SessionView
            session={session}
            onOverride={onOverride}
            onHall={() => go("hall")}
            onPrint={() => window.print()}
            onSave={() => {
              const name = `${new Date().toLocaleDateString("nb-NO")} · ${themeLabel(session.input.theme)}`;
              setSaved(addSaved(name, session.input));
              setSavedThis(true);
            }}
            saved={savedThis}
          />
        )}
        {view === "hall" && hallSession && input && (
          <HallView
            session={hallSession}
            attending={attending ?? input.players}
            setAttending={setAttending}
            onOverride={onOverride}
          />
        )}
        {view === "ovelser" && <BankView />}
      </main>

      {session && <PrintView session={session} />}

      <nav className="tabbar screen-only" aria-label="Hovedmeny">
        {TABS.map((t) => (
          <button
            key={t.view}
            type="button"
            aria-current={view === t.view ? "page" : undefined}
            disabled={!input && (t.view === "okt" || t.view === "hall")}
            onClick={() => go(t.view)}
          >
            <span className="icon" aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}
