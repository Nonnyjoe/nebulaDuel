import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { GameLayout } from "@/components/game/GameLayout";
import { PageHeader } from "@/components/game/PageHeader";
import { WarriorCard } from "@/components/game/WarriorCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { toWarrior } from "@/lib/game/warrior-adapter";
import { fetchDuels } from "@/lib/cartesi/duels";
import { usePlayerCharacters } from "@/hooks/game";
import { useWallet } from "@/hooks/useWallet";
import { useSendInput } from "@/hooks/useSendInput";

export default function JoinDuel() {
  const { duelId } = useParams();
  useDocumentTitle(`Join Duel #${duelId ?? ""} — Nebula Duel`);
  const navigate = useNavigate();
  const { address, isConnected, connect } = useWallet();
  const { data: roster, isLoading } = usePlayerCharacters(address);
  const { send, pending } = useSendInput();
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (id: number) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s));

  const join = async () => {
    if (selected.length !== 3 || !duelId) return;
    try {
      await send(
        "join_duel",
        { duel_id: Number(duelId), char_id1: selected[0], char_id2: selected[1], char_id3: selected[2] },
        {
          pendingMsg: "Joining duel…",
          successMsg: "Joined — lock your strategy",
          invalidate: ["available_duels", "duels"],
          // Confirm we're registered as the opponent before opening the briefing.
          verify: {
            label: "Confirming your spot…",
            check: () => fetchDuels("duels"),
            until: (duels: any) =>
              Array.isArray(duels) &&
              duels.some(
                (d) => String(d.id) === duelId && (d.duel_opponent ?? "").toLowerCase() === (address ?? "").toLowerCase(),
              ),
          },
        },
      );
      navigate(`/battle?duel=${duelId}`);
    } catch {
      /* toast shown */
    }
  };

  return (
    <GameLayout>
      <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-10">
        <PageHeader eyebrow="// CHALLENGE ACCEPTED" title="Join" accent={`Duel #${duelId ?? ""}`} blurb="Select three warriors to answer this open challenge, then lock your strategy." />

        {!isConnected ? (
          <div className="glass-panel clip-chrome p-12 text-center">
            <p className="font-mono-display text-xs uppercase tracking-widest text-muted-foreground mb-4">Connect a wallet to join.</p>
            <button onClick={connect} className="px-6 py-3 bg-primary text-primary-foreground font-display text-sm uppercase tracking-widest clip-chrome-sm">Connect</button>
          </div>
        ) : isLoading ? (
          <div className="glass-panel clip-chrome p-12 grid place-items-center"><span className="size-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /></div>
        ) : !roster?.length ? (
          <div className="glass-panel clip-chrome p-12 text-center">
            <p className="font-mono-display text-xs uppercase tracking-widest text-muted-foreground mb-4">You own no warriors yet.</p>
            <Link to="/market" className="px-6 py-3 bg-primary text-primary-foreground font-display text-sm uppercase tracking-widest clip-chrome-sm">Recruit in Market →</Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-xl italic uppercase text-primary">Squad · {selected.length}/3</span>
              <button onClick={join} disabled={selected.length !== 3 || pending} className="px-8 py-3 bg-primary text-primary-foreground font-display uppercase tracking-widest text-sm clip-chrome-sm glow-cyan-sm hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none">
                {pending ? "Joining…" : selected.length === 3 ? "Join Duel →" : `Select ${3 - selected.length} More`}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {roster.map((c, i) => {
                const idx = selected.indexOf(c.id);
                return (
                  <div key={c.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                    <WarriorCard warrior={toWarrior(c)} selected={idx !== -1} selectedIndex={idx === -1 ? undefined : idx} onClick={() => toggle(c.id)} />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </GameLayout>
  );
}
