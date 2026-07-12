import type { Warrior } from "@/lib/game-data";
import { RARITY_TOKEN } from "@/lib/game-data";
import { ElementBadge } from "./ElementBadge";
import { StatBar } from "./StatBar";

interface Props {
  warrior: Warrior;
  selected?: boolean;
  selectedIndex?: number;
  onClick?: () => void;
  compact?: boolean;
}

export function WarriorCard({ warrior, selected, selectedIndex, onClick, compact }: Props) {
  const rarityToken = RARITY_TOKEN[warrior.rarity];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative glass-panel clip-chrome p-1 text-left overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
        selected ? "ring-2 ring-primary glow-cyan-sm" : "hover:ring-1 hover:ring-primary/60"
      }`}
    >
      {/* element badge */}
      <div className="absolute top-2 right-2 z-20">
        <ElementBadge element={warrior.element} />
      </div>

      {/* selected index */}
      {selected && selectedIndex !== undefined && (
        <div className="absolute top-2 left-2 z-20 size-7 grid place-items-center bg-primary text-primary-foreground font-display text-sm animate-pulse-glow">
          {selectedIndex + 1}
        </div>
      )}

      {/* portrait */}
      <div className="relative aspect-[3/4] overflow-hidden bg-panel-2">
        <img
          src={warrior.image}
          alt={warrior.name}
          loading="lazy"
          className="absolute inset-0 size-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/40 to-transparent" />
        <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />
        {/* corner brackets */}
        <span className="absolute top-1 left-1 size-3 border-t border-l border-primary/60" />
        <span className="absolute bottom-1 right-1 size-3 border-b border-r border-primary/60" />
      </div>

      {/* info */}
      <div className="p-4 bg-panel/80 space-y-3 relative">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-lg tracking-tight uppercase truncate">{warrior.name}</h3>
            <p className="text-[10px] text-muted-foreground font-mono-display tracking-wider truncate">{warrior.title}</p>
          </div>
          <span
            className="text-[9px] font-mono-display uppercase shrink-0"
            style={{ color: `var(--color-${rarityToken})` }}
          >
            {warrior.rarity}
          </span>
        </div>

        {!compact && (
          <div className="space-y-2">
            <StatBar stat="hp" value={warrior.hp} />
            <StatBar stat="atk" value={warrior.atk} />
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="text-[9px] text-muted-foreground font-mono-display">STR</div>
                <div className="text-sm font-display">{warrior.str}</div>
              </div>
              <div>
                <div className="text-[9px] text-muted-foreground font-mono-display">SPD</div>
                <div className="text-sm font-display">{warrior.spd}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
