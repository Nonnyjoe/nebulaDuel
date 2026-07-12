/**
 * StatBars — the game-wide default for displaying character stats.
 * Same visual language as the campaign enemy-intel cards: label, bar, value.
 */
import React from "react";

export interface StatValues {
  health: number;
  strength: number;
  attack: number;
  speed: number;
}

interface Props {
  stats: StatValues;
  /** "xs" for tight cards, "sm" for roomier panels */
  size?: "xs" | "sm";
  /** Maxima used to scale the bars; defaults fit base + boosted characters. */
  maxima?: Partial<StatValues>;
  className?: string;
}

const DEFAULTS: StatValues = { health: 160, strength: 24, attack: 28, speed: 16 };

const ROWS: {
  key: keyof StatValues;
  label: string;
  color: string;
}[] = [
  { key: "health", label: "HP", color: "bg-myGreen" },
  { key: "attack", label: "ATK", color: "bg-red-400" },
  { key: "strength", label: "STR", color: "bg-orange-400" },
  { key: "speed", label: "SPD", color: "bg-cyan-400" },
];

const StatBars: React.FC<Props> = ({ stats, size = "xs", maxima, className }) => {
  const max = { ...DEFAULTS, ...(maxima ?? {}) };
  const labelW = size === "xs" ? "w-6" : "w-8";
  const valueW = size === "xs" ? "w-7" : "w-9";
  const barH = size === "xs" ? "h-1" : "h-1.5";
  const text = size === "xs" ? "text-[8px]" : "text-[10px]";
  const gap = size === "xs" ? "gap-1.5" : "gap-2";
  const space = size === "xs" ? "space-y-[3px]" : "space-y-1";

  return (
    <div className={`${space} ${className ?? ""}`}>
      {ROWS.map((r) => (
        <div key={r.key} className={`flex items-center ${gap}`}>
          <span className={`${labelW} ${text} text-gray-500 font-belanosima shrink-0`}>
            {r.label}
          </span>
          <div className={`flex-1 ${barH} rounded bg-gray-800 overflow-hidden`}>
            <div
              className={`h-full ${r.color}`}
              style={{
                width: `${Math.min(100, (stats[r.key] / max[r.key]) * 100)}%`,
              }}
            />
          </div>
          <span className={`${valueW} text-right ${text} text-gray-400 font-poppins shrink-0`}>
            {stats[r.key]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StatBars;
