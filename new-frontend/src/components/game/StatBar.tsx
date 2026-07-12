type Stat = "hp" | "atk" | "str" | "spd";
const LABEL: Record<Stat, string> = { hp: "HP", atk: "ATK", str: "STR", spd: "SPD" };
const MAX: Record<Stat, number> = { hp: 100, atk: 25, str: 25, spd: 25 };

export function StatBar({ stat, value }: { stat: Stat; value: number }) {
  const pct = Math.min(100, (value / MAX[stat]) * 100);
  return (
    <div>
      <div className="flex justify-between font-mono-display text-[10px] mb-1">
        <span className="text-muted-foreground">{LABEL[stat]}</span>
        <span className="text-foreground/90">{value}</span>
      </div>
      <div className="h-1.5 bg-foreground/5 overflow-hidden">
        <div
          className="h-full clip-stat"
          style={{ width: `${pct}%`, background: `var(--color-${stat})` }}
        />
      </div>
    </div>
  );
}
