/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "sonner";
import signMessages from "../../utils/relayTransaction";
import readGameState from "../../utils/readState";
import audio from "../../utils/audio";
import StatBars from "../shared/StatBars";
import {
  ELEMENT_META,
  fetchCharmCatalog,
  CharmDef,
  CHARM_EMOJI,
} from "../../utils/campaign";
import {
  fetchListings,
  fetchAllCharacters,
  fetchMarketInfo,
  recruitTemplates,
  premiumPointsPrice,
  ctsiPrice,
  cooldownRemaining,
  Listing,
  MarketCharacter,
  MarketInfo,
} from "../../utils/marketplace";

type Tab = "trade" | "recruit" | "charms" | "mine";

const shortAddr = (a: string) =>
  a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;

const fmtSecs = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.ceil((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const Market = () => {
  const account = useActiveAccount();
  const wallet = account?.address?.toLowerCase();

  const [tab, setTab] = useState<Tab>("trade");
  const [listings, setListings] = useState<Listing[]>([]);
  const [owned, setOwned] = useState<MarketCharacter[]>([]);
  const [charms, setCharms] = useState<CharmDef[]>([]);
  const [info, setInfo] = useState<MarketInfo | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // listing modal state
  const [listTarget, setListTarget] = useState<MarketCharacter | null>(null);
  const [listPrice, setListPrice] = useState("");

  const refresh = useCallback(async () => {
    const [ls, chars, mi, charmCatalog] = await Promise.all([
      fetchListings(),
      fetchAllCharacters(),
      fetchMarketInfo(wallet),
      fetchCharmCatalog(),
    ]);
    setListings(ls);
    setInfo(mi);
    setCharms(charmCatalog);
    if (wallet) {
      setOwned(chars.filter((c) => c.owner === wallet));
      const prof = await readGameState(`profile/${wallet}`);
      if (prof.Status) setProfile(prof.request_payload);
    } else {
      setOwned([]);
      setProfile(null);
    }
  }, [wallet]);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  // live cooldown ticker
  useEffect(() => {
    const tick = () => setCooldown(cooldownRemaining(info));
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, [info]);

  const feePct = info ? info.marketplace_fee_bps / 100 : 3;
  const listedIds = useMemo(
    () => new Set(listings.map((l) => l.character_id)),
    [listings],
  );
  const myListings = listings.filter((l) => l.seller === wallet);
  const openListings = listings.filter((l) => l.seller !== wallet);

  const requireWallet = (): boolean => {
    if (!wallet) {
      toast.error("Connect your wallet first.", { position: "top-right" });
      return false;
    }
    return true;
  };

  const send = async (label: string, payload: any, key: number) => {
    audio.play("click");
    setBusyId(key);
    try {
      await signMessages(payload);
      toast.success(label, { position: "top-right" });
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Transaction failed", { position: "top-right" });
    } finally {
      setBusyId(null);
    }
  };

  const buyListing = (l: Listing) => {
    if (!requireWallet()) return;
    if ((profile?.cartesi_token_balance ?? 0) < l.price) {
      toast.error(
        `You need ${l.price.toFixed(2)} CTSI deposited — manage funds in Assets Manager.`,
        { position: "top-right" },
      );
      return;
    }
    send(`Warrior purchased for ${l.price} CTSI!`, {
      func: "buy_character",
      character_id: l.character_id,
    }, l.character_id);
  };

  const recruit = (templateId: number, currency: "points" | "ctsi") => {
    if (!requireWallet()) return;
    send(
      currency === "points" ? "Recruited with battle points!" : "Recruited with CTSI!",
      {
        func: "purchase_single_character",
        character_id: templateId,
        currency,
      },
      templateId + 10_000,
    );
  };

  const submitListing = () => {
    if (!listTarget) return;
    const price = Number(listPrice);
    if (!price || price <= 0) {
      toast.error("Enter a valid CTSI price.", { position: "top-right" });
      return;
    }
    const target = listTarget;
    setListTarget(null);
    setListPrice("");
    send(`${target.name} listed for ${price} CTSI`, {
      func: "list_character",
      character_id: target.id,
      price,
    }, target.id);
  };

  const delist = (l: Listing) =>
    send("Listing removed.", {
      func: "delist_character",
      character_id: l.character_id,
    }, l.character_id);

  // ---------------------------------------------------------------------

  const StatLine = ({ c }: { c: MarketCharacter }) => (
    <div className="mt-1">
      <StatBars
        stats={{
          health: c.health,
          strength: c.strength,
          attack: c.attack,
          speed: c.speed,
        }}
      />
      {c.total_battles > 0 && (
        <p className="text-[10px] text-gray-500 font-poppins mt-1">
          Record: {c.total_wins}W / {c.total_losses}L
        </p>
      )}
    </div>
  );

  const ElementBadge = ({ c }: { c: MarketCharacter }) => {
    const meta = ELEMENT_META[c.element];
    return (
      <span
        className={`text-[10px] rounded-full px-2 py-0.5 ${meta.bg} ${meta.color}`}
        title={c.super_power}
      >
        {meta.emoji} {c.element}
      </span>
    );
  };

  const charmHeld = (charmId: number) =>
    info?.charm_inventory?.find((c) => c.charm_id === charmId)?.count ?? 0;

  const buyCharm = (charm: CharmDef, currency: "points" | "ctsi") => {
    if (!requireWallet()) return;
    send(
      `${charm.name} added to your satchel!`,
      { func: "buy_charm", charm_id: charm.id, quantity: 1, currency },
      charm.id + 20_000,
    );
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "trade", label: `Trade (${openListings.length})` },
    { key: "recruit", label: "Recruit new" },
    { key: "charms", label: "Battle charms" },
    { key: "mine", label: `My listings (${myListings.length})` },
  ];

  return (
    <section className="w-full py-10">
      {/* wallet summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                audio.play("click");
                setTab(t.key);
              }}
              className={`rounded-lg px-5 py-2.5 font-belanosima uppercase text-xs tracking-wider border transition-colors ${
                tab === t.key
                  ? "bg-myGreen text-navBg border-myGreen"
                  : "border-gray-700 text-gray-300 hover:border-myGreen hover:text-myGreen"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {profile && (
          <div className="flex gap-4 text-right">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-belanosima">
                Points
              </p>
              <p className="text-myGreen font-belanosima">{profile.points}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-belanosima">
                CTSI
              </p>
              <p className="text-myYellow font-belanosima">
                {Number(profile.cartesi_token_balance ?? 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-500 font-poppins mb-6">
        Platform fee on P2P sales: {feePct}% · Sellers receive{" "}
        {(100 - feePct).toFixed(1)}% of the sale price.
      </p>

      {loading ? (
        <p className="text-center text-myGreen font-belanosima animate-pulse py-16">
          Opening the bazaar…
        </p>
      ) : (
        <>
          {/* ------------------------------ TRADE ------------------------ */}
          {tab === "trade" &&
            (openListings.length === 0 ? (
              <p className="text-gray-500 font-poppins text-sm py-12 text-center">
                No warriors are listed right now. List one of yours from the
                "My listings" tab.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {openListings.map((l) => {
                  const c = l.character;
                  if (!c) return null;
                  return (
                    <div
                      key={l.character_id}
                      className="rounded-2xl border border-gray-800 bg-myBlack/80 overflow-hidden hover:border-myGreen/60 transition-colors lift"
                    >
                      <div className="card-media">
                        {c.img && <img src={c.img} alt={c.name} />}
                      </div>
                      <div className="p-3 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-belanosima text-white text-sm truncate">
                            {c.name}
                          </p>
                          <ElementBadge c={c} />
                        </div>
                        <StatLine c={c} />
                        <p className="text-[10px] text-gray-500 font-poppins">
                          Seller: {shortAddr(l.seller)}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <p className="font-belanosima text-myYellow">
                            {l.price} CTSI
                          </p>
                          <button
                            onClick={() => buyListing(l)}
                            disabled={busyId === l.character_id}
                            className="rounded-lg btn-glow font-belanosima uppercase text-xs px-4 py-2 disabled:opacity-50"
                          >
                            {busyId === l.character_id ? "Buying…" : "Buy"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

          {/* ------------------------------ RECRUIT ---------------------- */}
          {tab === "recruit" && (
            <>
              <div className="rounded-xl border border-gray-800 bg-myBlack/60 px-4 py-3 mb-6 text-[12px] font-poppins text-gray-400 space-y-1">
                <p>
                  💰 <b className="text-myYellow">CTSI price</b> is fixed — pay
                  with deposited tokens, no limits.
                </p>
                <p>
                  ⚔️ <b className="text-myGreen">Points price</b> rises{" "}
                  {info?.point_mint_premium_pct_per_purchase ?? 15}% with every
                  points recruit (your premium:{" "}
                  <b className="text-myGreen">
                    +
                    {Math.min(
                      (info?.point_purchase_count ?? 0) *
                        (info?.point_mint_premium_pct_per_purchase ?? 15),
                      info?.point_mint_premium_cap_pct ?? 300,
                    )}
                    %
                  </b>
                  ) and has a {fmtSecs(info?.point_mint_cooldown_secs ?? 21600)}{" "}
                  cooldown — battle glory can't be mass-produced.
                </p>
                {cooldown > 0 && (
                  <p className="text-myYellow">
                    ⏳ Points recruiting available again in {fmtSecs(cooldown)}.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recruitTemplates().map((c) => {
                  const pPoints = premiumPointsPrice(info, c.price);
                  const pCtsi = ctsiPrice(info, c.price);
                  const busy = busyId === c.id + 10_000;
                  return (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-gray-800 bg-myBlack/80 overflow-hidden hover:border-myGreen/60 transition-colors lift"
                    >
                      <div className="card-media">
                        {c.img && <img src={c.img} alt={c.name} />}
                      </div>
                      <div className="p-3 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-belanosima text-white text-sm truncate">
                            {c.name}
                          </p>
                          <ElementBadge c={c} />
                        </div>
                        <StatLine c={c} />
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => recruit(c.id, "points")}
                            disabled={busy || cooldown > 0}
                            title={
                              cooldown > 0
                                ? `Cooldown: ${fmtSecs(cooldown)}`
                                : undefined
                            }
                            className="rounded-lg border border-myGreen/60 text-myGreen font-belanosima text-[11px] uppercase px-2 py-2 hover:bg-myGreen hover:text-navBg disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {pPoints} pts
                          </button>
                          <button
                            onClick={() => recruit(c.id, "ctsi")}
                            disabled={busy}
                            className="rounded-lg border border-myYellow/60 text-myYellow font-belanosima text-[11px] uppercase px-2 py-2 hover:bg-myYellow hover:text-navBg disabled:opacity-40"
                          >
                            {pCtsi.toFixed(2)} CTSI
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ------------------------------ CHARMS ----------------------- */}
          {tab === "charms" && (
            <>
              <div className="rounded-xl border border-gray-800 bg-myBlack/60 px-4 py-3 mb-6 text-[12px] font-poppins text-gray-400 space-y-1">
                <p>
                  🧿 Charms are <b className="text-white">consumed by the battle</b>{" "}
                  that uses them — win or lose.
                </p>
                <p>
                  ⚖️ Carry at most <b className="text-myGreen">2 charms</b> into a
                  battle (no duplicates), and hold at most{" "}
                  <b className="text-myGreen">5 of each</b> — power can be bought,
                  but victories still have to be earned.
                </p>
              </div>
              {(!Array.isArray(charms) || charms.length === 0) && (
                <p className="text-gray-500 font-poppins text-sm py-8 text-center">
                  The charm catalog isn't available — make sure the backend was
                  rebuilt (`cartesi build`) and the node restarted.
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Array.isArray(charms) ? charms : []).map((c) => {
                  const held = charmHeld(c.id);
                  const full = held >= c.max_hold;
                  const busy = busyId === c.id + 20_000;
                  const meta = c.element ? ELEMENT_META[c.element] : null;
                  return (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-gray-800 bg-myBlack/80 p-4 hover:border-myGreen/60 transition-colors lift flex flex-col"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <p className="font-belanosima text-white">
                          {CHARM_EMOJI[c.id] ?? "🧿"} {c.name}
                        </p>
                        {meta ? (
                          <span className={`text-[10px] rounded-full px-2 py-0.5 ${meta.bg} ${meta.color}`}>
                            {meta.emoji} {c.element}
                          </span>
                        ) : (
                          <span className="text-[10px] rounded-full px-2 py-0.5 bg-gray-700/50 text-gray-300">
                            ✨ Universal
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 font-poppins leading-snug flex-1">
                        {c.description}
                      </p>
                      <p className={`text-[10px] font-belanosima mt-2 ${full ? "text-myYellow" : "text-gray-500"}`}>
                        Held: {held}/{c.max_hold}
                        {full && " — satchel full"}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={() => buyCharm(c, "points")}
                          disabled={busy || full}
                          className="rounded-lg border border-myGreen/60 text-myGreen font-belanosima text-[11px] uppercase px-2 py-2 hover:bg-myGreen hover:text-navBg disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {c.cost_points} pts
                        </button>
                        <button
                          onClick={() => buyCharm(c, "ctsi")}
                          disabled={busy || full}
                          className="rounded-lg border border-myYellow/60 text-myYellow font-belanosima text-[11px] uppercase px-2 py-2 hover:bg-myYellow hover:text-navBg disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {Number(c.cost_ctsi).toFixed(2)} CTSI
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ------------------------------ MY LISTINGS ------------------ */}
          {tab === "mine" && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="font-belanosima text-white uppercase tracking-wider text-sm mb-4">
                  Active listings
                </h3>
                {myListings.length === 0 ? (
                  <p className="text-gray-500 font-poppins text-sm">
                    You have no active listings.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {myListings.map((l) => (
                      <div
                        key={l.character_id}
                        className="rounded-xl border border-gray-800 bg-myBlack/80 px-4 py-3 flex items-center gap-3"
                      >
                        {l.character?.img && (
                          <img
                            src={l.character.img}
                            alt={l.character?.name}
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-belanosima text-white text-sm truncate">
                            {l.character?.name ?? `#${l.character_id}`}
                          </p>
                          <p className="text-myYellow font-belanosima text-sm">
                            {l.price} CTSI
                          </p>
                          <p className="text-[10px] text-gray-500">
                            You receive {(l.price * (1 - feePct / 100)).toFixed(2)}{" "}
                            CTSI after the {feePct}% fee
                          </p>
                        </div>
                        <button
                          onClick={() => delist(l)}
                          disabled={busyId === l.character_id}
                          className="rounded-lg border border-red-500/60 text-red-400 font-belanosima text-[11px] uppercase px-3 py-2 hover:bg-red-500 hover:text-white disabled:opacity-50"
                        >
                          Delist
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-belanosima text-white uppercase tracking-wider text-sm mb-4">
                  List a warrior
                </h3>
                {!wallet ? (
                  <p className="text-gray-500 font-poppins text-sm">
                    Connect your wallet to list warriors.
                  </p>
                ) : owned.filter((c) => !listedIds.has(c.id)).length === 0 ? (
                  <p className="text-gray-500 font-poppins text-sm">
                    No unlisted warriors —{" "}
                    <Link to="/profile/purchasecharacter" className="text-myGreen underline">
                      recruit some first
                    </Link>
                    .
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {owned
                      .filter((c) => !listedIds.has(c.id))
                      .map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            audio.play("click");
                            setListTarget(c);
                          }}
                          className="text-left rounded-xl border border-gray-800 bg-myBlack/80 p-2.5 hover:border-myGreen transition-colors"
                        >
                          {c.img && (
                            <img
                              src={c.img}
                              alt={c.name}
                              className="w-full h-20 object-cover rounded-lg mb-2"
                            />
                          )}
                          <p className="font-belanosima text-white text-xs truncate">
                            {c.name}
                          </p>
                          <StatLine c={c} />
                          <p className="text-myGreen text-[10px] font-belanosima mt-1">
                            Tap to list →
                          </p>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* listing modal */}
      {listTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-2xl border border-myGreen/50 bg-myBlack p-6">
            <h3 className="font-belanosima text-white text-lg mb-1">
              List {listTarget.name}
            </h3>
            <p className="text-[11px] text-gray-500 font-poppins mb-4">
              Buyers pay with deposited CTSI. The platform keeps {feePct}% of
              the sale.
            </p>
            <input
              type="number"
              min="0"
              step="0.01"
              value={listPrice}
              onChange={(e) => setListPrice(e.target.value)}
              placeholder="Price in CTSI"
              className="w-full rounded-lg bg-navBg border border-gray-700 px-4 py-3 text-white font-poppins text-sm focus:border-myGreen outline-none mb-2"
            />
            {Number(listPrice) > 0 && (
              <p className="text-[11px] text-myGreen font-poppins mb-4">
                You'll receive{" "}
                {(Number(listPrice) * (1 - feePct / 100)).toFixed(2)} CTSI if it
                sells.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={submitListing}
                className="flex-1 rounded-lg btn-glow font-belanosima uppercase text-sm py-3"
              >
                List for sale
              </button>
              <button
                onClick={() => {
                  setListTarget(null);
                  setListPrice("");
                }}
                className="rounded-lg border border-gray-700 text-gray-300 font-belanosima uppercase text-sm px-4 py-3 hover:border-myGreen"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Market;
