import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { GameLayout } from "@/components/game/GameLayout";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { playSfx, audio } from "@/lib/sound";
import { characterByName } from "@/lib/game/characters";
import {
  fetchDuelBattleReport,
  fetchLatestBattleReport,
  ELEMENT_META,
  type BattleReport,
} from "@/lib/cartesi/game-types";

interface ResultsState {
  report?: BattleReport;
  mode?: "campaign" | "duel";
  duelId?: string | null;
  levelId?: string | null;
  wallet?: string | null;
}

interface UnitStat {
  id: number;
  name: string;
  element: string;
  dealt: number;
  taken: number;
  kos: number;
  crits: number;
}

/** Per-player-unit contribution computed from the concluded battle's events. */
function computeStats(report: BattleReport): UnitStat[] {
  return report.player_squad.map((u) => {
    let dealt = 0, taken = 0, kos = 0, crits = 0;
    for (const e of report.events) {
      if (e.actor_side === "player" && e.actor_id === u.id) {
        dealt += e.damage || 0;
        if (e.crit) crits += 1;
        if (e.target_ko) kos += 1;
      }
      if (e.actor_side === "enemy" && e.target_id === u.id) {
        taken += e.damage || 0;
      }
    }
    return { id: u.id, name: u.name, element: u.element, dealt, taken, kos, crits };
  });
}

