import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { GameLayout } from "@/components/game/GameLayout";
import { PageHeader } from "@/components/game/PageHeader";
import { ElementBadge } from "@/components/game/ElementBadge";
import { StatBar } from "@/components/game/StatBar";
import { STRATEGIES, fetchDuelBattleReport } from "@/lib/cartesi/game-types";
import { type MarketCharacter } from "@/lib/cartesi/market";
import { useWallet } from "@/hooks/useWallet";
import { useSendInput } from "@/hooks/useSendInput";
import { useAllDuels, useDuelCharacters, useAllCharacters } from "@/hooks/game";

const STRATS = STRATEGIES; // all 6 backend strategies (ids 1-6)
const ZERO = "0x0000000000000000000000000000000000000000";

function FighterCard({ c, side }: { c: Partial<MarketCharacter>; side: "ally" | "enemy" }) {
  return (
    <div className="glass-panel clip-chrome p-1 relative">
      <div className="relative aspect-[4/5] overflow-hidden bg-panel-2">
        {c.img && <img src={c.img} alt={c.name} className="absolute inset-0 size-full object-cover" loading="lazy" />}
        <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/30 to-transparent" />
        {c.element && <div className="absolute top-2 right-2"><ElementBadge element={c.element} /></div>}
      </div>
      <div className="p-3 bg-panel/80 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base uppercase tracking-tight truncate">{c.name ?? "—"}</h3>
          <span className="text-[9px] font-mono-display uppercase" style={{ color: `var(--color-${side === "ally" ? "primary" : "destructive"})` }}>{side === "ally" ? "ALLY" : "FOE"}</span>
        </div>
        <StatBar stat="hp" value={c.health ?? 0} />
        <div className="grid grid-cols-3 gap-2 font-mono-display text-[10px] pt-1">
          <div><div className="text-muted-foreground">ATK</div><div>{c.attack ?? "—"}</div></div>
          <div><div className="text-muted-foreground">STR</div><div>{c.strength ?? "—"}</div></div>
          <div><div className="text-muted-foreground">SPD</div><div>{c.speed ?? "—"}</div></div>
        </div>
      </div>
    </div>
  );
}

export default function Battle() {
  useDocumentTitle("Choose Strategy — Nebula Duel");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const duelId = params.get("duel");
  const { address } = useWallet();
  const { send, pending } = useSendInput();
  const [strategy, setStrategy] = useState(STRATS[1]?.id ?? 2);

  const { data: duels } = useAllDuels();
  const { data: mySquad } = useDuelCharacters(duelId, address);
  const { data: allChars } = useAllCharacters();

  const duel = useMemo(() => (duels ?? []).find((d) => String(d.id) === duelId), [duels, duelId]);

  const enemySquad = useMemo(() => {
    if (!duel || !address || !allChars) return [];
    const mine = duel.duel_creator?.toLowerCase() === address;
    const enemyIds: number[] = mine ? duel.opponent_warriors : duel.creator_warriors;
    return (enemyIds ?? []).map((id) => allChars.find((c) => c.id === id)).filter(Boolean) as MarketCharacter[];
  }, [duel, address, allChars]);

  const submit = async () => {
    if (!duelId) return;
    try {
      await send("set_strategy", { strategy_id: strategy, duel_id: Number(duelId) },
        { pendingMsg: "Locking strategy…", successMsg: "Strategy locked", invalidate: ["duels", "pvp_leaderboard"] });
      // set_strategy only resolves the duel once BOTH players have chosen.
      // Go to the replay only if it actually resolved; otherwise wait.
      const report = await fetchDuelBattleReport(duelId);
      if (report) {
        navigate(`/replay?duel=${duelId}`);
      } else {
        toast.info("Strategy locked — waiting for your opponent to choose.");
        navigate("/duels");
      }
    } catch {
      /* toast shown */
    }
  };

  if (!duelId) {
    return (
      <GameLayout>
        <div className="max-w-2xl mx-auto px-6 py-28 text-center space-y-5">
          <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase">// BATTLE BRIEFING</div>
          <h1 className="font-display text-4xl italic uppercase">No duel selected</h1>
          <p className="text-sm text-muted-foreground">Pick a duel to set your strategy.</p>
          <Link to="/duels" className="inline-block px-6 py-3 bg-primary text-primary-foreground font-display uppercase tracking-widest clip-chrome-sm">Browse Duels</Link>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout>
      <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-10">
        <PageHeader eyebrow="// BATTLE BRIEFING" title="Choose Your" accent="Strategy" blurb="Review both squads and pick how your warriors should attack. Your choice decides the flow of battle." />

        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-4 items-center mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px flex-1 bg-primary/40" />
              <span className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase">Your Squad</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {((mySquad as MarketCharacter[]) ?? []).map((c, i) => (
                <div key={c.id ?? i} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}><FighterCard c={c} side="ally" /></div>
              ))}
            </div>
          </div>

          <div className="flex lg:flex-col items-center justify-center gap-4 py-6">
            <div className="font-display text-5xl md:text-6xl text-primary italic text-glow animate-pulse-glow">VS</div>
            <div className="text-center font-mono-display text-[10px] uppercase tracking-widest text-muted-foreground hidden lg:block">
              <div>Duel #{duelId}</div>
              {duel?.has_staked ? <div className="text-primary mt-1">{duel.stake_amount} CTSI</div> : null}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono-display text-[10px] tracking-[0.3em] text-destructive uppercase">Opponent</span>
              <span className="h-px flex-1 bg-destructive/40" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {enemySquad.length ? enemySquad.map((c, i) => (
                <div key={c.id} className="animate-fade-up" style={{ animationDelay: `${i * 80 + 200}ms` }}><FighterCard c={c} side="enemy" /></div>
              )) : [0, 1, 2].map((i) => <FighterCard key={i} c={{}} side="enemy" />)}
            </div>
          </div>
        </div>

        <div className="glass-panel clip-bevel p-6 md:p-8">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase mb-1">// TARGETING DOCTRINE</div>
              <h2 className="font-display text-3xl uppercase italic tracking-tight">Select Attack Strategy</h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {STRATS.map((s) => {
              const active = strategy === s.id;
              return (
                <button key={s.id} onClick={() => setStrategy(s.id)} className={`p-5 text-left transition-all clip-chrome-sm ${active ? "bg-primary/10 border-2 border-primary glow-cyan-sm" : "bg-panel-2/50 border border-foreground/10 hover:border-primary/40"}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`size-10 grid place-items-center font-display text-xl ${active ? "bg-primary text-primary-foreground" : "bg-foreground/10"}`}>{s.name[0]}</div>
                    <h3 className="font-display text-lg uppercase tracking-tight">{s.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-8 grid sm:grid-cols-[1fr_auto] gap-4 items-center">
            <div className="font-mono-display text-xs text-muted-foreground">
              <span className="text-primary">// READY</span> · duel #{duelId} · strategy {STRATS.find((s) => s.id === strategy)?.name.toLowerCase()}
            </div>
            <button onClick={submit} disabled={pending} className="px-10 py-4 bg-primary text-primary-foreground font-display text-xl uppercase tracking-widest italic clip-chrome-sm hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all glow-cyan-sm text-center disabled:opacity-50">
              {pending ? "Locking…" : "Engage →"}
            </button>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
