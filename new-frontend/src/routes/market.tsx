import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { GameLayout } from "@/components/game/GameLayout";
import { PageHeader } from "@/components/game/PageHeader";
import { ElementBadge } from "@/components/game/ElementBadge";
import { StatBar } from "@/components/game/StatBar";
import { RARITY_TOKEN } from "@/lib/game-data";
import {
  recruitTemplates,
  premiumPointsPrice,
  ctsiPrice,
  cooldownRemaining,
  fetchPlayerCharacters,
  fetchListings,
  type MarketCharacter,
} from "@/lib/cartesi/market";
import { CHARM_EMOJI } from "@/lib/cartesi/game-types";
import { useMarketInfo, useListings, useCharmCatalog, usePlayerCharacters } from "@/hooks/game";
import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { useSendInput } from "@/hooks/useSendInput";
import { toWarrior } from "@/lib/game/warrior-adapter";

const TABS = ["Recruit New", "Trade", "Battle Charms", "My Listings"] as const;

export default function Market() {
  useDocumentTitle("Marketplace — Nebula Duel");
  const [tab, setTab] = useState<(typeof TABS)[number]>("Recruit New");
  const { address, isConnected, connect } = useWallet();
  const { profile } = useProfile();
  const { data: info } = useMarketInfo(address);
  const { send, pending } = useSendInput();

  const points = Number(profile?.points ?? 0);
  const ctsi = Number(profile?.cartesi_token_balance ?? 0);
  const cooldown = cooldownRemaining(info ?? null);

  const starterClaimed = info?.starter_team_claimed ?? false;

  const recruit = async (characterId: number, currency: "points" | "ctsi") => {
    if (!address) return;
    const before = (await fetchPlayerCharacters(address)).length;
    return send(
      "purchase_single_character",
      { character_id: characterId, currency },
      {
        pendingMsg: "Recruiting warrior…",
        successMsg: "Warrior recruited!",
        invalidate: ["players_characters", "market_info"],
        verify: {
          label: "Confirming new warrior in your roster…",
          check: () => fetchPlayerCharacters(address),
          until: (chars: any) => Array.isArray(chars) && chars.length > before,
        },
      },
    );
  };

  const listCharacter = (characterId: number, price: number) =>
    send(
      "list_character",
      { character_id: characterId, price },
      {
        pendingMsg: "Listing warrior…",
        successMsg: "Warrior listed for sale!",
        invalidate: ["listed_characters", "players_characters"],
        verify: {
          label: "Confirming your listing…",
          check: () => fetchListings(),
          until: (ls: any) =>
            Array.isArray(ls) && ls.some((l: any) => Number(l.character_id) === characterId),
        },
      },
    );

  const claimStarterTeam = async (ids: number[]) => {
    if (!address) return;
    const before = (await fetchPlayerCharacters(address)).length;
    return send(
      "purchase_team",
      { char_id1: ids[0], char_id2: ids[1], char_id3: ids[2] },
      {
        pendingMsg: "Claiming starter team…",
        successMsg: "Starter team claimed!",
        invalidate: ["players_characters", "market_info"],
        verify: {
          label: "Confirming your 3 warriors…",
          check: () => fetchPlayerCharacters(address),
          until: (chars: any) => Array.isArray(chars) && chars.length >= before + 3,
        },
      },
    );
  };

  return (
    <GameLayout>
      <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-12">
        <PageHeader
          eyebrow="The Proving Grounds"
          title="Open"
          accent="Market"
          blurb="Recruit new warriors with points or CTSI. Trade with other commanders. Equip one-battle charms to swing a fight."
          right={
            <div className="flex gap-3">
              <div className="glass-panel clip-chrome-sm px-4 py-3">
                <div className="text-[9px] font-mono-display text-muted-foreground uppercase">Points</div>
                <div className="font-display text-lg text-primary">{points.toLocaleString()}</div>
              </div>
              <div className="glass-panel clip-chrome-sm px-4 py-3">
                <div className="text-[9px] font-mono-display text-muted-foreground uppercase">CTSI</div>
                <div className="font-display text-lg text-storm">{ctsi.toLocaleString()}</div>
              </div>
            </div>
          }
        />

        {!isConnected && (
          <div className="glass-panel clip-chrome-sm p-4 mb-6 flex items-center justify-between">
            <span className="font-mono-display text-xs uppercase tracking-widest text-muted-foreground">
              Connect a wallet to recruit, trade and equip.
            </span>
            <button onClick={connect} className="px-4 py-2 bg-primary text-primary-foreground font-display text-xs uppercase tracking-widest clip-chrome-sm">
              Connect
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 font-display text-xs uppercase tracking-widest clip-chrome-sm transition ${tab === t ? "bg-primary text-primary-foreground" : "bg-panel-2/60 border border-foreground/10 text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Notice */}
        <div className="glass-panel clip-chrome-sm p-4 mb-8 flex flex-wrap gap-x-8 gap-y-2 text-xs">
          <div><span className="text-storm">◆ CTSI Price</span> <span className="text-muted-foreground">fixed — pay with deposited tokens, no limits.</span></div>
          <div><span className="text-primary">◆ Points Price</span> <span className="text-muted-foreground">rises {info?.point_mint_premium_pct_per_purchase ?? 15}% with every recruit. {Math.round((info?.point_mint_cooldown_secs ?? 21600) / 3600)}h cooldown.</span></div>
          <div className="ml-auto text-muted-foreground">Platform fee · <span className="text-foreground">{((info?.marketplace_fee_bps ?? 300) / 100).toFixed(0)}%</span></div>
        </div>

        {cooldown > 0 && tab === "Recruit New" && (
          <div className="mb-4 font-mono-display text-[11px] uppercase tracking-widest text-storm">
            Points-mint cooldown · {Math.ceil(cooldown / 60)} min remaining (CTSI still available)
          </div>
        )}

        {tab === "Recruit New" && (
          isConnected && !starterClaimed ? (
            <StarterTeam points={points} onClaim={claimStarterTeam} pending={pending} />
          ) : (
            <RecruitGrid info={info} points={points} ctsi={ctsi} onBuy={recruit} pending={pending} canPoints={isConnected && cooldown === 0} canCtsi={isConnected} />
          )
        )}
        {tab === "Trade" && <TradeTab onBuy={(id) => send("buy_character", { character_id: id }, { pendingMsg: "Buying…", successMsg: "Purchased!", invalidate: ["listed_characters", "players_characters"] })} disabled={!isConnected || pending} />}
        {tab === "Battle Charms" && (
          <CharmsTab
            inventory={info?.charm_inventory ?? []}
            onBuy={(id) => send("buy_charm", { charm_id: id, quantity: 1, currency: "points" }, { pendingMsg: "Buying charm…", successMsg: "Charm acquired!", invalidate: ["market_info"] })}
            disabled={!isConnected || pending}
          />
        )}
        {tab === "My Listings" && (
          <MyListings
            address={address}
            onList={listCharacter}
            onDelist={(id) => send("delist_character", { character_id: id }, { pendingMsg: "Delisting…", successMsg: "Delisted", invalidate: ["listed_characters", "players_characters"] })}
            disabled={!isConnected || pending}
          />
        )}
      </div>
    </GameLayout>
  );
}

function RecruitGrid({
  info, points, ctsi, onBuy, pending, canPoints, canCtsi,
}: {
  info: ReturnType<typeof useMarketInfo>["data"];
  points: number;
  ctsi: number;
  onBuy: (id: number, c: "points" | "ctsi") => void;
  pending: boolean;
  canPoints: boolean;
  canCtsi: boolean;
}) {
  const templates = recruitTemplates();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {templates.map((c, i) => {
        const pts = premiumPointsPrice(info ?? null, c.price);
        const eth = ctsiPrice(info ?? null, c.price);
        const w = toWarrior(c);
        const affordPts = points >= pts;
        const affordCtsi = ctsi >= eth;
        return (
          <div key={c.id} className="glass-panel clip-chrome p-1 group hover:-translate-y-1 transition-transform animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="relative aspect-[3/4] overflow-hidden bg-panel-2">
              <img src={c.img} alt={c.name} className="size-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent" />
              <div className="absolute top-2 right-2"><ElementBadge element={c.element} /></div>
              <span className="absolute top-2 left-2 text-[9px] font-mono-display uppercase px-2 py-0.5 bg-background/70 backdrop-blur" style={{ color: `var(--color-${RARITY_TOKEN[w.rarity]})` }}>{w.rarity}</span>
            </div>
            <div className="p-3 space-y-3">
              <div>
                <h3 className="font-display text-base uppercase tracking-tight truncate">{c.name}</h3>
                <p className="text-[10px] font-mono-display text-muted-foreground truncate">{c.super_power}</p>
              </div>
              <div className="space-y-1.5">
                <StatBar stat="hp" value={c.health} />
                <StatBar stat="atk" value={c.attack} />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  disabled={!canPoints || pending || !affordPts}
                  onClick={() => onBuy(c.id, "points")}
                  title={!affordPts ? `Need ${pts - points} more points` : undefined}
                  className="py-2 border border-primary/50 text-primary font-display text-[10px] uppercase tracking-widest clip-chrome-sm hover:bg-primary/10 disabled:opacity-40 disabled:line-through"
                >
                  {pts} <span className="opacity-60">PTS</span>
                </button>
                <button
                  disabled={!canCtsi || pending || !affordCtsi}
                  onClick={() => onBuy(c.id, "ctsi")}
                  title={!affordCtsi ? `Need ${(eth - ctsi).toFixed(2)} more CTSI` : undefined}
                  className="py-2 border border-storm/50 text-storm font-display text-[10px] uppercase tracking-widest clip-chrome-sm hover:bg-storm/10 disabled:opacity-40 disabled:line-through"
                >
                  {eth.toFixed(2)} <span className="opacity-60">CTSI</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * New-player onboarding: claim a one-time 3-warrior starter team at base price
 * (backend purchase_team). Calculates the running total vs the player's points
 * and blocks the claim when the selection is unaffordable.
 */
function StarterTeam({
  points, onClaim, pending,
}: {
  points: number;
  onClaim: (ids: number[]) => void;
  pending: boolean;
}) {
  const templates = recruitTemplates();
  const [selected, setSelected] = useState<number[]>([]);

  const priceOf = (id: number) => templates.find((t) => t.id === id)?.price ?? 0;
  const total = selected.reduce((sum, id) => sum + priceOf(id), 0);
  const affordable = total <= points;
  const ready = selected.length === 3 && affordable;

  // Cheapest possible team so a new player knows a claim is achievable.
  const cheapest3 = [...templates].sort((a, b) => a.price - b.price).slice(0, 3);
  const cheapestTotal = cheapest3.reduce((s, t) => s + t.price, 0);

  const toggle = (id: number) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s));

  return (
    <div className="space-y-6">
      {/* banner */}
      <div className="glass-panel clip-bevel p-5 border-l-2 border-primary">
        <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase mb-1">// FIRST DEPLOYMENT</div>
        <h2 className="font-display text-2xl italic uppercase tracking-tight">Claim Your Starter Team</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-prose">
          Pick <span className="text-primary">exactly 3</span> warriors — your one-time starter squad at base price (no premium). You need three to enter a duel or campaign, so choose a team you can afford.
          {points < cheapestTotal && (
            <span className="block text-storm mt-1">
              The cheapest possible team costs {cheapestTotal} pts — you have {points}. Earn points from the daily reward to afford a squad.
            </span>
          )}
        </p>
      </div>

      {/* running total HUD (sticky) */}
      <div className="glass-hud clip-chrome p-4 flex flex-wrap items-center gap-x-8 gap-y-2 sticky top-24 z-30">
        <div>
          <div className="text-[9px] font-mono-display uppercase tracking-widest text-muted-foreground">Selected · {selected.length}/3</div>
          <div className={`font-display text-2xl ${affordable ? "text-primary text-glow" : "text-destructive"}`}>{total.toLocaleString()} <span className="text-xs text-foreground/60">PTS</span></div>
        </div>
        <div>
          <div className="text-[9px] font-mono-display uppercase tracking-widest text-muted-foreground">Your Balance</div>
          <div className="font-display text-2xl">{points.toLocaleString()} <span className="text-xs text-foreground/60">PTS</span></div>
        </div>
        <div className="min-w-[120px]">
          <div className="text-[9px] font-mono-display uppercase tracking-widest text-muted-foreground">Remaining</div>
          <div className={`font-display text-2xl ${affordable ? "text-nature" : "text-destructive"}`}>{(points - total).toLocaleString()}</div>
        </div>
        <button
          onClick={() => onClaim(selected)}
          disabled={!ready || pending}
          title={!affordable ? `Over budget by ${total - points} points` : selected.length !== 3 ? "Select exactly 3" : undefined}
          className="ml-auto px-8 py-3 bg-primary text-primary-foreground font-display uppercase tracking-widest text-sm clip-chrome-sm glow-cyan-sm hover:brightness-110 transition disabled:opacity-40 disabled:pointer-events-none"
        >
          {pending ? "Claiming…" : selected.length !== 3 ? `Select ${3 - selected.length} more` : !affordable ? `Over by ${total - points} pts` : `Claim Team · ${total} pts`}
        </button>
      </div>

      {/* selectable roster */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((c, i) => {
          const idx = selected.indexOf(c.id);
          const isSelected = idx !== -1;
          // A card you can't add without busting the budget (and isn't already picked).
          const wouldBust = !isSelected && selected.length < 3 && total + c.price > points;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              className={`relative text-left glass-panel clip-chrome p-1 transition-all animate-fade-up ${isSelected ? "ring-2 ring-primary glow-cyan-sm" : wouldBust ? "opacity-50" : "hover:-translate-y-1"}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {isSelected && <div className="absolute top-2 left-2 z-20 size-6 grid place-items-center bg-primary text-primary-foreground font-display text-xs">{idx + 1}</div>}
              <div className="relative aspect-[3/4] overflow-hidden bg-panel-2">
                <img src={c.img} alt={c.name} className="size-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent" />
                <div className="absolute top-2 right-2"><ElementBadge element={c.element} /></div>
              </div>
              <div className="p-3 space-y-2">
                <h3 className="font-display text-base uppercase tracking-tight truncate">{c.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono-display text-muted-foreground truncate">{c.super_power}</span>
                  <span className={`font-display text-sm ${wouldBust ? "text-destructive" : "text-primary"}`}>{c.price} pts</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TradeTab({ onBuy, disabled }: { onBuy: (id: number) => void; disabled: boolean }) {
  const { data: listings, isLoading } = useListings();
  if (isLoading) return <Loading label="Loading listings…" />;
  if (!listings?.length) return <Empty label="No characters are listed for sale right now." />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {listings.map((l) => (
        <div key={l.character_id} className="glass-panel clip-chrome p-1">
          <div className="relative aspect-[3/4] overflow-hidden bg-panel-2">
            {l.character?.img && <img src={l.character.img} alt={l.character?.name} className="size-full object-cover" loading="lazy" />}
            {l.character && <div className="absolute top-2 right-2"><ElementBadge element={l.character.element} /></div>}
          </div>
          <div className="p-3 space-y-2">
            <h3 className="font-display text-base uppercase truncate">{l.character?.name ?? `#${l.character_id}`}</h3>
            <div className="font-mono-display text-[10px] text-muted-foreground truncate">Seller {l.seller.slice(0, 6)}…</div>
            <button disabled={disabled} onClick={() => onBuy(l.character_id)} className="w-full py-2 bg-primary text-primary-foreground font-display text-xs uppercase tracking-widest clip-chrome-sm hover:brightness-110 disabled:opacity-40">
              Buy · {l.price} CTSI
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CharmsTab({
  inventory, onBuy, disabled,
}: {
  inventory: { charm_id: number; count: number }[];
  onBuy: (id: number) => void;
  disabled: boolean;
}) {
  const { data: charms, isLoading } = useCharmCatalog();
  const ownedOf = (id: number) => inventory.find((e) => e.charm_id === id)?.count ?? 0;
  const totalOwned = inventory.reduce((s, e) => s + e.count, 0);
  if (isLoading) return <Loading label="Loading charms…" />;
  if (!charms?.length) return <Empty label="No charms available." />;
  return (
    <div className="space-y-4">
      <div className="glass-hud clip-chrome-sm p-3 font-mono-display text-[11px] uppercase tracking-widest text-muted-foreground">
        Your inventory · <span className="text-primary">{totalOwned}</span> charm{totalOwned === 1 ? "" : "s"} held · take up to <span className="text-primary">2</span> into a campaign battle
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {charms.map((c) => {
          const owned = ownedOf(c.id);
          return (
            <div key={c.id} className="glass-panel clip-chrome p-5 flex gap-4 items-start">
              <div className="relative size-14 grid place-items-center text-3xl bg-panel-2 clip-chrome-sm shrink-0">
                {CHARM_EMOJI[c.id] ?? "✨"}
                {owned > 0 && (
                  <span className="absolute -top-2 -right-2 size-6 grid place-items-center bg-primary text-primary-foreground font-display text-[11px] clip-chrome-sm">×{owned}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg uppercase tracking-tight">{c.name}</h3>
                  <span className="font-mono-display text-[9px] uppercase tracking-widest text-muted-foreground">{owned}/{c.max_hold} held</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-3">{c.description}</p>
                <button disabled={disabled || owned >= c.max_hold} onClick={() => onBuy(c.id)} title={owned >= c.max_hold ? "At max hold" : undefined} className="px-4 py-2 border border-primary/50 text-primary font-display text-[10px] uppercase tracking-widest clip-chrome-sm hover:bg-primary/10 disabled:opacity-40">
                  {owned >= c.max_hold ? "Max held" : `Buy · ${c.cost_points} PTS`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MyListings({
  address, onList, onDelist, disabled,
}: {
  address: string | null;
  onList: (characterId: number, price: number) => void;
  onDelist: (id: number) => void;
  disabled: boolean;
}) {
  const { data: listings, isLoading } = useListings();
  const { data: owned, isLoading: ownedLoading } = usePlayerCharacters(address);
  if (!address) return <Empty label="Connect your wallet to list and manage your warriors." />;
  if (isLoading || ownedLoading) return <Loading label="Loading your roster & listings…" />;

  const mine = (listings ?? []).filter((l) => l.seller === address);
  const listedIds = new Set(mine.map((l) => l.character_id));
  // Warriors you own that aren't already on the market.
  const listable = (owned ?? []).filter((c) => !listedIds.has(c.id));

  return (
    <div className="space-y-10">
      <ListWarriorPanel listable={listable} onList={onList} disabled={disabled} />

      <div>
        <h3 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3">
          Active Listings · <span className="text-primary">{mine.length}</span>
        </h3>
        {mine.length === 0 ? (
          <Empty label="You have no active listings. List a warrior above to put it up for sale." />
        ) : (
          <div className="glass-panel clip-chrome p-2">
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 border-b border-primary/10 font-mono-display text-[10px] text-muted-foreground uppercase tracking-widest">
              <span>Warrior</span><span>Price</span><span>Action</span>
            </div>
            {mine.map((l) => (
              <div key={l.character_id} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-4 py-3 border-b border-foreground/5 font-mono-display text-xs">
                <span className="text-foreground truncate">{l.character?.name ?? `#${l.character_id}`}</span>
                <span className="text-primary">{l.price} CTSI</span>
                <button disabled={disabled} onClick={() => onDelist(l.character_id)} className="px-3 py-1.5 border border-destructive/40 text-destructive text-[10px] uppercase tracking-widest hover:bg-destructive/10 clip-chrome-sm disabled:opacity-40">
                  Delist
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * List-a-warrior panel: shows every warrior the player owns that isn't already
 * on the market, each with a CTSI price field + List button (backend
 * `list_character`). A warrior locked in an active duel is rejected on-chain;
 * we surface that as a toast rather than pre-filtering (duel locks aren't in the
 * roster read).
 */
function ListWarriorPanel({
  listable, onList, disabled,
}: {
  listable: MarketCharacter[];
  onList: (characterId: number, price: number) => void;
  disabled: boolean;
}) {
  const [prices, setPrices] = useState<Record<number, string>>({});

  return (
    <div>
      <h3 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-1">List a Warrior for Sale</h3>
      <p className="text-[11px] text-muted-foreground mb-4 max-w-prose">
        Set a CTSI price and put one of your warriors on the open market. Buyers pay from their deposited CTSI and you receive the sale minus the platform fee. A warrior fighting in an active duel can’t be listed.
      </p>
      {listable.length === 0 ? (
        <Empty label="No warriors available to list — every one you own is already on the market, or your roster is empty." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {listable.map((c) => {
            const raw = prices[c.id] ?? "";
            const price = Math.floor(Number(raw));
            const valid = raw.trim() !== "" && Number.isFinite(price) && price > 0;
            return (
              <div key={c.id} className="glass-panel clip-chrome p-1">
                <div className="relative aspect-[3/4] overflow-hidden bg-panel-2">
                  {c.img && <img src={c.img} alt={c.name} className="size-full object-cover" loading="lazy" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent" />
                  <div className="absolute top-2 right-2"><ElementBadge element={c.element} /></div>
                  <span className="absolute top-2 left-2 text-[9px] font-mono-display uppercase px-2 py-0.5 bg-background/70 backdrop-blur text-muted-foreground">#{c.id}</span>
                </div>
                <div className="p-3 space-y-2.5">
                  <div>
                    <h3 className="font-display text-base uppercase tracking-tight truncate">{c.name}</h3>
                    <p className="text-[10px] font-mono-display text-muted-foreground truncate">{c.super_power}</p>
                  </div>
                  <div className="space-y-1.5">
                    <StatBar stat="hp" value={c.health} />
                    <StatBar stat="atk" value={c.attack} />
                  </div>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    value={raw}
                    disabled={disabled}
                    onChange={(e) => setPrices((p) => ({ ...p, [c.id]: e.target.value }))}
                    placeholder="Price in CTSI"
                    className="w-full bg-panel-2/70 border border-foreground/15 focus:border-storm/60 outline-none px-2.5 py-2 font-mono-display text-xs text-foreground clip-chrome-sm placeholder:text-muted-foreground/60"
                  />
                  <button
                    disabled={disabled || !valid}
                    onClick={() => onList(c.id, price)}
                    title={!valid ? "Enter a price above 0" : undefined}
                    className="w-full py-2 bg-storm text-background font-display text-[10px] uppercase tracking-widest clip-chrome-sm hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {valid ? `List · ${price} CTSI` : "Set a price"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <div className="glass-panel clip-chrome p-12 grid place-items-center">
      <div className="flex items-center gap-3 font-mono-display text-[11px] uppercase tracking-widest text-muted-foreground">
        <span className="size-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /> {label}
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="glass-panel clip-chrome p-12 text-center font-mono-display text-xs uppercase tracking-widest text-muted-foreground">
      {label}
    </div>
  );
}
