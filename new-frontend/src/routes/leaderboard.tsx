import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { GameLayout } from "@/components/game/GameLayout";
import { PageHeader } from "@/components/game/PageHeader";
import { usePvpLeaderboard, useCampaignLeaderboard } from "@/hooks/game";

const BOARDS = ["PvP", "Campaign"] as const;

interface Row {
  rank: number;
  handle: string;
  address: string;
  wins: number;
  losses: number;
  metric: number; // rating (pvp) or progress (campaign)
  metricLabel: string;
}

function short(a: string) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—";
}

export default function Leaderboard() {
  useDocumentTitle("Leaderboard — Nebula Duel");
  const [board, setBoard] = useState<(typeof BOARDS)[number]>("PvP");
  const [q, setQ] = useState("");
  const pvp = usePvpLeaderboard();
  const campaign = useCampaignLeaderboard();

  const loading = board === "PvP" ? pvp.isLoading : campaign.isLoading;

  const rows: Row[] = useMemo(() => {
    const base: Row[] =
      board === "PvP"
        ? (pvp.data ?? []).map((r) => ({
            rank: r.rank,
            handle: r.monika || short(r.wallet_address),
            address: r.wallet_address,
            wins: r.total_wins,
            losses: r.total_losses,
            metric: r.rating,
            metricLabel: "Rating",
          }))
        : (campaign.data ?? []).map((r) => ({
            rank: r.rank,
            handle: r.monika || short(r.wallet_address),
            address: r.wallet_address,
            wins: r.campaign_wins,
            losses: r.campaign_losses,
            metric: r.campaign_progress,
            metricLabel: "Cleared",
          }));
    if (!q) return base;
    const needle = q.toLowerCase();
    return base.filter((r) => r.handle.toLowerCase().includes(needle) || r.address.toLowerCase().includes(needle));
  }, [board, pvp.data, campaign.data, q]);

  const top = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <GameLayout>
      <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-10 space-y-8">
        <PageHeader
          eyebrow="// HALL OF CHAMPIONS"
          title="Apex"
          accent="Leaderboard"
          blurb="Operators ranked by live on-chain results. Climb the ladder to unlock Sovereign loot pools and seasonal cosmetics."
          right={
            <div className="hidden md:flex gap-2">
              {BOARDS.map((s) => (
                <button key={s} onClick={() => setBoard(s)} className={`px-3 py-2 font-mono-display text-[10px] uppercase tracking-widest clip-chrome-sm transition-colors ${board === s ? "bg-primary text-primary-foreground glow-cyan-sm" : "bg-panel-2/60 text-muted-foreground hover:text-foreground"}`}>
                  {s}
                </button>
              ))}
            </div>
          }
        />

        {loading ? (
          <div className="glass-panel clip-chrome p-12 grid place-items-center"><span className="size-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /></div>
        ) : rows.length === 0 ? (
          <div className="glass-panel clip-chrome p-12 text-center font-mono-display text-xs uppercase tracking-widest text-muted-foreground">No operators ranked yet — play a duel or campaign level.</div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              {top.map((p, i) => {
                const colors = ["legendary", "epic", "rare"] as const;
                const heights = ["md:scale-[1.04]", "md:translate-y-2", "md:translate-y-4"];
                return (
                  <div key={p.address} className={`relative glass-panel clip-bevel p-6 border-t-2 transition-transform ${heights[i]}`} style={{ borderColor: `var(--color-${colors[i]})` }}>
                    <div className="absolute -top-3 left-6 px-3 py-1 font-display text-xs uppercase tracking-widest" style={{ background: `var(--color-${colors[i]})`, color: "var(--background)" }}>
                      Rank · {String(p.rank).padStart(2, "0")}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="size-14 grid place-items-center font-display text-2xl clip-chrome" style={{ background: `var(--color-${colors[i]})`, color: "var(--background)" }}>{p.handle[0]?.toUpperCase()}</div>
                      <div className="min-w-0">
                        <div className="font-display text-2xl uppercase tracking-tight truncate">{p.handle}</div>
                        <div className="font-mono-display text-[10px] text-muted-foreground truncate">{short(p.address)}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-5 font-mono-display text-[10px]">
                      <div><div className="text-muted-foreground uppercase">{p.metricLabel}</div><div className="font-display text-xl text-primary text-glow">{p.metric.toLocaleString()}</div></div>
                      <div><div className="text-muted-foreground uppercase">Wins</div><div className="font-display text-xl">{p.wins}</div></div>
                      <div><div className="text-muted-foreground uppercase">Losses</div><div className="font-display text-xl">{p.losses}</div></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="glass-panel clip-chrome p-3 flex flex-wrap items-center gap-3">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="// SEARCH OPERATOR / WALLET" className="flex-1 min-w-[180px] bg-panel-2/60 px-4 py-2 font-mono-display text-xs uppercase tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary clip-chrome-sm" />
              <div className="md:hidden flex gap-1">
                {BOARDS.map((s) => (
                  <button key={s} onClick={() => setBoard(s)} className={`px-3 py-1.5 text-[10px] font-mono-display uppercase tracking-widest clip-chrome-sm ${board === s ? "bg-primary text-primary-foreground" : "bg-panel-2/60 text-muted-foreground"}`}>{s}</button>
                ))}
              </div>
            </div>

            <div className="glass-panel clip-chrome overflow-hidden">
              <div className="grid grid-cols-[60px_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-panel-2/60 font-mono-display text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                <div>Rank</div><div>Operator</div><div>Wins</div><div className="hidden md:block">Losses</div><div>{rows[0]?.metricLabel ?? "Rating"}</div>
              </div>
              <div className="divide-y divide-primary/5">
                {rest.map((r) => (
                  <div key={r.address} className="grid grid-cols-[60px_1fr_auto_auto_auto] gap-4 px-5 py-3 items-center hover:bg-panel-2/40 transition-colors">
                    <div className="font-display text-lg text-primary">{String(r.rank).padStart(2, "0")}</div>
                    <div className="min-w-0">
                      <div className="font-display text-base uppercase tracking-tight truncate">{r.handle}</div>
                      <div className="font-mono-display text-[10px] text-muted-foreground truncate">{short(r.address)}</div>
                    </div>
                    <div className="font-display text-base">{r.wins}</div>
                    <div className="hidden md:block font-mono-display text-xs text-muted-foreground">{r.losses}</div>
                    <div className="font-display text-base text-primary text-glow">{r.metric.toLocaleString()}</div>
                  </div>
                ))}
                {rest.length === 0 && (
                  <div className="px-5 py-10 text-center font-mono-display text-xs text-muted-foreground uppercase tracking-widest">No more operators match.</div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="text-center">
          <Link to="/create-duel" className="inline-block px-8 py-3 bg-primary text-primary-foreground font-display uppercase tracking-widest clip-chrome-sm hover:brightness-110 glow-cyan-sm">
            Challenge a Champion →
          </Link>
        </div>
      </div>
    </GameLayout>
  );
}
