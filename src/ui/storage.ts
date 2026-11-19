import type { SessionInput } from "../planner/types";

// Lagrer bare oppsett og valg. Aldri navn eller nivå på barn.
const KEY_INPUT = "okt.input.v1";
const KEY_SAVED = "okt.saved.v1";

export interface SavedSession {
  id: string;
  savedAt: string;
  name: string;
  input: SessionInput;
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Privat modus eller full lagring: appen virker likevel, bare uten lagring.
  }
}

export const loadInput = () => read<SessionInput>(KEY_INPUT);
export const saveInput = (input: SessionInput) => write(KEY_INPUT, input);

export const loadSaved = () => read<SavedSession[]>(KEY_SAVED) ?? [];

export function addSaved(name: string, input: SessionInput): SavedSession[] {
  const entry: SavedSession = { id: String(Date.now()), savedAt: new Date().toISOString(), name, input };
  const list = [entry, ...loadSaved()].slice(0, 20);
  write(KEY_SAVED, list);
  return list;
}

export function removeSaved(id: string): SavedSession[] {
  const list = loadSaved().filter((s) => s.id !== id);
  write(KEY_SAVED, list);
  return list;
}
