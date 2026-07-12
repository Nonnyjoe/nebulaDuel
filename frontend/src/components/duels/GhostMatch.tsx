/**
 * Ghost Match — async PvP. Fight a frozen snapshot of another player's squad
 * with no live opponent required: pick a strategy, the machine selects an
 * eligible rival, simulates on the unified engine and credits your record.
 * Lands you straight on the 3D replay.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";
import signMessages from "../../utils/relayTransaction";
import fetchNotices from "../../utils/readSubgraph";
import { STRATEGIES } from "../../utils/campaign";

const GhostMatch = () => {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const [myWarriors, setMyWarriors] = useState<number[]>([]);
  const [strategyId, setStrategyId] = useState<number>(2);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const addr = account?.address?.toLowerCase();
      if (!addr) return;
      const all = (await fetchNotices("all_characters")) ?? [];
      const mine = all
        .filter((c: any) => String(c.owner).toLowerCase() === addr)
        .map((c: any) => Number(c.id));
      if (!cancelled) setMyWarriors(mine);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [account?.address]);

  if (!account?.address) return null;

  const canFight = myWarriors.length >= 3;

  const challenge = async () => {
    if (!canFight) {
      toast.error("You need at least 3 warriors to ghost-battle.", {
        position: "top-right",
      });
      return;
    }
    setBusy(true);
    try {
      const [a, b, c] = myWarriors;
      await signMessages({
        func: "ghost_battle",
        char_id1: a,
        char_id2: b,
        char_id3: c,
        strategy_id: strategyId,
      });
      // Find the freshly-created duel (highest id created by me) and replay it.
      const duels = (await fetchNotices("all_duels")) ?? [];
      const mine = duels
        .filter(
          (d: any) =>
            String(d.duel_creator).toLowerCase() ===
            account.address.toLowerCase(),
        )
        .sort((x: any, y: any) => Number(y.duel_id) - Number(x.duel_id));
      if (mine.length) {
        navigate(`/duels/${mine[0].duel_id}`);
      } else {
        toast.success("Ghost match resolved — check your duels list.", {
          position: "top-right",
        });
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Ghost match failed", { position: "top-right" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div className="min-w-0">
        <p className="font-belanosima uppercase tracking-wide text-myGreen text-sm">
          👻 Ghost Match
        </p>
        <p className="font-poppins text-gray-400 text-xs mt-0.5">
          No opponent online? Challenge a snapshot of a real player's squad.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <select
          value={strategyId}
          onChange={(e) => setStrategyId(Number(e.target.value))}
          className="bg-navBg border border-gray-700 rounded-lg text-gray-200 text-xs px-3 py-2 focus:border-myGreen outline-none"
        >
          {STRATEGIES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.emoji} {s.name}
            </option>
          ))}
        </select>
        <button
          onClick={challenge}
          disabled={busy || !canFight}
          className="btn-glow rounded-xl font-belanosima uppercase tracking-wide text-xs px-6 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? "Fighting…" : "Fight"}
        </button>
      </div>
    </div>
  );
};

export default GhostMatch;
