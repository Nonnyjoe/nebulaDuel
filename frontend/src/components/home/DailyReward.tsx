/**
 * Daily Reward — the return loop. Players claim an escalating points bonus once
 * per UTC day; the streak (and reward) grows up to a 7-day cap and resets if a
 * day is missed. The bucket is derived deterministically from the block
 * timestamp on-chain, so the claim simply succeeds or is rejected as
 * "already claimed today".
 */
import { useState } from "react";
import { toast } from "sonner";
import signMessages from "../../utils/relayTransaction";
import { useProfileContext } from "../contexts/ProfileContext";

const DailyReward = () => {
  const { profile } = useProfileContext();
  const [busy, setBusy] = useState(false);

  // Only relevant to a registered player.
  if (!profile) return null;

  const claim = async () => {
    setBusy(true);
    try {
      await signMessages({ func: "claim_daily_reward" });
      toast.success("Daily reward claimed — streak extended!", {
        position: "top-right",
      });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not claim today's reward", {
        position: "top-right",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl px-5 py-4 max-w-md mx-auto my-6 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-belanosima uppercase tracking-wide text-myGreen text-sm">
          Daily Reward
        </p>
        <p className="font-poppins text-gray-400 text-xs mt-0.5">
          Claim once a day — keep the streak alive for up to +200 points.
        </p>
      </div>
      <button
        onClick={claim}
        disabled={busy}
        className="btn-glow shrink-0 rounded-xl font-belanosima uppercase tracking-wide text-xs px-6 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy ? "Claiming…" : "Claim"}
      </button>
    </div>
  );
};

export default DailyReward;