export default function Results() {
  useDocumentTitle("Battle Results — Nebula Duel");
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const passed = (location.state as ResultsState | null) ?? {};
  const duelId = passed.duelId ?? params.get("duel");
  const levelId = passed.levelId ?? params.get("level");
  const wallet = passed.wallet ?? params.get("wallet");
  const mode: "campaign" | "duel" = passed.mode ?? (duelId ? "duel" : "campaign");

  // If we weren't handed the report (e.g. opened directly), fetch it by id.
  const query = useQuery({
    queryKey: ["battle-report", { duelId, levelId, wallet }],
    enabled: !passed.report && (!!duelId || (!!levelId && !!wallet)),
    queryFn: async (): Promise<BattleReport | null> => {
      if (duelId) return fetchDuelBattleReport(duelId);
      if (levelId && wallet) return fetchLatestBattleReport(wallet, Number(levelId));
      return null;
    },
  });

  const report = passed.report ?? query.data ?? null;
  const won = report?.victory ?? params.get("w") === "ally";

  useEffect(() => {
    audio.unlock();
    playSfx(won ? "win" : "lose");
  }, [won]);

  const stats = useMemo(() => (report ? computeStats(report) : []), [report]);
  const mvp = useMemo(
    () =>
      stats.reduce<UnitStat | null>(
        (best, s) => (!best || s.dealt > best.dealt || (s.dealt === best.dealt && s.kos > best.kos) ? s : best),
        null,
      ),
    [stats],
  );
  const maxDealt = Math.max(1, ...stats.map((s) => s.dealt));
  const mvpImg = mvp ? characterByName(mvp.name)?.img : undefined;

  if (!report) {
    return (
      <GameLayout>
        <div className="max-w-2xl mx-auto px-6 py-28 text-center space-y-4">
          <div className="font-mono-display text-[10px] tracking-[0.3em] text-destructive uppercase">// NO RESULT DATA</div>
          <h1 className="font-display text-4xl italic uppercase">Nothing to settle</h1>
          <p className="text-sm text-muted-foreground">Resolve a campaign level or a duel to see its results.</p>
          <Link to="/duels" className="inline-block px-6 py-3 bg-primary text-primary-foreground font-display uppercase tracking-widest clip-chrome-sm">Browse Duels</Link>
        </div>
      </GameLayout>
    );
  }

  const winnerLine =
    mode === "campaign"
      ? won
        ? `Your squad cleared ${report.level_name}. Rewards settled on-chain.`
        : `Your squad fell at ${report.level_name}. Your insight grows.`
      : won
        ? "You won the duel — the match resolved in your favour."
        : "Your opponent prevailed this time.";

  // Rewards: campaign carries explicit rewards; duels report an outcome.
  const rewards =
    mode === "campaign"
      ? [
          { label: "Arena Points", value: `+${report.rewards?.points ?? 0}`, tone: won ? "primary" : "muted" },
          ...(report.rewards?.title ? [{ label: "Title Earned", value: report.rewards.title, tone: "legendary" }] : []),
          ...(report.rewards?.stat_boost ? [{ label: "First-Clear Bonus", value: "Squad stat boost", tone: "epic" }] : []),
          ...(report.charms_used?.length ? [{ label: "Charms Used", value: report.charms_used.join(", "), tone: "muted" }] : []),
        ]
      : [
          { label: "Outcome", value: won ? "Victory" : "Defeat", tone: won ? "primary" : "destructive" },
          { label: "Rounds", value: String(report.rounds), tone: "muted" },
          { label: "Standing", value: "Rating updated", tone: "primary" },
        ];

  return (
    <GameLayout>
      <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-10">
        {/* Banner */}
        <div className="relative overflow-hidden glass-panel clip-bevel p-8 md:p-14 mb-8 text-center">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div
            className="absolute inset-0"
            style={{
              background: won
                ? "radial-gradient(circle at center, oklch(0.86 0.18 200 / 0.25), transparent 60%)"
                : "radial-gradient(circle at center, oklch(0.65 0.24 22 / 0.25), transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase mb-3">
              // MATCH RESOLVED · {mode === "campaign" ? report.biome : "DUEL"}{report.is_boss ? " · BOSS" : ""}
            </div>
            <h1 className={`font-display text-7xl md:text-9xl uppercase italic tracking-tighter leading-none mb-2 text-glow ${won ? "text-primary" : "text-destructive"}`}>
              {won ? "VICTORY" : "DEFEAT"}
            </h1>
            <p className="text-muted-foreground max-w-prose mx-auto text-sm md:text-base">{winnerLine}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
          {/* Left: MVP + damage */}
          <div className="space-y-6">
            {mvp && (
              <div className="glass-panel clip-chrome p-5">
                <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase mb-3">// BEST CONTRIBUTOR</div>
                <div className="flex gap-4 items-center">
                  {mvpImg ? (
                    <img src={mvpImg} alt={mvp.name} className="w-24 h-32 object-cover clip-chrome ring-1 ring-primary/60" />
                  ) : (
                    <div className="w-24 h-32 grid place-items-center bg-panel-2 clip-chrome text-3xl">{ELEMENT_META[mvp.element as keyof typeof ELEMENT_META]?.emoji ?? "⚔️"}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-3xl uppercase italic tracking-tight truncate">{mvp.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono-display tracking-wider mb-3 uppercase">{mvp.element} · Squad MVP</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div><div className="font-display text-2xl text-primary">{mvp.kos}</div><div className="text-[9px] font-mono-display uppercase text-muted-foreground">Knockouts</div></div>
                      <div><div className="font-display text-2xl text-primary">{mvp.dealt}</div><div className="text-[9px] font-mono-display uppercase text-muted-foreground">Dmg Dealt</div></div>
                      <div><div className="font-display text-2xl text-primary">{mvp.crits}</div><div className="text-[9px] font-mono-display uppercase text-muted-foreground">Crits</div></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="glass-panel clip-chrome p-5">
              <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase mb-4">// SQUAD CONTRIBUTION</div>
              <div className="space-y-4">
                {stats.map((s) => (
                  <div key={s.id}>
                    <div className="flex justify-between font-mono-display text-[10px] uppercase tracking-wider mb-1">
                      <span>{s.name}</span>
                      <span className="text-primary">{s.dealt} dmg · {s.taken} taken{s.kos ? ` · ${s.kos} KO` : ""}</span>
                    </div>
                    <div className="relative h-2 bg-panel-2 clip-stat overflow-hidden">
                      <div className="h-full bg-primary glow-cyan-sm transition-all duration-1000" style={{ width: `${(s.dealt / maxDealt) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: rewards + actions */}
          <div className="space-y-6">
            <div className="glass-panel clip-chrome p-5">
              <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase mb-4">// SETTLEMENT</div>
              <ul className="divide-y divide-foreground/5">
                {rewards.map((r) => (
                  <li key={r.label} className="flex items-center justify-between py-3">
                    <span className="text-sm text-muted-foreground">{r.label}</span>
                    <span className="font-display text-xl tracking-tight" style={{ color: `var(--color-${r.tone})` }}>{r.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate("/replay", { state: { report, mode } })}
                className="block w-full text-center px-6 py-4 bg-primary text-primary-foreground font-display text-lg uppercase tracking-widest italic clip-chrome-sm hover:brightness-110 transition-all glow-cyan-sm"
              >
                Watch Replay
              </button>
              <Link
                to={mode === "campaign" && levelId ? `/create-duel?mode=campaign&level=${levelId}` : "/create-duel"}
                className="block text-center px-6 py-4 glass-hud font-display text-lg uppercase tracking-widest italic clip-chrome-sm border border-primary/40 hover:bg-primary/10 transition-all"
              >
                {mode === "campaign" ? "Replay Level" : "Rematch"}
              </Link>
              <Link
                to={mode === "campaign" ? "/campaign" : "/duels"}
                className="block text-center px-6 py-3 font-mono-display text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                {mode === "campaign" ? "Return to Campaign →" : "Return to Duels →"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
