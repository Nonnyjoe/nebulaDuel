import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { GameLayout } from "@/components/game/GameLayout";
import { PageHeader } from "@/components/game/PageHeader";
import { ElementBadge } from "@/components/game/ElementBadge";
import { MOVE_LIST, type MoveDef } from "@/lib/moves";
import { playSfx, audio } from "@/lib/sound";

export default function Codex() {
  useDocumentTitle("Move Codex — Nebula Duel");
  const [active, setActive] = useState<MoveDef>(MOVE_LIST[0]);
  const [filter, setFilter] = useState<string>("All");
  const elements = ["All", "Fire", "Water", "Nature", "Storm", "Psychic", "Shadow", "Neutral"];
  const filtered = filter === "All" ? MOVE_LIST : MOVE_LIST.filter(m => m.element === filter);

  const preview = (m: MoveDef) => {
    audio.unlock();
    setActive(m);
    playSfx(m.sfx);
  };

  return (
    <GameLayout>
      <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-10">
        <PageHeader
          eyebrow="// ARSENAL CODEX"
          title="Super"
          accent="Moves"
          blurb="Every signature move warriors can cast in the arena. Tap any move to hear it and preview the VFX."
        />

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {elements.map((el) => {
            const a = filter === el;
            return (
              <button key={el} onClick={() => setFilter(el)}
                className={`px-3 py-1.5 text-[10px] font-mono-display uppercase tracking-widest clip-chrome-sm transition ${
                  a ? "bg-primary text-primary-foreground" : "border border-foreground/10 text-muted-foreground hover:text-foreground"
                }`}>
                {el}
              </button>
            );
          })}
          <span className="ml-auto font-mono-display text-[10px] text-muted-foreground uppercase tracking-widest self-center">
            {filtered.length} moves · tap to preview
          </span>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
          {/* Featured */}
          <div className="lg:sticky lg:top-24 self-start space-y-4">
            <div className="relative aspect-square glass-panel clip-bevel overflow-hidden grid place-items-center"
              style={{
                background: `radial-gradient(circle at center, ${active.tint}33, transparent 70%), var(--color-panel)`,
              }}>
              <div className="absolute inset-0 grid-pattern opacity-20" />
              <div className="absolute inset-0 scanline opacity-40" />
              <img
                key={active.id}
                src={active.vfx}
                alt={active.name}
                className="relative w-2/3 h-auto animate-fade-up"
                style={{ filter: `drop-shadow(0 0 48px ${active.tint}) brightness(1.15)` }}
              />
              {active.vfxAlt && (
                <img src={active.vfxAlt} alt="" className="absolute inset-0 m-auto w-2/3 h-auto opacity-70 mix-blend-screen animate-pulse-glow"
                  style={{ filter: `drop-shadow(0 0 24px ${active.tint})` }} />
              )}
              <span className="absolute top-3 left-3 size-6 border-t-2 border-l-2 border-primary" />
              <span className="absolute top-3 right-3 size-6 border-t-2 border-r-2 border-primary" />
              <span className="absolute bottom-3 left-3 size-6 border-b-2 border-l-2 border-primary" />
              <span className="absolute bottom-3 right-3 size-6 border-b-2 border-r-2 border-primary" />
            </div>

            <div className="glass-panel clip-chrome p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-mono-display text-[10px] uppercase tracking-widest text-primary mb-1">// SIGNATURE</div>
                  <h2 className="font-display text-4xl italic uppercase tracking-tight">{active.name}</h2>
                </div>
                <ElementBadge element={active.element} />
              </div>
              <p className="text-sm text-muted-foreground mb-4">{active.short} — {active.special}.</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-panel-2/60 p-3">
                  <div className="text-[9px] font-mono-display uppercase text-muted-foreground tracking-widest">Damage</div>
                  <div className="font-display text-2xl text-primary text-glow">{active.damageLabel}</div>
                </div>
                <div className="bg-panel-2/60 p-3">
                  <div className="text-[9px] font-mono-display uppercase text-muted-foreground tracking-widest">Travel</div>
                  <div className="font-display text-lg uppercase">{active.travel}</div>
                </div>
                <div className="bg-panel-2/60 p-3">
                  <div className="text-[9px] font-mono-display uppercase text-muted-foreground tracking-widest">SFX</div>
                  <div className="font-display text-lg uppercase">{active.sfx}</div>
                </div>
              </div>
              <button onClick={() => preview(active)} className="mt-4 w-full py-3 bg-primary text-primary-foreground font-display uppercase tracking-widest clip-chrome-sm hover:brightness-110 glow-cyan-sm">
                ▶ Replay Cast
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 gap-3">
            {filtered.map((m, i) => {
              const a = active.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => preview(m)}
                  className={`group text-left glass-panel clip-chrome-sm p-4 transition-all ${a ? "border-2 border-primary glow-cyan-sm" : "border border-foreground/10 hover:border-primary/50"}`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex gap-3 items-center">
                    <div className="relative size-16 shrink-0 grid place-items-center bg-panel-2 clip-chrome-sm overflow-hidden"
                      style={{ background: `radial-gradient(circle, ${m.tint}40, transparent)` }}>
                      <img src={m.vfx} alt="" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
                        style={{ filter: `drop-shadow(0 0 12px ${m.tint})` }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="font-display text-base uppercase tracking-tight truncate">{m.name}</div>
                        <span className="font-display text-sm text-primary shrink-0">{m.damageLabel}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{m.special}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <ElementBadge element={m.element} />
                        <span className="text-[9px] font-mono-display uppercase tracking-widest text-muted-foreground">{m.travel}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
