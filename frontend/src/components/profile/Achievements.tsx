/**
 * Achievements panel — badges recomputed server-side from the player's live
 * record. Shows earned/locked state and progress toward each goal.
 */
import { useEffect, useState } from "react";
import { fetchAchievements, Achievements as Ach } from "../../utils/campaign";

const GoalIcon = ({ earned }: { earned: boolean }) => (
  <span
    className={`shrink-0 grid place-items-center w-9 h-9 rounded-full text-sm ${
      earned
        ? "bg-myGreen/20 text-myGreen border border-myGreen/50"
        : "bg-myBlack/60 text-gray-500 border border-gray-700"
    }`}
  >
    {earned ? "★" : "☆"}
  </span>
);

const Achievements = ({ wallet }: { wallet?: string }) => {
  const [data, setData] = useState<Ach | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!wallet) {
      setLoading(false);
      return;
    }
    fetchAchievements(wallet)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [wallet]);

  if (!wallet) return null;

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-belanosima uppercase text-white text-lg">
          Achievements
        </h3>
        {data && (
          <span className="font-poppins text-xs text-myGreen">
            {data.earned}/{data.total} earned
          </span>
        )}
      </div>

      {loading ? (
        <p className="font-belanosima text-myGreen animate-pulse text-sm">
          Loading badges…
        </p>
      ) : !data ? (
        <p className="font-poppins text-gray-500 text-sm">
          No achievements yet — fight a battle to begin earning badges.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {data.badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-xl border p-3 flex items-center gap-3 ${
                b.earned
                  ? "border-myGreen/40 bg-myBlack/80"
                  : "border-gray-800 bg-myBlack/50"
              }`}
            >
              <GoalIcon earned={b.earned} />
              <div className="min-w-0 flex-1">
                <p
                  className={`font-belanosima text-sm truncate ${
                    b.earned ? "text-white" : "text-gray-400"
                  }`}
                >
                  {b.name}
                </p>
                <p className="font-poppins text-[11px] text-gray-500 truncate">
                  {b.description}
                </p>
                {!b.earned && (
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-myGreen/70 rounded-full"
                      style={{ width: `${Math.min(100, b.progress)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Achievements;
