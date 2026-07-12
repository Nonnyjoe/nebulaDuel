/**
 * Top Gamers — REAL standings from the Cartesi machine. Two live boards:
 * the campaign gauntlet and the global P2P/AI duel ladder (replaces the old
 * static marketing carousel).
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchCampaignLeaderboard,
  fetchPvpLeaderboard,
  LeaderboardRow,
  PvpLeaderboardRow,
} from "../../utils/campaign";

const medal = (rank: number) =>
  rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;

type Board = "campaign" | "duels";

const TopGamers = () => {
  const [board, setBoard] = useState<Board>("campaign");
  const [campaign, setCampaign] = useState<LeaderboardRow[]>([]);
  const [duels, setDuels] = useState<PvpLeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchCampaignLeaderboard(), fetchPvpLeaderboard()])
      .then(([c, d]) => {
        if (cancelled) return;
        setCampaign(c.slice(0, 6));
        setDuels(d.slice(0, 6));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const tabBtn = (id: Board, label: string) => (
    <button
      onClick={() => setBoard(id)}
      className={`font-belanosima uppercase tracking-wide text-xs px-5 py-2 rounded-full transition-colors ${
        board === id
          ? "bg-myGreen text-navBg"
          : "border border-gray-700 text-gray-300 hover:border-myGreen hover:text-myGreen"
      }`}
    >
      {label}
    </button>
  );

  const rows = board === "campaign" ? campaign : duels;

  return (
    <section className="container-game section">
      <div className="text-center mb-6">
        <p className="font-belanosima uppercase tracking-[0.4em] text-myGreen text-xs mb-2">
          Hall of Champions
        </p>
        <h2 className="font-belanosima uppercase text-white">
          Top <span className="text-aurora">Gamers</span>
        </h2>
        <p className="font-poppins text-gray-400 text-sm max-w-xl mx-auto mt-3">
          Live standings from the Nebula — every rank earned in verifiable
          on-chain battle.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 mb-8">
        {tabBtn("campaign", "Campaign")}
        {tabBtn("duels", "Duels")}
      </div>

      {loading ? (
        <p className="text-center text-myGreen font-belanosima animate-pulse py-10">
          Summoning the champions…
        </p>
      ) : rows.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 font-poppins text-sm mb-5">
            {board === "campaign"
              ? "The throne is empty — no champion has cleared a level yet."
              : "No duels fought yet — be the first to claim the ladder."}
          </p>
          <Link
            to={board === "campaign" ? "/campaign" : "/duels"}
            className="btn-glow inline-block rounded-xl font-belanosima uppercase text-sm px-8 py-3.5"
          >
            Be the first
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {board === "campaign"
            ? campaign.map((row) => (
                <div
                  key={row.wallet_address}
                  className="glass-card rounded-2xl px-5 py-4 lift flex items-center gap-4"
                >
                  <span className="font-belanosima text-2xl w-10 text-center shrink-0">
                    {medal(row.rank)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-belanosima text-white truncate">
                      {row.monika}
                    </p>
                    {row.top_title && (
                      <p className="text-[10px] uppercase tracking-wider text-myYellow truncate">
                        🏆 {row.top_title}
                      </p>
                    )}
                    <p className="text-[11px] text-gray-400 font-poppins mt-0.5">
                      Level {row.campaign_progress}/20 · {row.campaign_wins}W /{" "}
                      {row.campaign_losses}L
                    </p>
                  </div>
                </div>
              ))
            : duels.map((row) => (
                <div
                  key={row.wallet_address}
                  className="glass-card rounded-2xl px-5 py-4 lift flex items-center gap-4"
                >
                  <span className="font-belanosima text-2xl w-10 text-center shrink-0">
                    {medal(row.rank)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-belanosima text-white truncate">
                      {row.monika}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-myGreen">
                      ⚔️ Rating {row.rating}
                    </p>
                    <p className="text-[11px] text-gray-400 font-poppins mt-0.5">
                      {row.total_wins}W / {row.total_losses}L · {row.win_rate}%
                      win rate
                    </p>
                  </div>
                </div>
              ))}
        </div>
      )}
    </section>
  );
};

export default TopGamers;
