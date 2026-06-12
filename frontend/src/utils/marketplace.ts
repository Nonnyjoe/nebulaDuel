/**
 * Marketplace data layer.
 * Reads via inspect (always fresh), writes via signMessages (which waits for
 * the Cartesi node to process the input before resolving).
 */
import { inspectState } from "./cartesi";
import charactersdata from "./Charactersdata";
import { powerToElement, ElementName } from "./campaign";

export interface MarketCharacter {
  id: number;
  name: string;
  health: number;
  strength: number;
  attack: number;
  speed: number;
  super_power: string;
  element: ElementName;
  price: number; // base points price for templates
  total_battles: number;
  total_wins: number;
  total_losses: number;
  owner: string;
  img?: string;
}

export interface Listing {
  character_id: number;
  price: number; // CTSI
  seller: string;
  character?: MarketCharacter;
}

export interface MarketInfo {
  marketplace_fee_bps: number;
  points_rate: number;
  point_mint_cooldown_secs: number;
  point_mint_premium_pct_per_purchase: number;
  point_mint_premium_cap_pct: number;
  // per-wallet (present when queried with an address):
  point_purchase_count?: number;
  last_point_purchase_time?: number;
  starter_team_claimed?: boolean;
  charm_inventory?: { charm_id: number; count: number; name?: string }[];
}

function decorate(c: any): MarketCharacter {
  return {
    id: Number(c.id ?? c.character_id),
    name: c.name,
    health: Number(c.health),
    strength: Number(c.strength),
    attack: Number(c.attack),
    speed: Number(c.speed),
    super_power: c.super_power,
    element: powerToElement(c.super_power),
    price: Number(c.price ?? 0),
    total_battles: Number(c.total_battles ?? 0),
    total_wins: Number(c.total_wins ?? 0),
    total_losses: Number(c.total_losses ?? 0),
    owner: (c.owner ?? "").toLowerCase(),
    img: charactersdata.find((d) => d.name === c.name)?.img,
  };
}

export async function fetchAllCharacters(): Promise<MarketCharacter[]> {
  const { ok, reports } = await inspectState("characters");
  if (!ok || !reports.length) return [];
  try {
    const arr = JSON.parse(reports[0]);
    return (Array.isArray(arr) ? arr : []).map(decorate);
  } catch {
    return [];
  }
}

export async function fetchListings(): Promise<Listing[]> {
  const [listRes, characters] = await Promise.all([
    inspectState("listed_characters"),
    fetchAllCharacters(),
  ]);
  if (!listRes.ok || !listRes.reports.length) return [];
  try {
    const raw = JSON.parse(listRes.reports[0]);
    return (Array.isArray(raw) ? raw : []).map((l: any) => ({
      character_id: Number(l.character_id),
      price: Number(l.price),
      seller: (l.seller ?? "").toLowerCase(),
      character: characters.find((c) => c.id === Number(l.character_id)),
    }));
  } catch {
    return [];
  }
}

export async function fetchMarketInfo(wallet?: string): Promise<MarketInfo | null> {
  const path = wallet ? `market_info/${wallet.toLowerCase()}` : "market_info";
  const { ok, reports } = await inspectState(path);
  if (!ok || !reports.length) return null;
  try {
    return JSON.parse(reports[0]);
  } catch {
    return null;
  }
}

/** Recruit templates (the 20 base characters), with stats from local data. */
export function recruitTemplates(): MarketCharacter[] {
  return charactersdata.map((c) => ({
    id: c.id - 1, // backend template ids are 0-based (sort_characters)
    name: c.name,
    health: c.health,
    strength: c.strength,
    attack: c.attack,
    speed: c.speed,
    super_power: c.super_power,
    element: powerToElement(c.super_power),
    price: c.price,
    total_battles: 0,
    total_wins: 0,
    total_losses: 0,
    owner: "",
    img: c.img,
  }));
}

/** Points price with the player's current anti-farm premium applied. */
export function premiumPointsPrice(info: MarketInfo | null, basePrice: number): number {
  if (!info) return basePrice;
  const count = info.point_purchase_count ?? 0;
  const premium = Math.min(
    count * info.point_mint_premium_pct_per_purchase,
    info.point_mint_premium_cap_pct,
  );
  return Math.floor((basePrice * (100 + premium)) / 100);
}

/** CTSI price for a base points price. */
export function ctsiPrice(info: MarketInfo | null, basePrice: number): number {
  const rate = info?.points_rate ?? 100;
  return rate > 0 ? basePrice / rate : basePrice;
}

/** Seconds remaining on the points-mint cooldown (0 = ready). */
export function cooldownRemaining(info: MarketInfo | null): number {
  if (!info?.last_point_purchase_time) return 0;
  const elapsed = Math.floor(Date.now() / 1000) - info.last_point_purchase_time;
  return Math.max(0, info.point_mint_cooldown_secs - elapsed);
}
