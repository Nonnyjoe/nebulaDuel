import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GameLayout } from "@/components/game/GameLayout";
import { BattleArena } from "@/components/game/BattleArena";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  fetchDuelBattleReport,
  fetchLatestBattleReport,
  type BattleReport,
} from "@/lib/cartesi/game-types";

interface ReplayState {
  report?: BattleReport;
  mode?: "campaign" | "duel";
}

export default function Replay() {
  useDocumentTitle("Live Replay — Nebula Duel");
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  // 1) Report handed over directly by the action that resolved the battle.
  const passed = (location.state as ReplayState | null) ?? {};
  const duelId = params.get("duel");
  const levelId = params.get("level");
  const wallet = params.get("wallet");
  const mode: "campaign" | "duel" =
    passed.mode ?? (duelId ? "duel" : "campaign");

  // 2) Otherwise fetch it by id from the node.
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

  const finish = () => {
    if (!report) return;
    navigate(`/results?w=${report.victory ? "ally" : "enemy"}`, {
      state: { report, mode, duelId, levelId, wallet },
    });
  };

  return (
    <GameLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase">
              // LIVE REPLAY{report?.level_name ? ` · ${report.level_name}` : ""}
            </div>
            <h1 className="font-display text-3xl md:text-5xl uppercase italic tracking-tight">Arena Cast</h1>
          </div>
          <div className="font-mono-display text-[10px] text-muted-foreground uppercase tracking-widest">
            {mode === "duel" ? "P2P / AI DUEL" : "CAMPAIGN"}
          </div>
        </div>

        {report ? (
          <BattleArena report={report} mode={mode} onFinished={finish} />
        ) : query.isFetching ? (
          <div className="glass-panel clip-bevel aspect-video grid place-items-center">
            <div className="flex flex-col items-center gap-3">
              <span className="size-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <span className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Loading battle report…
              </span>
            </div>
          </div>
        ) : (
          <div className="glass-panel clip-bevel aspect-video grid place-items-center text-center px-6">
            <div className="space-y-3">
              <div className="font-mono-display text-[10px] tracking-[0.3em] text-destructive uppercase">// NO REPLAY DATA</div>
              <p className="text-sm text-muted-foreground max-w-prose">
                No battle report was found for this match. Resolve a campaign level or a duel to generate one.
              </p>
              <button
                onClick={() => navigate("/duels")}
                className="px-6 py-3 bg-primary text-primary-foreground font-display uppercase tracking-widest clip-chrome-sm hover:brightness-110 glow-cyan-sm"
              >
                Browse Duels
              </button>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
