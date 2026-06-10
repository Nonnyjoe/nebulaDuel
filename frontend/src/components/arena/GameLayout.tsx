import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import * as THREE from "three";
import { useNavigate, useParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { useAnimations, useGLTF, Html, useProgress } from "@react-three/drei";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { toast } from "sonner";

import charactersdata from "../../utils/Charactersdata";
import { ImageWrap } from "../atom/ImageWrap";
import Popup from "./Popup";
import signMessages from "../../utils/relayTransaction";
import fetchNotices from "../../utils/readSubgraph";
import readGameState from "../../utils/readState";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CharacterAction = "idle" | "attack" | "hit" | "death" | "victory";

interface WarriorState {
  id: number;
  name: string;
  health: number;
  maxHealth: number;
  strength: number;
  attack: number;
  speed: number;
  owner: string;
  img?: string;
  model?: string;
  action: CharacterAction;
  alive: boolean;
}

interface BattleLogEntry {
  attacker: {
    character_id: number;
    name: string;
    health: number;
    strength: number;
    attack: number;
    owner: string;
  };
  victim: {
    character_id: number;
    name: string;
    health: number;
    strength: number;
    attack: number;
    owner: string;
  };
}

// Pacing of one battle round, in ms.
const STRIKE_MS = 900; // attack + hit animations play
const SETTLE_MS = 700; // stats update, hit highlight fades

// ---------------------------------------------------------------------------
// 3D character with named-animation control
// ---------------------------------------------------------------------------

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center className="text-sm font-poppins">
      {Math.floor(progress)}%
    </Html>
  );
}

/** Resolve a logical action to an animation clip name present in the model.
 * Models name clips like "attack1", "attack2_Armature", "fightIdle ",
 * "death", "defeat", "hit_Armature", "victory"... so match by pattern. */
function resolveClipName(
  names: string[],
  action: CharacterAction,
  variant: number,
): string | undefined {
  const lower = names.map((n) => n.toLowerCase());
  const findAll = (re: RegExp) =>
    names.filter((_, i) => re.test(lower[i]));

  let candidates: string[] = [];
  switch (action) {
    case "attack": {
      candidates = findAll(/attack|kick/);
      break;
    }
    case "hit":
      candidates = findAll(/^hit|_hit|hit_/);
      if (!candidates.length) candidates = findAll(/hit/);
      break;
    case "death":
      candidates = findAll(/death|defeat|die/);
      break;
    case "victory":
      candidates = findAll(/victory|win|flex|cocky|taunt/);
      break;
    case "idle":
    default:
      candidates = findAll(/idle/);
      break;
  }
  if (!candidates.length) {
    // Fall back to idle, then to the first clip.
    const idle = names.find((n) => /idle/i.test(n));
    return idle ?? names[0];
  }
  return candidates[variant % candidates.length];
}

interface CharacterModelProps {
  modelPath: string;
  facingRight: boolean;
  action: CharacterAction;
  /** rotates between attack variations so repeated attacks look alive */
  variant: number;
}

