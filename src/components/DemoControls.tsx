import type { Mode } from "../types";
export function DemoControls({
  mode,
  auto,
  busy,
  onMode,
  onReset,
  onAuto,
}: {
  mode: Mode;
  auto: boolean;
  busy: boolean;
  onMode: (m: Mode) => void;
  onReset: () => void;
  onAuto: () => void;
}) {
  return (
    <div className="controls">
      <div className="mode-switch" aria-label="Fanout mode">
        <button
          aria-pressed={mode === "normal"}
          disabled={busy}
          onClick={() => onMode("normal")}
        >
          Normal User
        </button>
        <button
          aria-pressed={mode === "celebrity"}
          disabled={busy}
          onClick={() => onMode("celebrity")}
        >
          Celebrity
        </button>
      </div>
      <button className="reset" onClick={onReset}>
        Reset Demo
      </button>
      <button className="auto" onClick={onAuto}>
        {auto ? "■ Stop Demo" : "▶ Auto Demo"}
      </button>
    </div>
  );
}
