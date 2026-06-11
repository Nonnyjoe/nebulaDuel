/**
 * Campaign battle replay — thin adapter around the shared BattleStage engine
 * (single 3D scene, real movement, restart-proof animations).
 */
import React, { useMemo } from "react";
import charactersdata from "../../utils/Charactersdata";
import {
  BattleReport,
  BIOME_THEMES,
  enemyVisual,
} from "../../utils/campaign";
import BattleStage, { StageUnit, StageEvent } from "../battle/BattleStage";

interface Props {
  report: BattleReport;
  onFinished: () => void;
}

const CampaignBattle: React.FC<Props> = ({ report, onFinished }) => {
  const theme = BIOME_THEMES[report.biome] ?? BIOME_THEMES.VoidNexus;

  const playerUnits: StageUnit[] = useMemo(
    () =>
      report.player_squad.map((u) => ({
        id: u.id,
        side: "player" as const,
        name: u.name,
        element: u.element,
        model: charactersdata.find((c) => c.name === u.name)?.model,
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
          side: "enemy" as const,
          name: u.name,
          element: u.element,
          model: enemyVisual(u.element, u.id).model,
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
    <BattleStage
      theme={theme}
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
};

export default CampaignBattle;
