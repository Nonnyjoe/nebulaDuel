import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { GameLayout } from "@/components/game/GameLayout";
import { PageHeader } from "@/components/game/PageHeader";
import { useAvailableDuels, useAllDuels, usePlayerNames } from "@/hooks/game";
import { isAiDuel, type DuelRow } from "@/lib/cartesi/duels";

const FILTERS = ["Available", "P2P", "AI", "Finished"] as const;
const ZERO = "0x0000000000000000000000000000000000000000";

function short(a?: string) {
  if (!a || a === ZERO) return "—";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

type NameFn = (a?: string) => string;

/** Username when known, else a shortened address. */
function displayName(addr: string | undefined, nameFor: NameFn): string {
  if (!addr || addr === ZERO) return "—";
  return nameFor(addr) || short(addr);
}

/** Human label for the opposing side. */
function opponentLabel(d: DuelRow, nameFor: NameFn): string {
  if (isAiDuel(d)) return `Nebula AI · ${d.difficulty || "AI"}`;
  if (!d.duel_opponent || d.duel_opponent === ZERO) return "Open";
  return displayName(d.duel_opponent, nameFor);
}

export default function Duels() {
  useDocumentTitle("All Duels — Nebula Duel");
  const [f, setF] = useState<(typeof FILTERS)[number]>("Available");
  const available = useAvailableDuels();
  const all = useAllDuels();
  const { nameFor } = usePlayerNames();

  const rows: DuelRow[] = useMemo(() => {
    // Available = open P2P challenges still waiting for an opponent to join.
    if (f === "Available") return available.data ?? [];
    const list = all.data ?? [];
    if (f === "Finished") return list.filter((d) => d.is_completed);
    // AI = duels against the Nebula AI (difficulty Easy/Hard).
    if (f === "AI") return list.filter(isAiDuel);
    // P2P = real player-vs-player duels that have an opponent (already joined).
    return list.filter((d) => !isAiDuel(d) && !!d.duel_opponent && d.duel_opponent !== ZERO);
  }, [f, available.data, all.data]);

  const loading = f === "Available" ? available.isLoading : all.isLoading;

  return (
    <GameLayout>
      <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-12">
        <PageHeader
          eyebrow="The Proving Grounds"
          title="All"
          accent="Duels"
          blurb="Open challenges from across the Nebula — join a P2P duel, spectate finished battles, or strike out against the AI."
          right={
            <Link to="/create-duel" className="px-6 py-3 bg-primary text-primary-foreground font-display text-sm uppercase tracking-widest clip-chrome-sm hover:brightness-110 transition glow-cyan-sm">
              + Create Duel
            </Link>
          }
        />

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((x) => (
            <button key={x} onClick={() => setF(x)} className={`px-5 py-2.5 font-display text-xs uppercase tracking-widest clip-chrome-sm transition ${f === x ? "bg-primary text-primary-foreground" : "bg-panel-2/60 border border-foreground/10 text-muted-foreground hover:text-foreground"}`}>
              {x}
            </button>
          ))}
        </div>

        <div className="glass-panel clip-chrome p-2">
          <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_auto] gap-4 px-4 py-3 border-b border-primary/10 font-mono-display text-[10px] text-muted-foreground uppercase tracking-widest">
            <span>Status</span><span>Challenger</span><span>VS</span><span>Opponent</span><span>Stake</span><span>Action</span>
          </div>

          {loading ? (
            <div className="p-10 grid place-items-center font-mono-display text-[11px] uppercase tracking-widest text-muted-foreground">
              <span className="size-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center font-mono-display text-xs uppercase tracking-widest text-muted-foreground">
              No {f.toLowerCase()} duels right now.
            </div>
          ) : (
            rows.map((d) => {
              const open = !d.duel_opponent || d.duel_opponent === ZERO;
              const status = d.is_completed ? "finished" : open ? "pending" : "live";
              return (
                <div key={d.id} className="grid grid-cols-[auto_1fr_auto_1fr_auto_auto] gap-4 items-center px-4 py-4 border-b border-foreground/5 hover:bg-primary/5 transition-colors font-mono-display text-xs">
                  <span className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${status === "live" ? "bg-destructive animate-pulse-glow" : status === "pending" ? "bg-storm" : "bg-muted-foreground"}`} />
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: status === "live" ? "var(--color-destructive)" : "var(--color-muted-foreground)" }}>{status}</span>
                  </span>
                  <span className="text-foreground truncate">{displayName(d.duel_creator, nameFor)}</span>
                  <span className="font-display italic text-primary">VS</span>
                  <span className={`truncate ${isAiDuel(d) ? "text-storm" : "text-foreground"}`}>{opponentLabel(d, nameFor)}</span>
                  <span className="text-primary text-glow font-display">{d.has_staked ? `${d.stake_amount} CTSI` : "—"}</span>
                  {d.is_completed ? (
                    <Link to={`/replay?duel=${d.id}`} className="px-4 py-1.5 border border-primary/40 text-primary text-[10px] uppercase tracking-widest hover:bg-primary/10 clip-chrome-sm text-center">Replay</Link>
                  ) : open ? (
                    <Link to={`/join/${d.id}`} className="px-4 py-1.5 border border-storm/40 text-storm text-[10px] uppercase tracking-widest hover:bg-storm/10 clip-chrome-sm text-center">Join</Link>
                  ) : (
                    <Link to={`/replay?duel=${d.id}`} className="px-4 py-1.5 border border-foreground/20 text-muted-foreground text-[10px] uppercase tracking-widest hover:bg-foreground/5 clip-chrome-sm text-center">Spectate</Link>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </GameLayout>
  );
}
