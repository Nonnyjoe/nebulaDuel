import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { GameLayout } from "@/components/game/GameLayout";
import { PageHeader } from "@/components/game/PageHeader";
import { WarriorCard } from "@/components/game/WarriorCard";
import { ElementBadge } from "@/components/game/ElementBadge";
import { toWarrior } from "@/lib/game/warrior-adapter";
import type { Element } from "@/lib/game-data";
import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { usePlayerCharacters, useAchievements, useAllDuels } from "@/hooks/game";

const ELEMENTS: Element[] = ["Fire", "Water", "Nature", "Storm", "Psychic", "Shadow", "Neutral"];
const ZERO = "0x0000000000000000000000000000000000000000";

export default function Profile() {
  useDocumentTitle("Command Center — Nebula Duel");
  const { address, isConnected, connect } = useWallet();
  const { profile } = useProfile();
  const { data: roster } = usePlayerCharacters(address);
  const { data: achievements } = useAchievements(address);
  const { data: duels } = useAllDuels();

  const wins = Number(profile?.total_wins ?? 0);
  const losses = Number(profile?.total_losses ?? 0);
  const points = Number(profile?.points ?? 0);
  const wr = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  const mastery = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of roster ?? []) counts[c.element] = (counts[c.element] ?? 0) + 1;
    const max = Math.max(1, ...Object.values(counts));
    return ELEMENTS.map((el) => ({ el, pct: Math.round(((counts[el] ?? 0) / max) * 100) }));
  }, [roster]);

  const history = useMemo(() => {
    if (!address) return [];
    return (duels ?? [])
      .filter((d) => d.is_completed && (d.duel_creator?.toLowerCase() === address || d.duel_opponent?.toLowerCase() === address))
      .slice(-6)
      .reverse()
      .map((d) => {
        const opp = d.duel_creator?.toLowerCase() === address ? d.duel_opponent : d.duel_creator;
        const win = d.winner?.toLowerCase() === address;
        return { id: d.id, op: opp && opp !== ZERO ? `${opp.slice(0, 6)}…` : "AI", win, stake: d.has_staked ? d.stake_amount : 0 };
      });
  }, [duels, address]);

  if (!isConnected) {
    return (
      <GameLayout>
        <div className="max-w-2xl mx-auto px-6 py-28 text-center space-y-5">
          <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase">// COMMAND CENTER</div>
          <h1 className="font-display text-5xl italic uppercase">Connect to view your profile</h1>
          <button onClick={connect} className="px-8 py-4 bg-primary text-primary-foreground font-display text-lg uppercase tracking-widest clip-chrome-sm glow-cyan-sm hover:brightness-110">
            Connect Wallet
          </button>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout>
      <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-10 space-y-8">
        <PageHeader eyebrow="// COMMAND CENTER" title={profile?.monika ?? "Operator"} accent="" blurb="Your operator profile, owned roster, recent duels and unlocked feats." />

        {/* Identity strip */}
        <div className="glass-panel clip-bevel p-6 grid lg:grid-cols-[auto_1fr_auto] gap-6 items-center">
          <div className="flex items-center gap-4">
            <div className="size-20 grid place-items-center bg-primary text-primary-foreground font-display text-4xl clip-chrome overflow-hidden">
              {profile?.avatar_url ? <img src={String(profile.avatar_url)} alt="" className="size-full object-cover" /> : (profile?.monika?.[0]?.toUpperCase() ?? "A")}
            </div>
            <div>
              <div className="font-mono-display text-[10px] uppercase tracking-widest text-primary">// OPERATOR</div>
              <h2 className="font-display text-4xl uppercase italic tracking-tight">{profile?.monika ?? "Operator"}</h2>
              <div className="font-mono-display text-[11px] text-muted-foreground">{address?.slice(0, 6)}…{address?.slice(-4)}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { l: "Wins", v: wins.toString(), accent: "primary" },
              { l: "Losses", v: losses.toString(), accent: "destructive" },
              { l: "Win Rate", v: `${wr}%`, accent: "primary" },
              { l: "Arena Pts", v: points.toLocaleString(), accent: "legendary" },
            ].map((s) => (
              <div key={s.l} className="glass-hud clip-chrome-sm p-3 text-center">
                <div className="text-[9px] font-mono-display text-muted-foreground uppercase tracking-widest">{s.l}</div>
                <div className="font-display text-2xl text-glow" style={{ color: `var(--color-${s.accent})` }}>{s.v}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Link to="/create-duel" className="px-6 py-3 bg-primary text-primary-foreground font-display uppercase tracking-widest text-sm clip-chrome-sm hover:brightness-110 glow-cyan-sm">New Duel</Link>
            <Link to="/market" className="px-6 py-3 border border-primary/40 text-primary font-display uppercase tracking-widest text-sm clip-chrome-sm hover:bg-primary/10">Recruit</Link>
          </div>
        </div>

        {/* Roster + history */}
        <div className="grid lg:grid-cols-[1.55fr_1fr] gap-6">
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase">// ROSTER</div>
                <h3 className="font-display text-3xl uppercase italic tracking-tight">Owned Warriors</h3>
              </div>
              <span className="font-mono-display text-[11px] text-muted-foreground uppercase">{roster?.length ?? 0} units</span>
            </div>
            {!roster?.length ? (
              <div className="glass-panel clip-chrome p-10 text-center font-mono-display text-xs uppercase tracking-widest text-muted-foreground">
                No warriors yet. <Link to="/market" className="text-primary">Recruit some →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {roster.map((c, i) => (
                  <div key={c.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                    <WarriorCard warrior={toWarrior(c)} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase">// LEDGER</div>
              <h3 className="font-display text-3xl uppercase italic tracking-tight">Recent Duels</h3>
            </div>
            <div className="glass-panel clip-chrome p-3 space-y-1.5">
              {history.length === 0 ? (
                <div className="px-3 py-6 text-center font-mono-display text-[11px] uppercase tracking-widest text-muted-foreground">No completed duels yet.</div>
              ) : history.map((h) => (
                <div key={h.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2.5 bg-panel-2/40 hover:bg-panel-2/80 transition-colors border-l-2" style={{ borderColor: h.win ? "var(--color-primary)" : "var(--color-destructive)" }}>
                  <span className={`font-display text-sm uppercase tracking-widest ${h.win ? "text-primary" : "text-destructive"}`}>{h.win ? "WIN" : "LOSS"}</span>
                  <span className="font-mono-display text-[11px] text-foreground/80 truncate">vs {h.op}</span>
                  <span className={`font-display text-sm ${h.win ? "text-primary text-glow" : "text-destructive"}`}>{h.stake ? `${h.win ? "+" : "−"}${h.stake}` : "—"}</span>
                </div>
              ))}
              <Link to="/duels" className="block text-center text-[10px] font-mono-display uppercase tracking-widest text-primary hover:text-glow pt-2">View All Duels →</Link>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {achievements && (
          <div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase">// FEATS</div>
                <h3 className="font-display text-3xl uppercase italic tracking-tight">Achievements</h3>
              </div>
              <span className="font-mono-display text-[11px] text-muted-foreground uppercase">{achievements.earned} / {achievements.total} unlocked</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {achievements.badges.map((a) => (
                <div key={a.id} className={`glass-panel clip-chrome-sm p-4 flex gap-3 items-start ${a.earned ? "border border-primary/40" : "border border-foreground/5 opacity-70"}`}>
                  <div className={`size-12 grid place-items-center text-2xl shrink-0 ${a.earned ? "bg-primary text-primary-foreground glow-cyan-sm" : "bg-panel-2 text-muted-foreground"}`}>★</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-base uppercase tracking-tight">{a.name}</div>
                    <div className="text-[11px] text-muted-foreground mb-2">{a.description}</div>
                    {a.earned ? (
                      <div className="text-[10px] font-mono-display text-primary uppercase tracking-widest">// UNLOCKED</div>
                    ) : (
                      <div className="space-y-1">
                        <div className="h-1 bg-panel-2 clip-stat overflow-hidden"><div className="h-full bg-primary/70" style={{ width: `${a.progress ?? 0}%` }} /></div>
                        <div className="text-[10px] font-mono-display text-muted-foreground uppercase tracking-widest">{a.progress ?? 0}%</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Element mastery (derived from owned roster) */}
        <div className="glass-panel clip-bevel p-6">
          <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase mb-4">// ELEMENT MASTERY</div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {mastery.map(({ el, pct }) => (
              <div key={el} className="space-y-2">
                <div className="flex items-center justify-between">
                  <ElementBadge element={el} />
                  <span className="font-display text-sm text-primary">{pct}%</span>
                </div>
                <div className="h-1.5 bg-panel-2 clip-stat overflow-hidden">
                  <div className="h-full" style={{ width: `${pct}%`, background: `var(--color-${el === "Shadow" ? "shadow-el" : el === "Neutral" ? "neutral-el" : el.toLowerCase()})` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
