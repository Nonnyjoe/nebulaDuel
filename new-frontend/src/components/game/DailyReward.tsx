import { useEffect, useState } from "react";
import { playSfx } from "@/lib/sound";
import { useWallet } from "@/hooks/useWallet";
import { useSendInput } from "@/hooks/useSendInput";

const STORAGE_KEY = "nd_daily_reward_v1";
const DAY_MS = 24 * 60 * 60 * 1000;

const REWARDS = [
  { day: 1, pts: 50,   bonus: null,            label: "Recruit Cache" },
  { day: 2, pts: 80,   bonus: null,            label: "Combat Stipend" },
  { day: 3, pts: 120,  bonus: "1 CTSI",        label: "Arena Bounty" },
  { day: 4, pts: 160,  bonus: null,            label: "Operator Pack" },
  { day: 5, pts: 220,  bonus: "Rare Token",    label: "Elite Drop" },
  { day: 6, pts: 280,  bonus: "2 CTSI",        label: "Sovereign Tier" },
  { day: 7, pts: 500,  bonus: "Epic Crate",    label: "Apex Reward" },
] as const;

interface State {
  streak: number;        // last claimed day index (1-7); 0 = none yet
  lastClaim: number;     // ms timestamp
}

function readState(): State {
  if (typeof window === "undefined") return { streak: 0, lastClaim: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { streak: 0, lastClaim: 0 };
    return JSON.parse(raw) as State;
  } catch {
    return { streak: 0, lastClaim: 0 };
  }
}

function writeState(s: State) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* noop */ }
}

function fmtCountdown(ms: number) {
  if (ms <= 0) return "READY";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function DailyReward({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<State>({ streak: 0, lastClaim: 0 });
  const [now, setNow] = useState(() => Date.now());
  const [justClaimed, setJustClaimed] = useState<number | null>(null);
  const { isConnected } = useWallet();
  const { send } = useSendInput();

  useEffect(() => { setState(readState()); }, []);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsed = now - state.lastClaim;
  const canClaim = state.lastClaim === 0 || elapsed >= DAY_MS;
  const expired = state.lastClaim !== 0 && elapsed >= 2 * DAY_MS; // missed a day → reset streak on claim
  const nextDay = expired ? 1 : Math.min(7, state.streak + 1);
  const cooldown = canClaim ? 0 : DAY_MS - elapsed;

  const onClaim = () => {
    if (!canClaim) return;
    const claimed = nextDay;
    const next: State = { streak: claimed >= 7 ? 0 : claimed, lastClaim: Date.now() };
    setState(next);
    writeState(next);
    setJustClaimed(claimed);
    playSfx("win");
    setTimeout(() => setJustClaimed(null), 1800);
    // Settle the on-chain reward (backend enforces its own once-per-day rule).
    if (isConnected) {
      void send("claim_daily_reward", {}, { pendingMsg: "Claiming daily reward…", successMsg: "Daily reward claimed!" }).catch(() => {});
    }
  };

  return (
    <div className="glass-panel clip-bevel p-5 relative overflow-hidden">
      {/* ambient sweep */}
      <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(400px_180px_at_20%_-10%,oklch(0.86_0.18_200/0.35),transparent)]" />

      <div className="relative flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase">// DAILY REWARD</div>
          <h2 className="font-display text-2xl italic uppercase tracking-tight">Sign-In Cache</h2>
          {!compact && (
            <p className="text-[11px] text-muted-foreground mt-1 max-w-[42ch]">
              Claim every cycle. Miss a day and your streak resets — Apex Reward unlocks on day 7.
            </p>
          )}
        </div>
        <div className="text-right">
          <div className={`font-display text-3xl ${canClaim ? "text-primary text-glow animate-pulse-glow" : "text-foreground"}`}>
            {fmtCountdown(cooldown)}
          </div>
          <div className="font-mono-display text-[9px] uppercase tracking-widest text-muted-foreground">
            {canClaim ? "claim ready" : "next claim"}
          </div>
        </div>
      </div>

      {/* 7-day track */}
      <div className="relative grid grid-cols-7 gap-1.5">
        {REWARDS.map((r) => {
          const isClaimed = !expired && r.day <= state.streak;
          const isNext    = canClaim && r.day === nextDay;
          const isApex    = r.day === 7;
          const pulse     = justClaimed === r.day;
          return (
            <div
              key={r.day}
              className={`relative p-2 text-center clip-chrome-sm border transition-all ${
                pulse ? "scale-105 ring-2 ring-primary glow-cyan-sm" :
                isNext    ? "border-primary bg-primary/10 glow-cyan-sm" :
                isClaimed ? "border-primary/40 bg-panel-2/60 opacity-70" :
                            "border-foreground/10 bg-panel-2/30"
              } ${isApex ? "col-span-1" : ""}`}
            >
              <div className={`font-mono-display text-[9px] uppercase tracking-widest ${
                isNext ? "text-primary" : isClaimed ? "text-muted-foreground" : "text-muted-foreground/70"
              }`}>
                D{r.day}
              </div>
              <div
                className={`mt-1 font-display text-base leading-none ${
                  isApex ? "text-glow" : ""
                }`}
                style={{ color: isApex ? "var(--color-legendary)" : isNext ? "var(--color-primary)" : undefined }}
              >
                +{r.pts}
              </div>
              {r.bonus && (
                <div className="mt-1 font-mono-display text-[8px] uppercase tracking-wider text-muted-foreground truncate">
                  {r.bonus}
                </div>
              )}
              {isClaimed && (
                <span className="absolute top-1 right-1 size-3 grid place-items-center bg-primary text-primary-foreground text-[8px] font-display">✓</span>
              )}
              {isApex && !isClaimed && (
                <span className="absolute -top-1 -right-1 size-2 rounded-full bg-legendary animate-pulse-glow" style={{ background: "var(--color-legendary)" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="relative mt-4 flex items-center justify-between gap-3">
        <div className="font-mono-display text-[10px] uppercase tracking-widest text-muted-foreground">
          Streak · <span className="text-primary">{expired ? 0 : state.streak}</span> / 7
        </div>
        <button
          type="button"
          onClick={onClaim}
          disabled={!canClaim}
          className={`px-6 py-2.5 font-display uppercase tracking-widest text-sm clip-chrome-sm transition-all ${
            canClaim
              ? "bg-primary text-primary-foreground glow-cyan-sm hover:brightness-110 active:scale-95"
              : "bg-panel-2/60 text-muted-foreground cursor-not-allowed border border-foreground/10"
          }`}
        >
          {canClaim
            ? justClaimed
              ? `+${REWARDS[justClaimed - 1].pts} CLAIMED`
              : `Claim Day ${nextDay} · +${REWARDS[nextDay - 1].pts}`
            : "Locked"}
        </button>
      </div>

      {expired && state.streak > 0 && (
        <div className="relative mt-3 text-center font-mono-display text-[10px] text-destructive uppercase tracking-widest">
          // STREAK BROKEN · CYCLE RESTART
        </div>
      )}
    </div>
  );
}
