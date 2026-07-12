import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { GameLayout } from "@/components/game/GameLayout";
import { PageHeader } from "@/components/game/PageHeader";
import { WarriorCard } from "@/components/game/WarriorCard";
import {
  STRATEGIES,
  CHARM_EMOJI,
  fetchLatestBattleReport,
  fetchDuelBattleReport,
} from "@/lib/cartesi/game-types";
import { fetchDuels } from "@/lib/cartesi/duels";
import { toWarrior } from "@/lib/game/warrior-adapter";
import { usePlayerCharacters, useMarketInfo } from "@/hooks/game";
import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { useSendInput } from "@/hooks/useSendInput";

const STRATS = STRATEGIES; // all 6 backend strategies (ids 1-6)

function charFields(ids: number[]) {
  return { char_id1: ids[0], char_id2: ids[1], char_id3: ids[2] };
}

export default function CreateDuel() {
  useDocumentTitle("Create Duel — Nebula Duel");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const campaignLevel = params.get("mode") === "campaign" ? Number(params.get("level")) : null;
  const isCampaign = campaignLevel != null && !Number.isNaN(campaignLevel);

  const { address, isConnected, connect } = useWallet();
  const { profile } = useProfile();
  const { data: roster, isLoading } = usePlayerCharacters(address);
  const { data: marketInfo } = useMarketInfo(address);
  const ownedCharms = (marketInfo?.charm_inventory ?? []).filter((e) => e.count > 0);
  const { send, pending } = useSendInput();

  const [selected, setSelected] = useState<number[]>([]); // owned character instance ids
  const [strategy, setStrategy] = useState(STRATS[1]?.id ?? 2);
  const [opponent, setOpponent] = useState<"pvp" | "ai">("pvp");
  const [difficulty, setDifficulty] = useState<1 | 2>(2); // 1 easy, 2 hard
  const [stake, setStake] = useState(0);
  const [charms, setCharms] = useState<number[]>([]); // selected charm ids (max 2, campaign only)

  const toggle = (id: number) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s));
  const toggleCharm = (id: number) =>
    setCharms((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 2 ? [...c, id] : c));

  const ctsi = Number(profile?.cartesi_token_balance ?? 0);
  const stakeOk = isCampaign || opponent !== "pvp" || stake === 0 || stake <= ctsi;
  const ready = selected.length === 3 && isConnected && !pending && stakeOk;

  const submit = async () => {
    if (selected.length !== 3 || !address) return;
    const ids = charFields(selected);
    try {
      if (isCampaign) {
        const charmFields: Record<string, number> = {};
        if (charms[0]) charmFields.charm_id1 = charms[0];
        if (charms[1]) charmFields.charm_id2 = charms[1];
        await send("play_campaign_level", { level_id: campaignLevel, ...ids, strategy_id: strategy, ...charmFields }, {
          pendingMsg: "Marching on the level…",
          successMsg: "Battle resolved!",
          invalidate: ["campaign", "players_characters"],
          // Don't open the 3D replay until the battle report actually exists.
          verify: {
            label: "Resolving the battle…",
            check: () => fetchLatestBattleReport(address, campaignLevel!),
            until: (r: any) => !!r,
          },
        });
        navigate(`/replay?mode=campaign&level=${campaignLevel}&wallet=${address}`);
      } else if (opponent === "ai") {
        const beforeDuels = (await fetchDuels("duels")).length;
        await send("create_ai_duel", { ...ids, difficulty_id: difficulty }, {
          pendingMsg: "Summoning AI challenger…",
          successMsg: "AI duel created",
          invalidate: ["duels"],
          verify: {
            label: "Creating duel…",
            check: () => fetchDuels("duels"),
            until: (d: any) => Array.isArray(d) && d.length > beforeDuels,
          },
        });
        const duelId = await latestDuelId(address);
        if (duelId != null) {
          await send("select_ai_battle_strategy", { strategy_id: strategy, duel_id: duelId }, {
            pendingMsg: "Resolving duel…",
            successMsg: "Duel resolved!",
            invalidate: ["duels", "pvp_leaderboard"],
            // Replay needs the duel's battle_events to be present.
            verify: {
              label: "Resolving the battle…",
              check: () => fetchDuelBattleReport(duelId),
              until: (r: any) => !!r,
            },
          });
          navigate(`/replay?duel=${duelId}`);
        } else {
          toast.error("Couldn't find the new AI duel to resolve — please try again.");
          navigate("/duels");
        }
      } else {
        const beforeDuels = (await fetchDuels("duels")).length;
        await send("create_duel", { ...ids, has_staked: stake > 0, stake_amount: stake }, {
          pendingMsg: "Opening challenge…",
          successMsg: "Duel created — waiting for an opponent",
          invalidate: ["available_duels", "duels"],
          verify: {
            label: "Publishing your challenge…",
            check: () => fetchDuels("duels"),
            until: (d: any) => Array.isArray(d) && d.length > beforeDuels,
          },
        });
        navigate("/duels");
      }
    } catch (e: any) {
      // send() already toasts (and rejects with) the backend's reason; only
      // surface anything else so failures are never silent.
      if (!e?.toasted) {
        console.error("Duel submit failed:", e);
        toast.error(e?.message ?? "Something went wrong starting the duel.");
      }
    }
  };

  return (
    <GameLayout>
      <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-10">
        <PageHeader
          eyebrow={isCampaign ? `// CAMPAIGN · LEVEL ${campaignLevel}` : "// SQUAD DEPLOYMENT"}
          title="Choose Your"
          accent="Warriors"
          blurb="Select three warriors to deploy. Each adds their element, super power, and stats to the squad. Tap to add or remove."
        />

        <div className="grid lg:grid-cols-[1.55fr_1fr] gap-6">
          {/* LEFT — your collection */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-mono-display uppercase tracking-widest clip-chrome-sm">Owned · {roster?.length ?? 0}</span>
              <span className="ml-auto font-mono-display text-[10px] text-muted-foreground uppercase">// TAP TO DEPLOY</span>
            </div>

            {!isConnected ? (
              <div className="glass-panel clip-chrome p-12 text-center">
                <p className="font-mono-display text-xs uppercase tracking-widest text-muted-foreground mb-4">Connect a wallet to deploy your roster.</p>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {roster.map((c, i) => {
                  const idx = selected.indexOf(c.id);
                  return (
                    <div key={c.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                      <WarriorCard warrior={toWarrior(c)} selected={idx !== -1} selectedIndex={idx === -1 ? undefined : idx} onClick={() => toggle(c.id)} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT — deployment */}
          <div className="space-y-6 lg:sticky lg:top-24 self-start">
            <div className="glass-panel clip-chrome p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl italic uppercase text-primary">Squad · {selected.length}/3</h2>
                {selected.length > 0 && (
                  <button onClick={() => setSelected([])} className="text-[10px] font-mono-display text-muted-foreground hover:text-destructive uppercase tracking-widest">Clear</button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((slot) => {
                  const c = selected[slot] != null ? roster?.find((x) => x.id === selected[slot]) : null;
                  return (
                    <div key={slot} className={`relative aspect-[3/4] bg-panel-2 border ${c ? "border-primary glow-cyan-sm" : "border-dashed border-foreground/15"} clip-chrome-sm overflow-hidden`}>
                      {c ? (
                        <>
                          <img src={c.img} alt={c.name} className="size-full object-cover" loading="lazy" />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-2">
                            <div className="font-display text-xs uppercase truncate">{c.name}</div>
                          </div>
                          <div className="absolute top-1 right-1 size-5 grid place-items-center bg-primary text-primary-foreground font-display text-xs">{slot + 1}</div>
                        </>
                      ) : (
                        <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                          <div className="text-center">
                            <div className="font-display text-2xl text-foreground/20">{slot + 1}</div>
                            <div className="text-[9px] font-mono-display uppercase tracking-widest">Slot</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-panel clip-chrome p-5">
              <h2 className="font-display text-xl italic uppercase mb-4 text-primary">Battle Strategy</h2>
              <div className="space-y-2">
                {STRATS.map((s) => {
                  const active = strategy === s.id;
                  return (
                    <button key={s.id} type="button" onClick={() => setStrategy(s.id)} className={`w-full text-left p-3 flex items-center gap-3 transition-all ${active ? "border border-primary bg-primary/5" : "border border-foreground/10 hover:border-foreground/30"}`}>
                      <div className={`size-9 grid place-items-center font-display ${active ? "bg-primary text-primary-foreground" : "bg-foreground/10 text-foreground"}`}>{s.name[0]}</div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold uppercase tracking-wider">{s.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{s.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {isCampaign && (
              <div className="glass-panel clip-chrome p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-xl italic uppercase text-primary">Battle Charms</h2>
                  <span className="text-[10px] font-mono-display uppercase tracking-widest text-muted-foreground">{charms.length}/2</span>
                </div>
                {ownedCharms.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">
                    No charms in your inventory.{" "}
                    <Link to="/market" className="text-primary">Buy some in the market →</Link>
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {ownedCharms.map((e) => {
                      const active = charms.includes(e.charm_id);
                      return (
                        <button
                          key={e.charm_id}
                          type="button"
                          onClick={() => toggleCharm(e.charm_id)}
                          className={`flex items-center gap-2 p-2 transition-all clip-chrome-sm ${active ? "border border-primary bg-primary/5" : "border border-foreground/10 hover:border-foreground/30"}`}
                        >
                          <span className="text-xl shrink-0">{CHARM_EMOJI[e.charm_id] ?? "✨"}</span>
                          <span className="min-w-0 text-left">
                            <span className="block text-[11px] font-bold uppercase tracking-wide truncate">{e.name ?? `Charm ${e.charm_id}`}</span>
                            <span className="block text-[9px] font-mono-display text-muted-foreground">×{e.count} held</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {!isCampaign && (
              <div className="glass-panel clip-chrome p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-mono-display text-[10px] uppercase tracking-widest text-muted-foreground">Available Balance</h3>
                  <span className="font-display text-primary text-lg">{ctsi.toLocaleString()} CTSI</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] font-mono-display uppercase tracking-widest text-muted-foreground mb-2">Opponent</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(["pvp", "ai"] as const).map((o) => (
                        <button key={o} onClick={() => setOpponent(o)} className={`py-2 font-display uppercase text-sm tracking-widest ${opponent === o ? "bg-primary text-primary-foreground" : "border border-foreground/15 text-foreground/70 hover:border-primary/40"}`}>
                          {o === "pvp" ? "Player" : "AI"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {opponent === "ai" ? (
                    <div>
                      <div className="text-[10px] font-mono-display uppercase tracking-widest text-muted-foreground mb-2">Difficulty</div>
                      <div className="grid grid-cols-2 gap-2">
                        {([[1, "Easy"], [2, "Hard"]] as const).map(([d, label]) => (
                          <button key={d} onClick={() => setDifficulty(d)} className={`py-2 font-display uppercase text-sm tracking-widest ${difficulty === d ? "bg-primary text-primary-foreground" : "border border-foreground/15 text-foreground/70 hover:border-primary/40"}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between text-[10px] font-mono-display uppercase tracking-widest text-muted-foreground mb-2">
                        <span>Stake</span><span className={stakeOk ? "text-primary" : "text-destructive"}>{stake} CTSI</span>
                      </div>
                      <input type="range" min={0} max={100} value={stake} onChange={(e) => setStake(Number(e.target.value))} className="w-full accent-primary" />
                      {!stakeOk && (
                        <div className="mt-1 font-mono-display text-[9px] uppercase tracking-widest text-destructive">
                          Stake exceeds your CTSI balance ({ctsi.toLocaleString()})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={submit}
              disabled={!ready}
              className={`block text-center w-full py-5 font-display text-2xl uppercase tracking-widest italic clip-chrome transition-all ${ready ? "bg-primary text-primary-foreground glow-cyan-sm hover:brightness-110 hover:scale-[1.01] active:scale-95" : "bg-foreground/10 text-muted-foreground pointer-events-none"}`}
            >
              {pending ? "Working…" : selected.length !== 3 ? `Select ${3 - selected.length} More` : !stakeOk ? "Insufficient CTSI" : isCampaign ? "Begin Battle →" : opponent === "ai" ? "Fight AI →" : "Initiate Duel →"}
              <span className="block text-[9px] font-mono-display font-normal tracking-normal mt-1 opacity-70">
                {selected.length === 3 ? ">> READY FOR ENGAGEMENT" : ">> SQUAD INCOMPLETE"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}

/** Most-recent duel id created by a wallet (for chaining AI duel resolution). */
async function latestDuelId(creator: string): Promise<number | null> {
  const duels = await fetchDuels("duels");
  const mine = duels
    .filter((d) => (d.duel_creator ?? "").toLowerCase() === creator.toLowerCase())
    .map((d) => Number(d.id))
    .filter((id) => Number.isFinite(id) && id > 0);
  return mine.length ? Math.max(...mine) : null;
}
