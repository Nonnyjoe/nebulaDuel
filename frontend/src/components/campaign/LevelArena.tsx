import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "sonner";
import charactersdata from "../../utils/Charactersdata";
import fetchNotices from "../../utils/readSubgraph";
import signMessages from "../../utils/relayTransaction";
import audio from "../../utils/audio";
import {
  fetchCampaignLevels,
  fetchCampaignProgress,
  fetchLatestBattleReport,
  CampaignLevel,
  CampaignProgress,
  BattleReport,
  BIOME_THEMES,
  ELEMENT_META,
  ElementName,
  powerToElement,
  elementMultiplier,
  biomeMultiplier,
  squadFitScore,
  POWER_DESCRIPTIONS,
  STRATEGIES,
  enemyVisual,
} from "../../utils/campaign";
import CampaignBattle from "./CampaignBattle";

type Phase = "loading" | "briefing" | "submitting" | "replay" | "result";

interface OwnedCharacter {
  id: number;
  name: string;
  health: number;
  strength: number;
  attack: number;
  speed: number;
  super_power: string;
  element: ElementName;
  img?: string;
}

const LevelArena = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const account = useActiveAccount();

  const [phase, setPhase] = useState<Phase>("loading");
  const [level, setLevel] = useState<CampaignLevel | null>(null);
  const [progress, setProgress] = useState<CampaignProgress | null>(null);
  const [roster, setRoster] = useState<OwnedCharacter[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [strategyId, setStrategyId] = useState<number>(2); // Assassin default
  const [report, setReport] = useState<BattleReport | null>(null);
  const [statusText, setStatusText] = useState("");

  const lvlNum = Number(levelId);

  // ---- load level + roster + progress ----
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const levels = await fetchCampaignLevels();
      const lvl = levels.find((l) => Number(l.id) === lvlNum) ?? null;

      let prog: CampaignProgress | null = null;
      let owned: OwnedCharacter[] = [];
      if (account?.address) {
        prog = await fetchCampaignProgress(account.address);
        const allChars = await fetchNotices("all_characters");
        owned = (Array.isArray(allChars) ? allChars : [])
          .filter(
            (c: any) =>
              c.owner?.toLowerCase() === account.address.toLowerCase(),
          )
          .map((c: any) => ({
            id: Number(c.id),
            name: c.name,
            health: Number(c.health),
            strength: Number(c.strength),
            attack: Number(c.attack),
            speed: Number(c.speed),
            super_power: c.super_power,
            element: powerToElement(c.super_power),
            img: charactersdata.find((d) => d.name === c.name)?.img,
          }));
      }

      if (!cancelled) {
        setLevel(lvl);
        setProgress(prog);
        setRoster(owned);
        setPhase("briefing");
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [lvlNum, account?.address]);

  const theme = level ? BIOME_THEMES[level.biome] : null;
  const cleared = progress?.campaign_progress ?? 0;
  const locked = level ? level.id > cleared + 1 : true;
  const attempts =
    progress?.attempts?.find((a) => a.level === lvlNum)?.attempts ?? 0;
  const isRetry = attempts > 0;

  const enemyElements = useMemo(
    () => (level ? level.enemies.map((e) => e.element) : []),
    [level],
  );

  const selectedSquad = roster.filter((c) => selected.includes(c.id));
  const fitScore = level
    ? squadFitScore(
        level.biome,
        selectedSquad.map((c) => c.element),
        enemyElements,
      )
    : 100;

  const toggleSelect = (id: number) => {
    audio.play("click");
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) {
        toast.error("You can only field 3 warriors.", { position: "top-right" });
        return prev;
      }
      return [...prev, id];
    });
  };

  /** Per-character expected effectiveness on this level (percent). */
  const charScore = useCallback(
    (c: OwnedCharacter): number => {
      if (!level) return 100;
      const bio = biomeMultiplier(level.biome, c.element);
      const avg =
        enemyElements.reduce(
          (sum, e) => sum + elementMultiplier(c.element, e),
          0,
        ) / Math.max(1, enemyElements.length);
      return Math.round((avg * bio) / 100);
    },
    [level, enemyElements],
  );

  // ---- launch ----
  const launch = async () => {
    if (!level || !account?.address) return;
    if (selected.length !== 3) {
      toast.error("Select exactly 3 warriors.", { position: "top-right" });
      return;
    }
    audio.play("click");
    setPhase("submitting");
    try {
      setStatusText("Confirm the transaction in your wallet…");
      const payload = {
        func: "play_campaign_level",
        level_id: level.id,
        char_id1: selected[0],
        char_id2: selected[1],
        char_id3: selected[2],
        strategy_id: strategyId,
      };
      // signMessages resolves after the Cartesi machine has simulated the
      // whole battle deterministically.
      setStatusText("The Cartesi machine is simulating your battle…");
      await signMessages(payload);

      setStatusText("Retrieving the battle record…");
      const rep = await fetchLatestBattleReport(account.address, level.id);
      if (!rep) {
        toast.error(
          "Battle was submitted but the report isn't available yet — try Watch last battle in a few seconds.",
          { position: "top-right" },
        );
        setPhase("briefing");
        return;
      }
      setReport(rep);
      setPhase("replay");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to start the battle", {
        position: "top-right",
      });
      setPhase("briefing");
    }
  };

  const watchLast = async () => {
    if (!level || !account?.address) return;
    audio.play("click");
    const rep = await fetchLatestBattleReport(account.address, level.id);
    if (!rep) {
      toast.info("No previous battle found for this level.", {
        position: "top-right",
      });
      return;
    }
    setReport(rep);
    setPhase("replay");
  };

  const onReplayFinished = async () => {
    setPhase("result");
    // refresh progress (points, unlocks, titles)
    if (account?.address) {
      const prog = await fetchCampaignProgress(account.address);
      setProgress(prog);
    }
  };

  // ---- render helpers ----

  if (phase === "loading") {
    return (
      <section className="min-h-screen bg-bodyBg flex items-center justify-center">
        <p className="font-belanosima text-myGreen animate-pulse">
          Entering level {levelId}…
        </p>
      </section>
    );
  }

  if (!level || !theme) {
    return (
      <section className="min-h-screen bg-bodyBg flex flex-col items-center justify-center gap-4">
        <p className="font-belanosima text-white">
          Level {levelId} could not be loaded.
        </p>
        <Link
          to="/campaign"
          className="rounded-lg bg-myGreen text-navBg font-belanosima uppercase px-6 py-2.5"
        >
          Back to campaign
        </Link>
      </section>
    );
  }

  return (
    <section className="w-full min-h-screen bg-bodyBg pb-20">
      {/* Biome header */}
      <div
        className={`w-full bg-gradient-to-b ${theme.gradient} border-b`}
        style={{ borderColor: `${theme.accent}55` }}
      >
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8">
          <Link
            to="/campaign"
            className="text-gray-400 hover:text-myGreen font-belanosima text-xs uppercase tracking-widest"
          >
            ← Campaign map
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-3xl md:text-4xl">{theme.emoji}</span>
            <h1
              className={`font-belanosima text-2xl md:text-4xl ${level.is_boss ? "text-myYellow" : "text-white"}`}
            >
              Level {level.id} — {level.name}
            </h1>
            {level.is_boss && (
              <span className="font-belanosima text-[10px] uppercase tracking-widest bg-myYellow/20 text-myYellow rounded px-2 py-1">
                Boss level
              </span>
            )}
          </div>
          <p className={`mt-2 font-poppins text-sm md:text-base ${theme.text}`}>
            {level.lore}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-poppins">
            <span className="rounded-full bg-black/40 px-3 py-1 text-gray-300">
              Terrain boosts{" "}
              <b className={ELEMENT_META[theme.boosted].color}>
                {ELEMENT_META[theme.boosted].emoji} {theme.boosted}
              </b>
            </span>
            <span className="rounded-full bg-black/40 px-3 py-1 text-gray-300">
              Terrain dampens{" "}
              <b className={ELEMENT_META[theme.dampened].color}>
                {ELEMENT_META[theme.dampened].emoji} {theme.dampened}
              </b>
            </span>
            <span className="rounded-full bg-black/40 px-3 py-1 text-myGreen">
              First clear: +{level.reward_points} pts
            </span>
            {isRetry && (
              <span className="rounded-full bg-black/40 px-3 py-1 text-myYellow">
                Retry cost: {level.retry_cost} pts
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-8 mt-8">
        {phase === "submitting" && (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div
              className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: `${theme.accent}`, borderTopColor: "transparent" }}
            />
            <p className="font-belanosima text-white text-lg text-center">
              {statusText}
            </p>
            <p className="font-poppins text-gray-500 text-xs text-center max-w-md">
              The battle is computed deterministically inside the Cartesi
              machine — the result you'll watch is verifiable on-chain.
            </p>
          </div>
        )}

        {phase === "replay" && report && (
          <CampaignBattle report={report} onFinished={onReplayFinished} />
        )}

        {phase === "result" && report && (
          <div className="flex flex-col items-center gap-6 py-10">
            <h2
              className="font-belanosima text-4xl md:text-6xl uppercase tracking-widest"
              style={{ color: report.victory ? "#45f882" : "#ef4444" }}
            >
              {report.victory ? "Victory" : "Defeat"}
            </h2>
            {report.victory ? (
              <div className="rounded-2xl border border-myGreen/40 bg-myBlack/80 px-8 py-6 text-center space-y-2">
                <p className="font-belanosima text-myGreen text-xl">
                  +{report.rewards.points} points
                </p>
                {report.rewards.stat_boost && (
                  <p className="font-poppins text-gray-300 text-sm">
                    Your squad grew stronger: +3 HP, +1 STR, +1 ATK each
                  </p>
                )}
                {report.rewards.title && (
                  <p className="font-belanosima text-myYellow">
                    🏆 New title: {report.rewards.title}
                  </p>
                )}
              </div>
            ) : (
              <p className="font-poppins text-gray-400 text-sm max-w-md text-center">
                The {theme.label} claims another challenger. Study the enemy
                elements and the terrain — a different squad may turn the tide.
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  audio.play("click");
                  setReport(null);
                  setSelected([]);
                  setPhase("briefing");
                }}
                className="rounded-xl bg-myGreen hover:bg-myYellow text-navBg font-belanosima uppercase px-8 py-3"
              >
                {report.victory ? "Battle again" : "Retry level"}
              </button>
              {report.victory && level.id < 20 && (
                <button
                  onClick={() => {
                    audio.play("click");
                    navigate(`/campaign/${level.id + 1}`);
                    setReport(null);
                    setSelected([]);
                    setPhase("loading");
                    // useEffect on levelId reloads
                  }}
                  className="rounded-xl border border-myGreen text-myGreen font-belanosima uppercase px-8 py-3 hover:bg-myGreen hover:text-navBg"
                >
                  Next level →
                </button>
              )}
              <Link
                to="/campaign"
                className="rounded-xl border border-gray-700 text-gray-300 font-belanosima uppercase px-8 py-3 hover:border-myGreen hover:text-myGreen"
              >
                Campaign map
              </Link>
            </div>
          </div>
        )}

        {phase === "briefing" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Enemy intel */}
            <div>
              <h2 className="font-belanosima text-white text-lg uppercase tracking-wider mb-4">
                Enemy forces
              </h2>
              <div className="space-y-3">
                {level.enemies.map((e) => {
                  const meta = ELEMENT_META[e.element];
                  const isBossUnit = e.name === e.name.toUpperCase();
                  const visual = enemyVisual(e.element, e.id);
                  return (
                    <div
                      key={e.id}
                      className={`rounded-xl border bg-myBlack/80 p-3 flex gap-3 ${
                        isBossUnit
                          ? "border-myYellow/70 shadow-[0_0_18px_rgba(250,204,21,0.15)]"
                          : "border-gray-800"
                      }`}
                    >
                      {/* portrait — the exact fighter you'll face in the arena */}
                      <div
                        className={`relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border ${
                          isBossUnit ? "border-myYellow/60" : "border-gray-700"
                        }`}
                      >
                        {visual.img ? (
                          <img
                            src={visual.img}
                            alt={e.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl bg-navBg">
                            {meta.emoji}
                          </div>
                        )}
                        <span
                          className={`absolute bottom-0 inset-x-0 text-center text-[9px] font-belanosima uppercase tracking-wider py-0.5 ${meta.bg} ${meta.color} backdrop-blur-sm`}
                        >
                          {meta.emoji} {e.element}
                        </span>
                        {isBossUnit && (
                          <span className="absolute top-1 right-1 text-[9px] font-belanosima uppercase bg-myYellow text-navBg rounded px-1.5 py-0.5">
                            Boss
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-belanosima truncate ${isBossUnit ? "text-myYellow" : "text-white"}`}
                        >
                          {e.name}
                        </p>
                        {/* stat bars */}
                        <div className="mt-1.5 space-y-1">
                          {[
                            { label: "HP", value: e.health, max: 350, color: "bg-myGreen" },
                            { label: "ATK", value: e.attack, max: 32, color: "bg-red-400" },
                            { label: "STR", value: e.strength, max: 28, color: "bg-orange-400" },
                            { label: "SPD", value: e.speed, max: 20, color: "bg-cyan-400" },
                          ].map((s) => (
                            <div key={s.label} className="flex items-center gap-2">
                              <span className="w-7 text-[9px] text-gray-500 font-belanosima">
                                {s.label}
                              </span>
                              <div className="flex-1 h-1.5 rounded bg-gray-800 overflow-hidden">
                                <div
                                  className={`h-full ${s.color}`}
                                  style={{
                                    width: `${Math.min(100, (s.value / s.max) * 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="w-8 text-right text-[9px] text-gray-400 font-poppins">
                                {s.value}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p
                          className={`text-[11px] font-poppins mt-1.5 leading-snug ${meta.color}`}
                        >
                          ⚡ <b>{e.power}</b> —{" "}
                          {POWER_DESCRIPTIONS[e.power] ?? "Unknown power"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {locked && (
                <p className="mt-4 text-myYellow font-poppins text-sm">
                  🔒 Clear level {level.id - 1} to unlock this battle.
                </p>
              )}
            </div>

            {/* Squad selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-belanosima text-white text-lg uppercase tracking-wider">
                  Your squad ({selected.length}/3)
                </h2>
                {selected.length > 0 && (
                  <span
                    className={`font-belanosima text-sm ${
                      fitScore >= 110
                        ? "text-myGreen"
                        : fitScore >= 90
                          ? "text-myYellow"
                          : "text-red-400"
                    }`}
                  >
                    Terrain fit: {fitScore}%
                  </span>
                )}
              </div>

              {!account?.address ? (
                <p className="text-gray-500 font-poppins text-sm">
                  Connect your wallet to assemble a squad.
                </p>
              ) : roster.length === 0 ? (
                <p className="text-gray-500 font-poppins text-sm">
                  You own no warriors yet —{" "}
                  <Link
                    to="/profile/purchasecharacter"
                    className="text-myGreen underline"
                  >
                    recruit your first squad
                  </Link>
                  .
                </p>
              ) : (
                // p-1.5 inside the scroll container keeps the selection glow
                // from being clipped at the edges.
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1.5 -m-1.5 nebula-scroll">
                  {roster.map((c) => {
                    const meta = ELEMENT_META[c.element];
                    const score = charScore(c);
                    const isSelected = selected.includes(c.id);
                    const slot = selected.indexOf(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleSelect(c.id)}
                        disabled={locked}
                        className={`relative text-left rounded-xl border-2 bg-myBlack/80 p-2.5 transition-colors flex flex-col ${
                          isSelected
                            ? "border-myGreen shadow-[0_0_14px_rgba(69,248,130,0.45)]"
                            : "border-gray-800 hover:border-gray-600"
                        } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {isSelected && (
                          <span className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-myGreen text-navBg font-belanosima text-xs flex items-center justify-center shadow">
                            {slot + 1}
                          </span>
                        )}
                        <div className="w-full h-24 rounded-lg overflow-hidden mb-2 bg-navBg">
                          {c.img && (
                            <img
                              src={c.img}
                              alt={c.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <p className="font-belanosima text-white text-xs truncate">
                          {c.name}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={`text-[9px] rounded-full px-1.5 py-0.5 ${meta.bg} ${meta.color}`}
                          >
                            {meta.emoji} {c.element}
                          </span>
                          <span
                            className={`text-[10px] font-belanosima ${
                              score >= 110
                                ? "text-myGreen"
                                : score >= 90
                                  ? "text-myYellow"
                                  : "text-red-400"
                            }`}
                            title="Expected effectiveness on this terrain vs these enemies"
                          >
                            {score}%
                          </span>
                        </div>
                        <p className="text-[9px] text-gray-500 font-poppins mt-1">
                          HP {c.health} · ATK {c.attack} · SPD {c.speed}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Battle strategy */}
              <h2 className="font-belanosima text-white text-lg uppercase tracking-wider mt-7 mb-3">
                Battle strategy
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {STRATEGIES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      audio.play("click");
                      setStrategyId(s.id);
                    }}
                    disabled={locked}
                    className={`text-left rounded-xl border-2 px-3 py-2.5 transition-colors ${
                      strategyId === s.id
                        ? "border-myGreen bg-myGreen/10 shadow-[0_0_12px_rgba(69,248,130,0.35)]"
                        : "border-gray-800 bg-myBlack/80 hover:border-gray-600"
                    } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <p
                      className={`font-belanosima text-sm ${
                        strategyId === s.id ? "text-myGreen" : "text-white"
                      }`}
                    >
                      {s.emoji} {s.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-poppins mt-0.5 leading-snug">
                      {s.description}
                    </p>
                  </button>
                ))}
              </div>

              <style>{`
                .nebula-scroll::-webkit-scrollbar { width: 6px; }
                .nebula-scroll::-webkit-scrollbar-track { background: transparent; }
                .nebula-scroll::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
                .nebula-scroll::-webkit-scrollbar-thumb:hover { background: #45f882; }
              `}</style>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={launch}
                  disabled={locked || selected.length !== 3}
                  className="rounded-xl bg-myGreen hover:bg-myYellow text-navBg font-belanosima uppercase tracking-wide px-10 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(69,248,130,0.3)]"
                >
                  {isRetry
                    ? `Retry (${level.retry_cost} pts)`
                    : "Launch assault"}
                </button>
                {attempts > 0 && (
                  <button
                    onClick={watchLast}
                    className="rounded-xl border border-gray-700 text-gray-300 font-belanosima uppercase px-8 py-3.5 hover:border-myGreen hover:text-myGreen"
                  >
                    Watch last battle
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LevelArena;
