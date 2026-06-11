import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "sonner";
import {
  fetchCampaignLevels,
  fetchCampaignProgress,
  fetchCampaignLeaderboard,
  CampaignLevel,
  CampaignProgress,
  LeaderboardRow,
  BIOME_THEMES,
  ELEMENT_META,
} from "../../utils/campaign";
import audio from "../../utils/audio";

const CampaignMap = () => {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const [levels, setLevels] = useState<CampaignLevel[]>([]);
  const [progress, setProgress] = useState<CampaignProgress | null>(null);
  const [leaders, setLeaders] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const [lvls, board] = await Promise.all([
        fetchCampaignLevels(),
        fetchCampaignLeaderboard(),
      ]);
      let prog: CampaignProgress | null = null;
      if (account?.address) {
        prog = await fetchCampaignProgress(account.address);
      }
      if (!cancelled) {
        setLevels(lvls);
        setLeaders(board);
        setProgress(prog);
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [account?.address]);

  const cleared = progress?.campaign_progress ?? 0;
  const topTitle = progress?.titles?.length
    ? progress.titles[progress.titles.length - 1]
    : "Nebula Initiate";

  const attemptsFor = (levelId: number) =>
    progress?.attempts?.find((a) => a.level === levelId)?.attempts ?? 0;

  const openLevel = (level: CampaignLevel, locked: boolean) => {
    if (locked) {
      audio.play("click");
      toast.error(`Clear level ${level.id - 1} to unlock ${level.name}.`, {
        position: "top-right",
      });
      return;
    }
    audio.play("click");
    navigate(`/campaign/${level.id}`);
  };

  // Zig-zag layout: alternate left/right offsets so the path winds downward.
  const nodeOffset = (index: number) => {
    const cycle = index % 4;
    if (cycle === 0) return "lg:ml-0";
    if (cycle === 1) return "lg:ml-[22%]";
    if (cycle === 2) return "lg:ml-[44%]";
    return "lg:ml-[22%]";
  };

  const stats = useMemo(
    () => [
      { label: "Levels cleared", value: `${cleared} / 20` },
      { label: "Victories", value: progress?.campaign_wins ?? 0 },
      { label: "Defeats", value: progress?.campaign_losses ?? 0 },
      { label: "Rank", value: topTitle },
    ],
    [cleared, progress, topTitle],
  );

  return (
    <section className="w-full min-h-screen bg-bodyBg pb-24">
      {/* Hero */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-bodyBg to-bodyBg" />
        <div className="relative max-w-[1200px] mx-auto px-4 md:px-8 pt-14 pb-10 text-center">
          <p className="font-belanosima uppercase tracking-[0.4em] text-myGreen text-xs md:text-sm mb-3 animate-pulse">
            The Nebula Gauntlet
          </p>
          <h1 className="font-belanosima text-4xl md:text-6xl text-white mb-4">
            Campaign
          </h1>
          <p className="font-poppins text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
            Twenty levels across six hostile realms. Every map favors an
            element — and every enemy wields a power of its own. Read the
            terrain, pick your warriors, and march on the Throne of Eternity.
          </p>

          {/* Player stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-gray-800 bg-myBlack/70 backdrop-blur px-4 py-3"
              >
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-belanosima">
                  {s.label}
                </p>
                <p className="text-myGreen font-belanosima text-lg md:text-xl truncate">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                audio.play("click");
                setShowLeaderboard((v) => !v);
              }}
              className="rounded-lg border border-myGreen/50 text-myGreen font-belanosima uppercase text-xs tracking-wider px-5 py-2.5 hover:bg-myGreen hover:text-navBg transition-colors"
            >
              {showLeaderboard ? "Hide leaderboard" : "Leaderboard"}
            </button>
            <button
              onClick={() => audio.setMuted(!audio.muted)}
              className="rounded-lg border border-gray-700 text-gray-400 font-belanosima uppercase text-xs tracking-wider px-5 py-2.5 hover:border-myGreen hover:text-myGreen transition-colors"
            >
              Sound: {audio.muted ? "off" : "on"}
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      {showLeaderboard && (
        <div className="max-w-3xl mx-auto px-4 mb-10">
          <div className="rounded-2xl border border-gray-800 bg-myBlack/80 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800 font-belanosima text-myGreen uppercase text-sm tracking-wider">
              Hall of Champions
            </div>
            {leaders.length === 0 ? (
              <p className="px-5 py-6 text-gray-500 font-poppins text-sm">
                No champions yet — be the first to clear a level.
              </p>
            ) : (
              leaders.map((row) => (
                <div
                  key={row.wallet_address}
                  className="flex items-center justify-between px-5 py-3 border-b border-gray-900 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-belanosima text-myYellow w-8">
                      #{row.rank}
                    </span>
                    <div>
                      <p className="text-white font-belanosima text-sm">
                        {row.monika}
                      </p>
                      {row.top_title && (
                        <p className="text-[10px] uppercase tracking-wider text-myGreen">
                          {row.top_title}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 font-belanosima text-sm">
                      Level {row.campaign_progress}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {row.campaign_wins}W / {row.campaign_losses}L
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Level path */}
      <div className="max-w-[900px] mx-auto px-4 md:px-8 relative">
        {loading ? (
          <p className="text-center text-myGreen font-belanosima animate-pulse py-20">
            Charting the gauntlet…
          </p>
        ) : levels.length === 0 ? (
          <p className="text-center text-gray-500 font-poppins py-20">
            Could not load campaign levels — is the Cartesi node running?
          </p>
        ) : (
          <div className="relative">
            {/* vertical spine on mobile / winding feel on desktop */}
            <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-myGreen/40 via-gray-800 to-purple-900/60" />
            <div className="flex flex-col gap-5">
              {levels.map((level, index) => {
                const theme = BIOME_THEMES[level.biome];
                const isCleared = cleared >= level.id;
                const isNext = cleared + 1 === level.id;
                const locked = level.id > cleared + 1;
                const attempts = attemptsFor(level.id);

                return (
                  <div
                    key={level.id}
                    className={`relative lg:w-[56%] w-full pl-12 lg:pl-0 ${nodeOffset(index)}`}
                  >
                    <button
                      onClick={() => openLevel(level, locked)}
                      className={`group w-full text-left rounded-2xl border bg-gradient-to-br ${theme.gradient} p-[1px] transition-transform duration-200 ${
                        locked
                          ? "opacity-45 grayscale border-gray-800 cursor-not-allowed"
                          : `hover:scale-[1.02] border-transparent ${isNext ? `ring-2 ${theme.ring} shadow-lg` : ""}`
                      }`}
                    >
                      <div className="rounded-2xl bg-myBlack/80 backdrop-blur px-4 md:px-5 py-4 flex items-center gap-4">
                        {/* Node number */}
                        <div
                          className={`shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-belanosima text-lg md:text-xl border-2 ${
                            isCleared
                              ? "bg-myGreen text-navBg border-myGreen"
                              : isNext
                                ? `${theme.text} border-current animate-pulse`
                                : "text-gray-500 border-gray-700"
                          }`}
                        >
                          {isCleared ? "✓" : level.id}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg">{theme.emoji}</span>
                            <h3
                              className={`font-belanosima text-base md:text-lg truncate ${
                                level.is_boss ? "text-myYellow" : "text-white"
                              }`}
                            >
                              {level.name}
                            </h3>
                            {level.is_boss && (
                              <span className="text-[9px] font-belanosima uppercase tracking-widest bg-myYellow/20 text-myYellow rounded px-2 py-0.5">
                                Boss
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] md:text-xs ${theme.text} font-poppins truncate`}>
                            {theme.label} · {theme.tagline}
                          </p>
                          {/* enemy element badges */}
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {level.enemies.map((e) => {
                              const meta = ELEMENT_META[e.element];
                              return (
                                <span
                                  key={e.id}
                                  title={`${e.name} — ${e.power}`}
                                  className={`text-[10px] rounded-full px-2 py-0.5 ${meta.bg} ${meta.color}`}
                                >
                                  {meta.emoji} {e.element}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className="text-right shrink-0 hidden sm:block">
                          <p className="text-myGreen font-belanosima text-sm">
                            +{level.reward_points} pts
                          </p>
                          {attempts > 0 && !isCleared && (
                            <p className="text-[10px] text-gray-500">
                              retry: {level.retry_cost} pts
                            </p>
                          )}
                          {level.title && (
                            <p className="text-[10px] text-myYellow truncate max-w-[120px]">
                              🏆 {level.title}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!account?.address && !loading && (
          <p className="text-center text-gray-500 font-poppins text-sm mt-10">
            Connect your wallet and{" "}
            <Link to="/profile" className="text-myGreen underline">
              create a profile
            </Link>{" "}
            to begin the campaign.
          </p>
        )}
      </div>
    </section>
  );
};

export default CampaignMap;
