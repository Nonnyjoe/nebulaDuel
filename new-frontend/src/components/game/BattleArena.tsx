/**
 * BattleArena — renders a backend battle report (campaign `campaign_battle`
 * notice OR a duel's `battle_events`) in the 3D BattleStage, choosing an arena
 * from the unified pool. The 3D characters + their moves are unchanged; the new
 * super-power VFX/SFX are layered on inside BattleStage3D.
 */
import { useMemo } from "react";
import BattleStage3D, {
  type StageUnit,
  type StageEvent,
} from "./BattleStage3D";
import type { BattleReport } from "@/lib/cartesi/game-types";
import { characterByName, enemyVisual } from "@/lib/game/characters";
import { pickArena } from "@/lib/game/arenas";

export function BattleArena({
  report,
  mode = "campaign",
  onFinished,
}: {
  report: BattleReport;
  mode?: "campaign" | "duel";
  onFinished: () => void;
}) {
  // Campaign → the level's biome arena; duel/AI/ghost → a random arena.
  const arena = useMemo(
    () => (mode === "duel" ? pickArena() : pickArena({ biome: report.biome })),
    [mode, report.biome],
  );

  const playerUnits: StageUnit[] = useMemo(
    () =>
      report.player_squad.map((u) => ({
        id: u.id,
        side: "player",
        name: u.name,
        element: u.element,
        model: characterByName(u.name)?.model,
        maxHealth: u.max_health,
      })),
    [report],
  );

  const enemyUnits: StageUnit[] = useMemo(
    () =>
      report.enemy_squad.map((u) => {
        const isBossUnit = u.name === u.name.toUpperCase();
        return {
          id: u.id,
          side: "enemy",
          name: u.name,
          element: u.element,
          // Real opponents (PvP/AI) match the roster by name → their own model;
          // generated campaign enemies fall back to an element-based model.
          model: characterByName(u.name)?.model ?? enemyVisual(u.element, u.id).model,
          maxHealth: u.max_health,
          scale: isBossUnit ? 1.05 : 0.85,
        };
      }),
    [report],
  );

  const events: StageEvent[] = useMemo(
    () =>
      report.events.map((e) => ({
        round: e.round,
        actor_id: e.actor_id,
        target_id: e.target_id,
        action: e.action,
        power: e.power,
        element: e.element,
        damage: e.damage,
        heal: e.heal,
        crit: e.crit,
        effective: e.effective,
        effect: e.effect,
        actor_hp: e.actor_hp,
        target_hp: e.target_hp,
        target_ko: e.target_ko,
      })),
    [report],
  );

  return (
    <BattleStage3D
      theme={arena.theme}
      backdrop={arena.backdrop}
      playerUnits={playerUnits}
      enemyUnits={enemyUnits}
      events={events}
      totalRounds={report.rounds}
      victorySide={report.victory ? "player" : "enemy"}
      title={report.level_name}
      bossFight={report.is_boss}
      onFinished={onFinished}
    />
  );
}
