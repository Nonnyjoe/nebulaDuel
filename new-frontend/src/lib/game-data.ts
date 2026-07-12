import charactersdata from "@/lib/game/characters";
import { toWarriors } from "@/lib/game/warrior-adapter";

export type Element = "Fire" | "Water" | "Nature" | "Storm" | "Psychic" | "Shadow" | "Neutral";
export type Rarity = "Common" | "Rare" | "Epic" | "Legendary";

export interface Warrior {
  id: string;
  name: string;
  title: string;
  element: Element;
  rarity: Rarity;
  level: number;
  hp: number;
  atk: number;
  str: number;
  spd: number;
  power: string;
  powerDesc: string;
  image: string;
  priceEth?: number;
  pricePts?: number;
}

// The canonical roster is the original game's 20 characters (3D models +
// portraits + stats). Live ownership/market data is layered on per-page; this
// static list backs cards, codex pairings and any pre-connect previews.
export const WARRIORS: Warrior[] = toWarriors(charactersdata);

export const ELEMENTS: Element[] = ["Fire", "Water", "Nature", "Storm", "Psychic", "Shadow", "Neutral"];

export const ELEMENT_TOKEN: Record<Element, string> = {
  Fire: "fire",
  Water: "water",
  Nature: "nature",
  Storm: "storm",
  Psychic: "psychic",
  Shadow: "shadow-el",
  Neutral: "neutral-el",
};

export const RARITY_TOKEN: Record<Rarity, string> = {
  Common: "common",
  Rare: "rare",
  Epic: "epic",
  Legendary: "legendary",
};

export interface CampaignLevel {
  id: number;
  name: string;
  biome: string;
  boost: Element;
  damp: Element;
  reward: number;
  retryCost: number;
  status: "cleared" | "current" | "locked";
  blurb: string;
}

export const CAMPAIGN: CampaignLevel[] = [
  { id: 1, name: "Whispering Thicket", biome: "Verdant Wilds", boost: "Nature", damp: "Fire", reward: 130, retryCost: 10, status: "cleared", blurb: "Living forest — nature thrives, shadows whisper from the canopy." },
  { id: 2, name: "Tidepool Shallows", biome: "Abyssal Depths", boost: "Water", damp: "Fire", reward: 160, retryCost: 20, status: "current", blurb: "Brine-soaked raiders ambush from the shallows. Water surges with power; flames sputter." },
  { id: 3, name: "Ember Foothills", biome: "Volcanic Forge", boost: "Fire", damp: "Nature", reward: 190, retryCost: 25, status: "locked", blurb: "Molten heart — fire rages, nature withers in the ash." },
  { id: 4, name: "Static Fields", biome: "Storm Spire", boost: "Storm", damp: "Psychic", reward: 220, retryCost: 30, status: "locked", blurb: "Eternal lightning — storm strikes, minds fracture under noise." },
  { id: 5, name: "Veil of Mirrors", biome: "Astral Plane", boost: "Psychic", damp: "Shadow", reward: 250, retryCost: 35, status: "locked", blurb: "Thought made matter. Psyche dominates, shadow loses form." },
  { id: 6, name: "The Void Nexus", biome: "Void Nexus", boost: "Shadow", damp: "Storm", reward: 280, retryCost: 40, status: "locked", blurb: "The Throne of Eternity. Shadow rules; even storms fall quiet." },
];

export interface LiveDuel {
  id: string;
  player1: string;
  player2: string;
  stake: number;
  status: "live" | "pending" | "finished";
  winner?: string;
}

export const LIVE_DUELS: LiveDuel[] = [
  { id: "d1", player1: "0xA12...4B", player2: "0xC9F...01", stake: 12, status: "live" },
  { id: "d2", player1: "0xD41...92", player2: "0x77B...3A", stake: 8, status: "live" },
  { id: "d3", player1: "0xE08...77", player2: "AI · Hard", stake: 5, status: "pending" },
  { id: "d4", player1: "0x991...10", player2: "0x205...8F", stake: 24, status: "finished", winner: "0x991...10" },
];

export interface TopGamer {
  rank: number;
  handle: string;
  address: string;
  wins: number;
  points: number;
}

export const TOP_GAMERS: TopGamer[] = [
  { rank: 1, handle: "ARCHON", address: "0x71C...8E24", wins: 184, points: 12480 },
  { rank: 2, handle: "VOIDWALKER", address: "0x09F...221A", wins: 162, points: 11203 },
  { rank: 3, handle: "NEONSAGE", address: "0xC4D...0907", wins: 149, points: 10488 },
  { rank: 4, handle: "ZYLAR", address: "0xA12...4BB1", wins: 128, points: 9012 },
  { rank: 5, handle: "TIDEBORN", address: "0xD41...9217", wins: 117, points: 8330 },
];

export const STRATEGIES = [
  { id: "executioner", name: "Executioner", short: "E", desc: "Focus the enemy with the MOST health — bring down the tanks first." },
  { id: "assassin", name: "Assassin", short: "A", desc: "Hunt the WEAKEST enemy — secure quick knockouts and thin their ranks." },
  { id: "duelist", name: "Duelist", short: "D", desc: "Challenge the STRONGEST enemy — neutralise their biggest hitter early." },
  { id: "opportunist", name: "Opportunist", short: "O", desc: "Pick off the FRAILEST fighters — exploit low strength mercilessly." },
] as const;
