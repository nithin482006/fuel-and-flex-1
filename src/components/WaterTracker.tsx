import { useState } from "react";
import { Droplet, RotateCcw, Plus, X } from "lucide-react";

export const WATER_PRESETS = [250, 500, 750, 1000];

export type WaterTrackerProps = {
  consumedMl: number;
  goalMl: number;
  onAdd: (ml: number) => void;
  onReset: () => void;
  /** "full" = ring + stats (Macros page), "compact" = inline widget (Today page) */
  variant?: "full" | "compact";
};

/**
 * Single shared water-tracking control used by both the Today dashboard and the
 * Macros page. It owns no data: totals/goal come in as props and add/reset are
 * delegated to the existing shared water state (useDailyNutrition / water_logs).
 */
export function WaterTracker({ consumedMl, goalMl, onAdd, onReset, variant = "full" }: WaterTrackerProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [custom, setCustom] = useState("");

  const pct = goalMl > 0 ? Math.min(100, (consumedMl / goalMl) * 100) : 0;
  const remaining = Math.max(0, goalMl - consumedMl);
  const goalReached = goalMl > 0 && consumedMl >= goalMl;
  const r = 60;
  const c = 2 * Math.PI * r;

  const customValue = Number(custom);
  const customValid = Number.isFinite(customValue) && customValue > 0 && customValue <= 5000;

  function submitCustom() {
    if (!customValid) return;
    onAdd(Math.round(customValue));
    setCustom("");
    setCustomOpen(false);
  }

  const controls = (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {WATER_PRESETS.map((ml) => (
          <button
            key={ml}
            type="button"
            onClick={() => onAdd(ml)}
            className="ff-btn h-10 text-xs font-semibold text-sky-300"
            style={{ borderColor: "rgba(96,165,250,0.35)", background: "rgba(96,165,250,0.10)" }}
          >
            +{ml < 1000 ? `${ml} ml` : `${ml / 1000} L`}
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {customOpen ? (
          <>
            <input
              type="number"
              min={1}
              max={5000}
              autoFocus
              inputMode="numeric"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitCustom(); if (e.key === "Escape") setCustomOpen(false); }}
              placeholder="Amount in ml (1–5000)"
              className="ff-input h-10 min-w-0 flex-1 px-3 text-sm outline-none"
            />
            <button
              type="button"
              onClick={submitCustom}
              disabled={!customValid}
              className="ff-btn h-10 px-4 text-sm font-bold flex items-center gap-1 disabled:opacity-40"
              style={{ background: "var(--ff-water)", borderColor: "var(--ff-water)", color: "#04121F" }}
            >
              <Plus className="w-4 h-4" />Add
            </button>
            <button type="button" onClick={() => setCustomOpen(false)} title="Cancel"
              className="ff-btn h-10 w-10 text-zinc-400 flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setCustomOpen(true)}
              className="ff-btn h-10 flex-1 px-3 text-xs font-semibold text-sky-300 flex items-center justify-center gap-1"
              style={{ borderColor: "rgba(96,165,250,0.35)" }}>
              <Plus className="w-4 h-4" />Custom amount
            </button>
            <button type="button" onClick={onReset} title="Reset today's water"
              className="ff-btn h-10 px-3 text-xs font-semibold text-zinc-400 hover:text-red-400 flex items-center justify-center gap-1">
              <RotateCcw className="w-4 h-4" />Reset
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (variant === "compact") {
    return (
      <div className="rounded-xl p-3" style={{ border: "1px solid rgba(59,130,246,0.25)", background: "rgba(59,130,246,0.06)" }}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-sky-400" />
            <span className="text-[13px] font-bold">Water Intake</span>
            {goalReached && <span className="ff-display text-[10px] font-bold uppercase text-emerald-400">Goal ✓</span>}
          </div>
          <span className="ff-mono text-xs text-sky-300">
            {(consumedMl / 1000).toFixed(2)}L / {(goalMl / 1000).toFixed(2)}L
          </span>
        </div>
        {controls}
      </div>
    );
  }

  return (
    <div className={`ff-card ${goalReached ? "ff-card-glow" : ""} p-5 mb-6`}>
      <div className="flex items-center gap-2 mb-4">
        <Droplet className="w-4 h-4 text-sky-400" />
        <h3 className="ff-display text-sm font-bold uppercase">Water Intake</h3>
        {goalReached && <span className="ff-display ml-2 text-[10px] font-bold uppercase text-emerald-400">Goal reached ✓</span>}
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <div className="relative shrink-0 mx-auto sm:mx-0">
          <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
            <circle cx="75" cy="75" r={r} strokeWidth="12" stroke="var(--ff-surf3)" fill="none" />
            <circle cx="75" cy="75" r={r} strokeWidth="12" stroke="url(#gradW)" fill="none"
              strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.6s ease" }} />
            <defs><linearGradient id="gradW" x1="0" x2="1"><stop offset="0" stopColor="#3B82F6" /><stop offset="1" stopColor="var(--ff-water)" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="ff-mono text-2xl font-bold tabular-nums">{(consumedMl / 1000).toFixed(2)}L</div>
            <div className="ff-label">{Math.round(pct)}%</div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <WaterRow label="Goal" value={`${(goalMl / 1000).toFixed(2)} L`} />
          <WaterRow label="Consumed" value={`${(consumedMl / 1000).toFixed(2)} L`} />
          <WaterRow label="Remaining" value={`${(remaining / 1000).toFixed(2)} L`} highlight />
        </div>
        {controls}
      </div>
    </div>
  );
}

function WaterRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-b-0" style={{ borderColor: "var(--ff-bdr)" }}>
      <span className="ff-label">{label}</span>
      <span className={`ff-mono text-sm font-semibold ${highlight ? "text-sky-400" : ""}`}>{value}</span>
    </div>
  );
}

export default WaterTracker;