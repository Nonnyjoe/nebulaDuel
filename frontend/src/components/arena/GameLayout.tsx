/**
 * Duel arena (P2P + AI duels) — replays the on-chain battle log inside the
 * shared BattleStage engine: one 3D scene, fighters physically run to their
 * target to strike, restart-proof animations, sound and music.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import charactersdata from "../../utils/Charactersdata";
import { ImageWrap } from "../atom/ImageWrap";
import Popup from "./Popup";
import signMessages from "../../utils/relayTransaction";
import fetchNotices from "../../utils/readSubgraph";
import readGameState from "../../utils/readState";
import audio from "../../utils/audio";
import {
  BIOME_THEMES,
  ELEMENT_META,
  powerToElement,
} from "../../utils/campaign";
import StatBars from "../shared/StatBars";
import BattleStage, { StageUnit, StageEvent } from "../battle/BattleStage";

// ---------------------------------------------------------------------------

interface WarriorInfo {
  id: number;
  name: string;
  health: number;
  strength: number;
  attack: number;
  speed: number;
  super_power: string;
  owner: string;
  img?: string;
  model?: string;
}

const shortAddress = (addr?: string) => {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
};

const GameLayout = () => {
  const { duelId } = useParams();
  const navigate = useNavigate();

  const [duelData, setDuelData] = useState<any>();
  const [creatorWarriors, setCreatorWarriors] = useState<WarriorInfo[]>([]);
  const [opponentWarriors, setOpponentWarriors] = useState<WarriorInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [creatorName, setCreatorName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [, setSoundTick] = useState(0);

  const cancelled = useRef(false);
  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
      audio.stopMusic();
    };
  }, []);

  // ----- data loading ------------------------------------------------------

  const parseWarriorIds = (raw: any): number[] => {
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!Array.isArray(parsed)) return [];
      return parsed.map((w: any) => Number(w.char_id ?? w));
    } catch {
      return [];
    }
  };

  const buildWarriors = (
    allCharacters: any[],
    ids: number[],
    owner: string,
  ): WarriorInfo[] => {
    const out: WarriorInfo[] = [];
    for (const id of ids) {
      const c = allCharacters.find((x: any) => Number(x.id) === id);
      if (!c) continue;
      const meta = charactersdata.find((d) => d.name === c.name);
      out.push({
        id: Number(c.id),
        name: c.name,
        health: Number(c.health),
        strength: Number(c.strength),
        attack: Number(c.attack),
        speed: Number(c.speed),
        super_power: c.super_power,
        owner,
        img: meta?.img,
        model: meta?.model,
      });
    }
    return out;
  };

  const loadDuel = useCallback(async () => {
    const allDuels = await fetchNotices("all_duels");
    const aiDuels = await fetchNotices("ai_duels");
    const pool = [...(allDuels ?? []), ...(aiDuels ?? [])];
    const duel = pool.find((d: any) => Number(d.duel_id) === Number(duelId));
    if (!duel) return null;

    if (duel.duel_opponent === "" || duel.duel_opponent == null) {
      navigate(`/strategy/${duelId}`);
      return null;
    }

    const allCharacters = await fetchNotices("all_characters");
    const creators = buildWarriors(
      allCharacters,
      parseWarriorIds(duel.creator_warriors),
      duel.duel_creator,
    );
    const opponents = buildWarriors(
      allCharacters,
      parseWarriorIds(duel.opponent_warriors),
      duel.duel_opponent,
    );

    if (!cancelled.current) {
      setDuelData(duel);
      setCreatorWarriors(creators);
      setOpponentWarriors(opponents);
    }
    return { duel, creators, opponents };
  }, [duelId, navigate]);

  useEffect(() => {
    setIsLoading(true);
    loadDuel().finally(() => {
      if (!cancelled.current) setIsLoading(false);
    });
  }, [loadDuel]);

  // Participant display names
  useEffect(() => {
    const loadNames = async () => {
      if (!duelData) return;
      const resolve = async (addr: string | undefined, isAi: boolean) => {
        if (!addr) return "";
        if (isAi) return "Nebula AI";
        try {
          const { Status, request_payload } = await readGameState(
            `profile/${addr.toLowerCase()}`,
          );
          if (Status && request_payload?.monika) return request_payload.monika;
        } catch {
          /* ignore */
        }
        return shortAddress(addr);
      };
      const cName = await resolve(duelData.duel_creator, false);
      const oName = await resolve(
        duelData.duel_opponent,
        duelData.duel_opponent?.toLowerCase() === "0xnebula",
      );
      if (!cancelled.current) {
        setCreatorName(cName);
        setOpponentName(oName);
      }
    };
    loadNames();
  }, [duelData]);

  // ----- rich battle report -> stage events -------------------------------

  /** The backend now resolves duels on the SAME engine as the campaign and
   * emits a rich `battle_events` report (elements, powers, crits, energy).
   * We map it straight onto BattleStage, exactly like CampaignBattle does, so
   * a warrior looks and fights identically everywhere. */
  const parseReport = (duel: any): any | null => {
    const raw = duel?.battle_events;
    if (!raw) return null;
    try {
      const report = typeof raw === "string" ? JSON.parse(raw) : raw;
      return report && Array.isArray(report.events) ? report : null;
    } catch {
      return null;
    }
  };

  const buildStageData = (
    duel: any,
  ): {
    events: StageEvent[];
    units: StageUnit[];
    rounds: number;
    victorySide: "player" | "enemy";
  } | null => {
    const report = parseReport(duel);
    if (!report) return null;

    const toUnit = (u: any, side: "player" | "enemy"): StageUnit => ({
      id: Number(u.id),
      side,
      name: u.name,
      element: u.element ?? powerToElement(u.power ?? ""),
      model: charactersdata.find((c) => c.name === u.name)?.model,
      maxHealth: Number(u.max_health ?? u.health),
    });

    const units: StageUnit[] = [
      ...(report.player_squad ?? []).map((u: any) => toUnit(u, "player")),
      ...(report.enemy_squad ?? []).map((u: any) => toUnit(u, "enemy")),
    ];

    const events: StageEvent[] = (report.events ?? []).map((e: any) => ({
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
    }));

    const victorySide: "player" | "enemy" = report.victory ? "player" : "enemy";
    return { events, units, rounds: Number(report.rounds) || events.length, victorySide };
  };

  const [stage, setStage] = useState<ReturnType<typeof buildStageData>>(null);

  const startBattle = async () => {
    if (!duelData) return;
    if (
      duelData.creators_strategy === "Yet_to_select" ||
      duelData.opponents_strategy === "Yet_to_select"
    ) {
      toast.error("Waiting for both players to select a strategy.", {
        position: "top-right",
      });
      return;
    }
    audio.play("click");
    setIsBusy(true);
    try {
      let duel = duelData;

      if (!parseReport(duel)) {
        toast.info("Submitting fight to the Cartesi machine…", {
          position: "top-right",
        });
        await signMessages({ func: "fight", duel_id: Number(duelId) });
        const reloaded = await loadDuel();
        if (!reloaded || !parseReport(reloaded.duel)) {
          toast.error("Battle submitted but no result yet — try again shortly.", {
            position: "top-right",
          });
          setIsBusy(false);
          return;
        }
        duel = reloaded.duel;
      }

      const data = buildStageData(duel);
      if (!data) {
        toast.error("Could not read the battle result — try again shortly.", {
          position: "top-right",
        });
        setIsBusy(false);
        return;
      }
      setStage(data);
      setReplaying(true);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to start battle", {
        position: "top-right",
      });
    } finally {
      setIsBusy(false);
    }
  };

  const onReplayFinished = () => {
    setShowPopup(true);
  };

  const hasLog = useMemo(
    () => (duelData ? parseReport(duelData) != null : false),
    [duelData],
  );

  // Duel arenas use a fixed cosmic theme (campaign biomes stay campaign-only).
  const theme = BIOME_THEMES.StormSpire;

  // ----- presentational ----------------------------------------------------

  const WarriorCard = ({ w }: { w: WarriorInfo }) => {
    const element = powerToElement(w.super_power);
    const meta = ELEMENT_META[element];
    return (
      <div className="w-full grid grid-cols-2 gap-3 rounded-xl border-2 border-myGreen/40 bg-myBlack/90 p-3 hover:border-myGreen transition-colors">
        <ImageWrap
          image={w.img as string}
          alt={w.name}
          className="w-20 h-20 md:w-24 md:h-24"
          objectStatus="object-cover"
        />
        <div className="flex flex-col justify-center gap-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="text-myGreen font-belanosima text-sm truncate">
              {w.name}
            </p>
            <span className={`shrink-0 text-[9px] rounded-full px-1.5 py-0.5 ${meta.bg} ${meta.color}`}>
              {meta.emoji} {element}
            </span>
          </div>
          <StatBars
            stats={{
              health: w.health,
              strength: w.strength,
              attack: w.attack,
              speed: w.speed,
            }}
          />
        </div>
      </div>
    );
  };

  const participantPanel = (
    title: string,
    name: string,
    address: string | undefined,
    strategy: string | undefined,
    alignRight: boolean,
  ) => (
    <>
      <div
        className={`flex items-center gap-2 mb-3 ${alignRight ? "justify-start lg:justify-end" : ""}`}
      >
        {!alignRight && <span className="h-0.5 w-8 bg-myGreen rounded" />}
        <div className="text-myGreen font-belanosima text-lg sm:text-xl font-medium">
          {title}
        </div>
        {alignRight && <span className="h-0.5 w-8 bg-myGreen rounded" />}
      </div>
      <div className="mb-6 rounded-xl border border-gray-700 bg-myBlack/80 px-4 py-3 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <p className="font-belanosima text-[11px] uppercase tracking-wide text-gray-400">
            Name
          </p>
          <p className="font-belanosima text-sm sm:text-base text-white text-right truncate max-w-[60%]">
            {name || shortAddress(address)}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="font-belanosima text-[11px] uppercase tracking-wide text-gray-400">
            Address
          </p>
          <p className="font-poppins text-[11px] text-gray-400 text-right truncate max-w-[60%]">
            {shortAddress(address)}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="font-belanosima text-[11px] uppercase tracking-wide text-gray-400">
            Strategy
          </p>
          <p className="font-poppins text-[11px] text-myGreen text-right truncate max-w-[60%]">
            {strategy && strategy !== "Yet_to_select" ? strategy : "Not selected"}
          </p>
        </div>
      </div>
    </>
  );

  if (isLoading) {
    return (
      <section className="w-full min-h-screen flex items-center justify-center">
        <p className="font-belanosima text-myGreen animate-pulse text-lg">
          Loading duel #{duelId}…
        </p>
      </section>
    );
  }

  if (!duelData) {
    return (
      <section className="w-full min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-belanosima text-white text-lg">
          Duel #{duelId} was not found.
        </p>
        <button
          className="rounded-xl bg-myGreen text-navBg font-belanosima uppercase px-8 py-3"
          onClick={() => navigate("/duels")}
        >
          Back to duels
        </button>
      </section>
    );
  }

  return (
    <section className="w-full min-h-screen">
      <main className="w-full flex flex-col lg:flex-row gap-6 lg:gap-10 px-4 md:px-6 lg:px-10 py-8 md:py-10 lg:py-12 max-w-[1500px] mx-auto">
        {/* Creator column */}
        <div className="w-full lg:w-3/12 mt-4 lg:mt-12 lg:ml-2 xl:ml-6">
          {participantPanel(
            "Creator warriors",
            creatorName,
            duelData?.duel_creator,
            duelData?.creators_strategy,
            false,
          )}
          <div className="grid md:gap-4 gap-3">
            {creatorWarriors.map((w) => (
              <WarriorCard key={w.id} w={w} />
            ))}
          </div>
        </div>

        {/* Arena */}
        <div className="w-full lg:w-6/12 mt-8 lg:mt-10 mb-10 lg:mb-20">
          {replaying && stage ? (
            <BattleStage
              theme={theme}
              playerUnits={stage.units.filter((u) => u.side === "player")}
              enemyUnits={stage.units.filter((u) => u.side === "enemy")}
              events={stage.events}
              totalRounds={stage.rounds}
              victorySide={stage.victorySide}
              title={`Duel #${duelId}`}
              onFinished={onReplayFinished}
            />
          ) : (
            <div className="relative w-full min-h-[380px] md:min-h-[480px] rounded-2xl overflow-hidden border-4 border-green-800 bg-[url('/nebulaDuelArena9.webp')] bg-cover bg-center flex items-center justify-center">
              <div className="absolute inset-0 bg-black/55" />
              <div className="relative z-10 text-center px-6">
                <p className="font-belanosima text-white text-2xl md:text-4xl uppercase tracking-widest mb-3">
                  {hasLog ? "Battle concluded" : "The arena awaits"}
                </p>
                <p className="font-poppins text-gray-300 text-sm max-w-md mx-auto">
                  {hasLog
                    ? "Replay the on-chain battle to watch every strike again."
                    : "Both strategies are locked in — begin the fight to let the Cartesi machine decide your fate."}
                </p>
              </div>
            </div>
          )}

          <div className="w-full flex items-center justify-center gap-3 mt-6 md:mt-8">
            <button
              className="inline-flex items-center justify-center rounded-xl btn-glow font-belanosima uppercase tracking-wide px-10 py-3.5 md:px-14 md:py-4 text-sm md:text-base shadow-[0_0_20px_rgba(69,248,130,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => {
                setReplaying(false);
                setShowPopup(false);
                setStage(null);
                // small delay so BattleStage fully unmounts before remount
                setTimeout(() => startBattle(), 50);
              }}
              disabled={isBusy}
            >
              <span>
                {isBusy ? "Summoning…" : hasLog ? "Replay battle" : "Start battle"}
              </span>
            </button>
            <button
              className="inline-flex items-center justify-center rounded-xl border border-gray-700 text-gray-300 font-belanosima uppercase tracking-wide px-4 py-3.5 text-sm hover:border-myGreen hover:text-myGreen"
              onClick={() => {
                audio.toggleMuted();
                setSoundTick((t) => t + 1);
              }}
              title={audio.muted ? "Unmute" : "Mute"}
            >
              {audio.muted ? "🔇" : "🔊"}
            </button>
          </div>
        </div>

        {/* Opponent column */}
        <div className="w-full lg:w-3/12 mt-8 lg:mt-12 lg:mr-2">
          {participantPanel(
            "Opponent warriors",
            opponentName,
            duelData?.duel_opponent,
            duelData?.opponents_strategy,
            true,
          )}
          <div className="grid md:gap-4 gap-3">
            {opponentWarriors.map((w) => (
              <WarriorCard key={w.id} w={w} />
            ))}
          </div>
        </div>

        {showPopup && (
          <Popup
            winnerAddress={duelData?.duel_winner ?? ""}
            onClose={() => setShowPopup(false)}
          />
        )}
      </main>
    </section>
  );
};

export default GameLayout;
