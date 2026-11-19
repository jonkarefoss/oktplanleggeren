export function Segmented<T extends string | number>(props: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="segmented" role="group" aria-label={props.label}>
      {props.options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={o.value === props.value}
          onClick={() => props.onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Stepper(props: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const set = (v: number) => props.onChange(Math.min(props.max, Math.max(props.min, v)));
  return (
    <div className="stepper">
      <button type="button" aria-label={`Færre ${props.label}`} onClick={() => set(props.value - 1)} disabled={props.value <= props.min}>
        −
      </button>
      <output aria-live="polite" aria-label={props.label}>
        {props.value}
      </output>
      <button type="button" aria-label={`Flere ${props.label}`} onClick={() => set(props.value + 1)} disabled={props.value >= props.max}>
        +
      </button>
    </div>
  );
}

export function Warnings({ items }: { items: string[] }) {
  const unique = [...new Set(items)];
  if (unique.length === 0) return null;
  return (
    <div className="warn" role="note">
      {unique.length === 1 ? (
        unique[0]
      ) : (
        <ul>
          {unique.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
