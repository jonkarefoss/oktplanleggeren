import { useEffect, useRef, useState } from "react";
import { Segmented } from "./controls";

let audio: AudioContext | null = null;

/** Må kalles fra et trykk, ellers spiller ikke iPhone lyd. */
function unlockAudio() {
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") void audio.resume();
    // Et kort, stille lydklipp låser opp lyden på iOS.
    const o = audio.createOscillator();
    const g = audio.createGain();
    g.gain.value = 0;
    o.connect(g).connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.01);
  } catch {
    // Ingen lyd tilgjengelig.
  }
}

export function beep() {
  if (!audio) return;
  const t0 = audio.currentTime;
  for (let i = 0; i < 3; i++) {
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.frequency.value = 880;
    o.type = "square";
    const t = t0 + i * 0.4;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    o.connect(g).connect(audio.destination);
    o.start(t);
    o.stop(t + 0.3);
  }
  navigator.vibrate?.([200, 100, 200, 100, 200]);
}

/** Holder skjermen våken så lenge `active` er sann. */
function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request("screen");
        if (cancelled) void lock.release();
      } catch {
        // Nektet (f.eks. lavt batteri). Klokka virker likevel.
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void acquire();
    };
    void acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release();
    };
  }, [active]);
}

const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function SetClock({ defaultMinutes, sets, onNext }: { defaultMinutes: number; sets: number; onNext?: () => void }) {
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [remaining, setRemaining] = useState(defaultMinutes * 60_000);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [setNo, setSetNo] = useState(1);
  const [done, setDone] = useState(false);
  const endRef = useRef(endAt);
  endRef.current = endAt;

  useWakeLock(endAt !== null);

  useEffect(() => {
    if (endAt === null) return;
    const id = setInterval(() => {
      const left = endAt - Date.now();
      if (left <= 0) {
        setEndAt(null);
        setRemaining(0);
        setDone(true);
        beep();
      } else {
        setRemaining(left);
      }
    }, 200);
    return () => clearInterval(id);
  }, [endAt]);

  const start = () => {
    unlockAudio();
    let ms = remaining;
    if (done) {
      setSetNo((n) => Math.min(n + 1, sets));
      setDone(false);
      ms = minutes * 60_000;
    }
    setEndAt(Date.now() + ms);
  };
  const pause = () => {
    if (endRef.current) setRemaining(endRef.current - Date.now());
    setEndAt(null);
  };
  const reset = () => {
    setEndAt(null);
    setDone(false);
    setRemaining(minutes * 60_000);
  };
  const choose = (m: number) => {
    setMinutes(m);
    if (endAt === null) {
      setRemaining(m * 60_000);
      setDone(false);
    }
  };

  const running = endAt !== null;
  const lastSetDone = done && setNo >= sets;

  return (
    <div className={`card clock ${done ? "done" : ""}`}>
      <div className="spread">
        <span className="muted">
          Sett {setNo} av {sets}
        </span>
        <div style={{ minWidth: 170 }}>
          <Segmented
            label="Settlengde"
            value={minutes}
            options={[...new Set([3, 4, 5, defaultMinutes])].sort((a, b) => a - b).map((m) => ({ value: m, label: `${m} min` }))}
            onChange={choose}
          />
        </div>
      </div>
      <div className="digits" role="timer" aria-live="off">
        {lastSetDone ? "Ferdig!" : done ? "Bytt!" : fmt(remaining)}
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        {running ? (
          <button type="button" className="btn big" onClick={pause}>
            Pause
          </button>
        ) : (
          <button type="button" className="btn primary big" onClick={lastSetDone ? onNext : start} disabled={lastSetDone && !onNext}>
            {lastSetDone ? "Neste blokk →" : done ? `Start sett ${setNo + 1}` : remaining < minutes * 60_000 ? "Fortsett" : "Start sett"}
          </button>
        )}
        {!running && (remaining < minutes * 60_000 || done) && (
          <button type="button" className="btn link" onClick={reset}>
            Nullstill
          </button>
        )}
      </div>
    </div>
  );
}