const CharacterModel: React.FC<CharacterModelProps> = ({
  modelPath,
  facingRight,
  action,
  variant,
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const model = useGLTF(modelPath);
  const clone = useMemo(() => SkeletonUtils.clone(model.scene), [model.scene]);
  const { actions, names } = useAnimations(model.animations, groupRef);
  const currentClip = useRef<string | null>(null);

  useEffect(() => {
    if (!names.length) return; // some models (e.g. luna) ship no animations

    const clipName = resolveClipName(names, action, variant);
    if (!clipName) return;

    const next = actions[clipName];
    if (!next) return;

    // Fade out whatever is playing.
    if (currentClip.current && currentClip.current !== clipName) {
      actions[currentClip.current]?.fadeOut(0.25);
    }

    next.reset();
    if (action === "death") {
      next.setLoop(THREE.LoopOnce, 1);
      next.clampWhenFinished = true; // stay down
    } else if (action === "attack" || action === "hit") {
      next.setLoop(THREE.LoopOnce, 1);
      next.clampWhenFinished = true;
    } else {
      next.setLoop(THREE.LoopRepeat, Infinity);
    }
    next.fadeIn(0.2).play();
    currentClip.current = clipName;
  }, [action, variant, names, actions]);

  return (
    <primitive
      ref={groupRef}
      object={clone}
      scale={0.8}
      position={[0, -1, 0]}
      rotation-y={facingRight ? 1.1 : -1.1}
    />
  );
};

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

const HealthBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const color =
    pct > 50 ? "bg-myGreen" : pct > 20 ? "bg-myYellow" : "bg-red-600";
  return (
    <div className="w-full h-1.5 rounded bg-gray-800 overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

const WarriorCard: React.FC<{ warrior: WarriorState; highlight: boolean }> = ({
  warrior,
  highlight,
}) => (
  <div
    className={`w-full md:w-[90%] grid grid-cols-2 gap-3 rounded-xl border-2 bg-myBlack/90 p-3 md:p-4 transition-all duration-300 ${
      !warrior.alive
        ? "border-red-700 opacity-60 grayscale"
        : highlight
          ? "border-myYellow animate-pulse scale-[1.02] shadow-lg shadow-myYellow/20"
          : "border-myGreen/60 hover:border-myGreen"
    }`}
  >
    <ImageWrap
      image={warrior.img as string}
      alt={warrior.name}
      className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32"
      objectStatus="object-cover"
    />
    <div className="flex flex-col items-center justify-center gap-1">
      <p
        className={`${
          !warrior.alive ? "text-red-700" : "text-myGreen"
        } font-belanosima text-sm font-medium text-center`}
      >
        {warrior.name}
      </p>
      <HealthBar value={warrior.health} max={warrior.maxHealth} />
      <p className="text-xs text-gray-400">
        HLT {warrior.health} · STR {warrior.strength}
      </p>
      <p className="text-xs text-gray-400">
        ATK {warrior.attack} · SPD {warrior.speed}
      </p>
      {!warrior.alive && (
        <p className="text-[10px] uppercase tracking-widest text-red-500 font-belanosima">
          Fallen
        </p>
      )}
    </div>
  </div>
);

const shortAddress = (addr?: string) => {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
};

// ---------------------------------------------------------------------------
// Battle page
// ---------------------------------------------------------------------------

const GameLayout = () => {
  const { duelId } = useParams();
  const navigate = useNavigate();

  const [duelData, setDuelData] = useState<any>();
  const [creatorWarriors, setCreatorWarriors] = useState<WarriorState[]>([]);
  const [opponentWarriors, setOpponentWarriors] = useState<WarriorState[]>([]);
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRound, setCurrentRound] = useState(0);
  const [lastHitId, setLastHitId] = useState<number | null>(null);
  const [attackVariant, setAttackVariant] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [creatorName, setCreatorName] = useState("");
  const [opponentName, setOpponentName] = useState("");

  const cancelled = useRef(false);
  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
    };
  }, []);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // ----- data loading ------------------------------------------------------

  const buildWarriors = useCallback(
    (
      allCharacters: any[],
      warriorIds: number[],
      owner: string,
    ): WarriorState[] => {
      const out: WarriorState[] = [];
      for (const id of warriorIds) {
        const char = allCharacters.find((c: any) => Number(c.id) === id);
        if (!char) continue;
        const meta = charactersdata.find((c) => c.name === char.name);
        out.push({
          id: Number(char.id),
          name: char.name,
          health: Number(char.health),
          maxHealth: Number(char.health),
          strength: Number(char.strength),
          attack: Number(char.attack),
          speed: Number(char.speed),
          owner,
          img: meta?.img,
          model: meta?.model,
          action: "idle",
          alive: Number(char.health) > 0,
        });
      }
      return out;
    },
    [],
  );

  const parseWarriorIds = (raw: any): number[] => {
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!Array.isArray(parsed)) return [];
      return parsed.map((w: any) => Number(w.char_id ?? w));
    } catch {
      return [];
    }
  };

  const parseBattleLog = (raw: any): BattleLogEntry[] => {
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((round: any) => Array.isArray(round) && round.length >= 2)
        .map((round: any) => ({ attacker: round[0], victim: round[1] }));
    } catch {
      return [];
    }
  };

  const loadDuel = useCallback(async () => {
    const allDuels = await fetchNotices("all_duels");
    const aiDuels = await fetchNotices("ai_duels");
    const pool = [...(allDuels ?? []), ...(aiDuels ?? [])];
    const duel = pool.find((d: any) => Number(d.duel_id) === Number(duelId));

    if (!duel) {
      return null;
    }
    if (duel.duel_opponent === "" || duel.duel_opponent == null) {
      // No opponent yet -> strategy/wait page
      navigate(`/strategy/${duelId}`);
      return null;
    }

    const allCharacters = await fetchNotices("all_characters");
    const creatorIds = parseWarriorIds(duel.creator_warriors);
    const opponentIds = parseWarriorIds(duel.opponent_warriors);

    const creators = buildWarriors(allCharacters, creatorIds, duel.duel_creator);
    const opponents = buildWarriors(
      allCharacters,
      opponentIds,
      duel.duel_opponent,
    );
    const log = parseBattleLog(duel.battle_log);

    if (!cancelled.current) {
      setDuelData(duel);
      setCreatorWarriors(creators);
      setOpponentWarriors(opponents);
      setBattleLog(log);
    }
    return { duel, creators, opponents, log };
  }, [duelId, navigate, buildWarriors]);

  useEffect(() => {
    setIsLoading(true);
    loadDuel().finally(() => {
      if (!cancelled.current) setIsLoading(false);
    });
  }, [loadDuel]);

  // Participant display names (inspect: profile/<addr>)
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
          /* fall through */
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

  // ----- battle playback ---------------------------------------------------

  const setWarriorState = (
    id: number,
    patch: Partial<WarriorState> | ((w: WarriorState) => Partial<WarriorState>),
  ) => {
    const apply = (list: WarriorState[]) =>
      list.map((w) =>
        w.id === id
          ? { ...w, ...(typeof patch === "function" ? patch(w) : patch) }
          : w,
      );
    setCreatorWarriors(apply);
    setOpponentWarriors(apply);
  };

  const resetForPlayback = (creators: WarriorState[], opponents: WarriorState[]) => {
    const fresh = (list: WarriorState[]) =>
      list.map((w) => ({
        ...w,
        health: w.maxHealth,
        action: "idle" as CharacterAction,
        alive: true,
      }));
    setCreatorWarriors(fresh(creators));
    setOpponentWarriors(fresh(opponents));
  };

  const playBattle = async (
    log: BattleLogEntry[],
    duel: any,
    creators: WarriorState[],
    opponents: WarriorState[],
  ) => {
    if (!log.length) return;
    setIsAnimating(true);
    resetForPlayback(creators, opponents);
    setCurrentRound(0);
    await sleep(400);

    for (let step = 0; step < log.length; step++) {
      if (cancelled.current) return;
      const { attacker, victim } = log[step];
      setCurrentRound(step + 1);
      setAttackVariant(step);

      const victimDies = Number(victim.health) <= 0;

      // 1) Strike: attacker plays attack, victim plays hit or death.
      setWarriorState(Number(attacker.character_id), { action: "attack" });
      setWarriorState(Number(victim.character_id), {
        action: victimDies ? "death" : "hit",
      });
      setLastHitId(Number(victim.character_id));

      await sleep(STRIKE_MS);
      if (cancelled.current) return;

      // 2) Settle: apply on-chain post-round stats from the battle log.
      setWarriorState(Number(attacker.character_id), {
        health: Number(attacker.health),
        strength: Number(attacker.strength),
        attack: Number(attacker.attack),
        action: "idle",
      });
      setWarriorState(Number(victim.character_id), {
        health: Number(victim.health),
        strength: Number(victim.strength),
        attack: Number(victim.attack),
        alive: !victimDies,
        // dead warriors stay in their death pose
        action: victimDies ? "death" : "idle",
      });
      setLastHitId(null);

      await sleep(SETTLE_MS);
    }

    // 3) Finale: winner's surviving warriors celebrate.
    const winner = (duel?.duel_winner ?? "").toLowerCase();
    const celebrate = (prev: WarriorState[]) =>
      prev.map((w) =>
        w.alive && w.owner?.toLowerCase() === winner
          ? { ...w, action: "victory" as CharacterAction }
          : w,
      );
    setCreatorWarriors(celebrate);
    setOpponentWarriors(celebrate);

    await sleep(1200);
    if (!cancelled.current) {
      setIsAnimating(false);
      setShowPopup(true);
    }
  };

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

    try {
      setIsAnimating(true);
      let log = battleLog;
      let duel = duelData;
      let creators = creatorWarriors;
      let opponents = opponentWarriors;

      if (!log.length) {
        // The fight hasn't been simulated on-chain yet: send the input.
        // signMessages waits until the node has processed it, so the reload
        // below is guaranteed to see the battle log.
        toast.info("Submitting fight to the Cartesi machine…", {
          position: "top-right",
        });
        await signMessages({ func: "fight", duel_id: Number(duelId) });
        const reloaded = await loadDuel();
        if (!reloaded || !reloaded.log.length) {
          toast.error(
            "Battle was submitted but no battle log is available yet. Try refreshing.",
            { position: "top-right" },
          );
          setIsAnimating(false);
          return;
        }
        log = reloaded.log;
        duel = reloaded.duel;
        creators = reloaded.creators;
        opponents = reloaded.opponents;
      }

      await playBattle(log, duel, creators, opponents);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to start battle", {
        position: "top-right",
      });
      setIsAnimating(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  // ----- render ------------------------------------------------------------

  const renderArenaSide = (warriors: WarriorState[], facingRight: boolean) => (
    <div className="flex flex-row sm:flex-col h-fit overflow-visible gap-2 sm:gap-4">
      {warriors.map((warrior) => (
        <div
          key={warrior.id}
          id={warrior.id.toString()}
          className={`w-28 h-28 md:w-40 md:h-40 lg:w-52 lg:h-52 flex text-2xl text-white overflow-visible -mt-6 sm:mt-[-40px] transition-transform duration-300 ${
            warrior.action === "attack"
              ? facingRight
                ? "translate-x-3 sm:translate-x-5"
                : "-translate-x-3 sm:-translate-x-5"
              : ""
          }`}
        >
          {warrior.model ? (
            <Canvas linear flat shadows camera={{ position: [0, 2, 3], fov: 30 }}>
              <fog attach="fog" args={["#171720", 10, 30]} />
              <ambientLight intensity={2} />
              <directionalLight position={[3.3, 1.0, 4.4]} intensity={5} />
              <directionalLight
                intensity={16}
                position={[1, 1, 1]}
                castShadow
                shadow-mapSize={2048}
                shadow-bias={-0.0001}
              />
              <Suspense fallback={<Loader />}>
                <CharacterModel
                  modelPath={warrior.model}
                  facingRight={facingRight}
                  action={warrior.action}
                  variant={attackVariant}
                />
              </Suspense>
            </Canvas>
          ) : (
            <div className="m-auto">
              <ImageWrap
                image={warrior.img as string}
                alt={warrior.name}
                className="w-20 h-20"
                objectStatus="object-cover"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );

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
      <section className="w-full min-h-screen bg-bodyBg flex items-center justify-center">
        <p className="font-belanosima text-myGreen animate-pulse text-lg">
          Loading duel #{duelId}…
        </p>
      </section>
    );
  }

  if (!duelData) {
    return (
      <section className="w-full min-h-screen bg-bodyBg flex flex-col items-center justify-center gap-4">
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
    <section className="w-full min-h-screen bg-bodyBg">
      <main className="w-full flex flex-col lg:flex-row gap-6 lg:gap-10 px-4 md:px-6 lg:px-10 py-8 md:py-10 lg:py-12 max-w-[1368px] mx-auto">
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
              <WarriorCard key={w.id} warrior={w} highlight={w.id === lastHitId} />
            ))}
          </div>
        </div>

        {/* Arena */}
        <div className="w-full lg:w-6/12 mt-8 lg:mt-10 lg:mr-4 xl:mr-8 mb-10 lg:mb-20">
          <div className="w-full max-w-[960px] mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="font-belanosima text-myGreen text-sm uppercase tracking-widest">
                {isAnimating
                  ? `Round ${currentRound} / ${battleLog.length || "?"}`
                  : duelData?.is_completed
                    ? "Battle complete — replay available"
                    : "Ready to battle"}
              </span>
            </div>
            <div className="relative flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 p-4 md:p-6 lg:p-8 border-4 md:border-8 border-green-800 w-full bg-[url('/nebulaDuelArena9.webp')] bg-cover bg-center py-8 md:py-12 lg:py-20 min-h-[320px] sm:min-h-[420px] md:min-h-[480px] rounded-xl overflow-hidden">
              {renderArenaSide(creatorWarriors, true)}
              <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 font-belanosima text-3xl md:text-5xl text-white/20 select-none">
                VS
              </div>
              {renderArenaSide(opponentWarriors, false)}
            </div>
          </div>
          <div className="w-full flex mt-6 md:mt-8 lg:mt-10">
            <button
              className="mx-auto inline-flex items-center justify-center rounded-xl bg-myGreen hover:bg-myYellow text-navBg font-belanosima uppercase tracking-wide px-10 py-3.5 md:px-14 md:py-4 text-sm md:text-base shadow-[0_0_20px_rgba(69,248,130,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={startBattle}
              disabled={isAnimating}
            >
              <span>
                {isAnimating
                  ? "Battling…"
                  : battleLog.length
                    ? "Replay battle"
                    : "Start battle"}
              </span>
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
              <WarriorCard key={w.id} warrior={w} highlight={w.id === lastHitId} />
            ))}
          </div>
        </div>

        {showPopup && (
          <Popup winnerAddress={duelData?.duel_winner ?? ""} onClose={closePopup} />
        )}
      </main>
    </section>
  );
};

export default GameLayout;
