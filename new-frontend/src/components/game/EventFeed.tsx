import { useEffect, useState } from "react";

interface Event {
  id: number;
  kind: "duel" | "drop" | "system" | "reward";
  text: string;
}

const POOL: Omit<Event, "id">[] = [
  { kind: "duel",   text: "0xA12...4B knocked out VOIDWALKER with a 220% crit." },
  { kind: "reward", text: "Daily quest cleared: +120 arena points credited." },
  { kind: "drop",   text: "New Legendary 'Vespera Dusk' minted in market." },
  { kind: "system", text: "Sector latency 24ms — rollup stable." },
  { kind: "duel",   text: "Storm vs Psychic resolved · winner gains 18 CTSI." },
  { kind: "reward", text: "Achievement unlocked: Stormcaller (25 stuns)." },
  { kind: "drop",   text: "Limited drop: Nature skin pack — 6h left." },
  { kind: "duel",   text: "AI · Hard challenge open · stake 5 CTSI." },
];

const COLORS: Record<Event["kind"], string> = {
  duel: "var(--color-destructive)",
  drop: "var(--color-legendary)",
  system: "var(--color-primary)",
  reward: "var(--color-nature)",
};

export function EventFeed() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    let i = 0;
    const push = () => {
      setEvents((prev) => {
        const next: Event = { id: Date.now() + i, ...POOL[i % POOL.length] };
        i++;
        return [next, ...prev].slice(0, 5);
      });
    };
    push();
    const t = setInterval(push, 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="glass-panel clip-chrome p-3 space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-destructive animate-pulse-glow" />
          <span className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-primary">// LIVE FEED</span>
        </div>
        <span className="font-mono-display text-[9px] uppercase tracking-widest text-muted-foreground">Auto · 4s</span>
      </div>
      <div className="space-y-1">
        {events.map((e) => (
          <div
            key={e.id}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2 bg-panel-2/40 border-l-2 animate-fade-up"
            style={{ borderColor: COLORS[e.kind] }}
          >
            <span className="font-mono-display text-[9px] uppercase tracking-widest" style={{ color: COLORS[e.kind] }}>
              {e.kind}
            </span>
            <span className="font-mono-display text-[11px] text-foreground/90 truncate">{e.text}</span>
            <span className="font-mono-display text-[9px] text-muted-foreground uppercase">now</span>
          </div>
        ))}
      </div>
    </div>
  );
}
