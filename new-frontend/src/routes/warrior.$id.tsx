import { Link, useParams } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { GameLayout } from "@/components/game/GameLayout";
import { ElementBadge } from "@/components/game/ElementBadge";
import { StatBar } from "@/components/game/StatBar";
import { WarriorCard } from "@/components/game/WarriorCard";
import { WARRIORS, RARITY_TOKEN, type Rarity } from "@/lib/game-data";
import { MOVES, type MoveId } from "@/lib/moves";
import { playSfx } from "@/lib/sound";

function WarriorNotFound() {
  return (
    <GameLayout>
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-4">
        <div className="font-mono-display text-[10px] tracking-[0.3em] text-destructive uppercase">// SIGNAL LOST</div>
        <h1 className="font-display text-5xl italic uppercase">Warrior Not Found</h1>
        <p className="text-sm text-muted-foreground">That unit is not in your operator registry.</p>
        <Link to="/market" className="inline-block px-6 py-3 bg-primary text-primary-foreground font-display uppercase tracking-widest clip-chrome-sm">Browse Market</Link>
      </div>
    </GameLayout>
  );
}

export default function Detail() {
  const { id } = useParams();
  const w = WARRIORS.find((x) => x.id === id);
  useDocumentTitle(`${w?.name ?? "Warrior"} — Nebula Duel`);
  if (!w) return <WarriorNotFound />;
  // The warrior's power is its super_power, which maps 1:1 onto the move codex.
  const sig = MOVES[w.power as MoveId] ?? MOVES.Thunderbolt;
  const similar = WARRIORS.filter((x) => x.id !== w.id).slice(0, 3);
  const rarityToken = RARITY_TOKEN[w.rarity as Rarity];

  return (
    <GameLayout>
      <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-10 space-y-10">
        <Link to="/market" className="inline-block font-mono-display text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary">
          ← Back to Market
        </Link>

        {/* Hero dossier */}
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
          <div className="relative glass-panel clip-bevel p-2 glow-cyan">
            <div className="relative aspect-[3/4] overflow-hidden">
              <img src={w.image} alt={w.name} className="size-full object-cover" />
              <div className="absolute inset-0 scanline opacity-40 pointer-events-none" />
              <span className="absolute top-3 left-3 size-6 border-t-2 border-l-2 border-primary" />
              <span className="absolute top-3 right-3 size-6 border-t-2 border-r-2 border-primary" />
              <span className="absolute bottom-3 left-3 size-6 border-b-2 border-l-2 border-primary" />
              <span className="absolute bottom-3 right-3 size-6 border-b-2 border-r-2 border-primary" />
              <div className="absolute top-4 left-4">
                <ElementBadge element={w.element} size="md" />
              </div>
              <div className="absolute bottom-4 right-4 px-3 py-1 font-display uppercase text-xs tracking-widest" style={{ background: `var(--color-${rarityToken})`, color: "var(--background)" }}>
                {w.rarity}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-primary mb-2">// UNIT DOSSIER · {w.id.toUpperCase()}</div>
              <h1 className="font-display text-5xl md:text-7xl italic uppercase leading-[0.85] tracking-tighter">
                {w.name}
              </h1>
              <div className="mt-2 font-mono-display text-sm text-muted-foreground tracking-wider">{w.title} · Lvl {w.level}</div>
            </div>

            <div className="glass-panel clip-chrome p-5 space-y-3">
              <div className="font-mono-display text-[10px] uppercase tracking-widest text-primary">// COMBAT METRICS</div>
              <StatBar stat="hp" value={w.hp} />
              <StatBar stat="atk" value={w.atk} />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-panel-2/60 p-3 clip-chrome-sm">
                  <div className="font-mono-display text-[10px] text-muted-foreground uppercase">Strength</div>
                  <div className="font-display text-3xl text-glow" style={{ color: "var(--color-str)" }}>{w.str}</div>
                </div>
                <div className="bg-panel-2/60 p-3 clip-chrome-sm">
                  <div className="font-mono-display text-[10px] text-muted-foreground uppercase">Speed</div>
                  <div className="font-display text-3xl text-glow" style={{ color: "var(--color-spd)" }}>{w.spd}</div>
                </div>
              </div>
            </div>

            {/* Signature move */}
            <button
              type="button"
              onClick={() => playSfx(sig.sfx)}
              className="w-full text-left glass-panel clip-bevel p-5 border-l-2 border-primary group hover:bg-panel-2/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono-display text-[10px] uppercase tracking-widest text-primary">// SIGNATURE MOVE</div>
                  <div className="font-display text-3xl italic uppercase tracking-tight">{sig.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{sig.special}</div>
                </div>
                <div className="relative size-16 grid place-items-center shrink-0">
                  <img src={sig.vfx} alt="" className="size-16 object-contain group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 font-mono-display text-[10px] uppercase">
                <div className="bg-panel-2/60 p-2">
                  <div className="text-muted-foreground">Damage</div>
                  <div className="text-foreground font-display text-base">{sig.damageLabel}</div>
                </div>
                <div className="bg-panel-2/60 p-2">
                  <div className="text-muted-foreground">Travel</div>
                  <div className="text-foreground font-display text-base">{sig.travel}</div>
                </div>
                <div className="bg-panel-2/60 p-2">
                  <div className="text-muted-foreground">SFX</div>
                  <div className="text-primary font-display text-base">▶ {sig.sfx}</div>
                </div>
              </div>
            </button>

            <div className="flex flex-wrap gap-3">
              <Link to="/create-duel" className="px-6 py-3 bg-primary text-primary-foreground font-display uppercase tracking-widest clip-chrome-sm hover:brightness-110 glow-cyan-sm">
                Deploy to Squad
              </Link>
              <Link to="/codex" className="px-6 py-3 border border-primary/40 text-primary font-display uppercase tracking-widest clip-chrome-sm hover:bg-primary/10">
                View Codex
              </Link>
              {w.priceEth && (
                <div className="ml-auto glass-hud clip-chrome-sm px-4 py-2 font-mono-display text-[11px]">
                  <span className="text-muted-foreground uppercase tracking-widest">Market · </span>
                  <span className="text-primary font-display text-base">{w.priceEth} CTSI</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lore */}
        <div className="glass-panel clip-bevel p-6 grid md:grid-cols-[1fr_2fr] gap-6">
          <div>
            <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase">// LORE</div>
            <h2 className="font-display text-3xl italic uppercase">Origin</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Forged in the {w.element.toLowerCase()} fault lines of the outer rim, {w.name} answers
            only to operators worthy of the {w.rarity.toLowerCase()} sigil. Specialised in <span className="text-primary">{sig.name}</span>,
            this unit favours decisive engagements where {sig.special.toLowerCase()} can swing tempo within the first two rounds.
            Pair with complementary elements to exploit the triangle and dominate the arena.
          </p>
        </div>

        {/* Similar units */}
        <div>
          <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase mb-2">// SIMILAR UNITS</div>
          <h3 className="font-display text-3xl italic uppercase tracking-tight mb-5">Recommended Pairings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {similar.map((s) => (
              <Link key={s.id} to={`/warrior/${s.id}`} className="block">
                <WarriorCard warrior={s} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
