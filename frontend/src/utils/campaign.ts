/**
 * Campaign data layer + theming. Reads level catalog and player progress via
 * inspect, and battle reports via campaign_battle notices.
 */
import { inspectState, listDecodedNotices } from "./cartesi";

// ---------------------------------------------------------------------------
// Types mirroring app/src/campaign/mod.rs
// ---------------------------------------------------------------------------

export type ElementName =
  | "Storm"
  | "Fire"
  | "Nature"
  | "Water"
  | "Psychic"
  | "Shadow"
  | "Neutral";

export type BiomeName =
  | "VerdantWilds"
  | "VolcanicForge"
  | "AbyssalDepths"
  | "StormSpire"
  | "AstralPlane"
  | "VoidNexus";

export interface CampaignEnemy {
  id: number;
  name: string;
  power: string;
  element: ElementName;
  health: number;
  strength: number;
  attack: number;
  speed: number;
}

export interface CampaignLevel {
  id: number;
  name: string;
  biome: BiomeName;
  lore: string;
  reward_points: number;
  retry_cost: number;
  is_boss: boolean;
  title?: string;
  enemies: CampaignEnemy[];
}

export interface CampaignProgress {
  wallet_address: string;
  campaign_progress: number;
  campaign_wins: number;
  campaign_losses: number;
  titles: string[];
  attempts: { level: number; attempts: number }[];
}

export interface BattleUnit {
  id: number;
  name: string;
  side: "player" | "enemy";
  power: string;
  element: ElementName;
  max_health: number;
  health: number;
  strength: number;
  attack: number;
  speed: number;
}

export interface BattleEvent {
  round: number;
  actor_id: number;
  actor_side: "player" | "enemy";
  target_id: number;
  action: "attack" | "power" | "burn" | "stunned";
  power?: string;
  element: ElementName;
  damage: number;
  heal?: number;
  crit: boolean;
  effective: "strong" | "weak" | "normal";
  effect?: string;
  actor_hp: number;
  target_hp: number;
  target_ko: boolean;
}

export interface BattleReport {
  level_id: number;
  level_name: string;
  biome: BiomeName;
  is_boss: boolean;
  attempt: number;
  player: string;
  victory: boolean;
  rounds: number;
  player_squad: BattleUnit[];
  enemy_squad: BattleUnit[];
  events: BattleEvent[];
  rewards: { points: number; stat_boost: boolean; title?: string };
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

export async function fetchCampaignLevels(): Promise<CampaignLevel[]> {
  const { ok, reports } = await inspectState("campaign_levels");
  if (!ok || !reports.length) return [];
  try {
    return JSON.parse(reports[0]);
  } catch {
    return [];
  }
}

export async function fetchCampaignProgress(
  wallet: string,
): Promise<CampaignProgress | null> {
  const { ok, reports } = await inspectState(`campaign/${wallet.toLowerCase()}`);
  if (!ok || !reports.length) return null;
  try {
    return JSON.parse(reports[0]);
  } catch {
    return null;
  }
}

export interface LeaderboardRow {
  rank: number;
  monika: string;
  wallet_address: string;
  campaign_progress: number;
  campaign_wins: number;
  campaign_losses: number;
  top_title: string;
}

export async function fetchCampaignLeaderboard(): Promise<LeaderboardRow[]> {
  const { ok, reports } = await inspectState("campaign_leaderboard");
  if (!ok || !reports.length) return [];
  try {
    return JSON.parse(reports[0]);
  } catch {
    return [];
  }
}

/** Latest battle report for a player + level (post-fight replay source). */
export async function fetchLatestBattleReport(
  wallet: string,
  levelId: number,
): Promise<BattleReport | null> {
  const notices = await listDecodedNotices();
  let latest: { tx_id: number; report: BattleReport } | null = null;
  for (const n of notices) {
    if (n.method !== "campaign_battle") continue;
    try {
      const report: BattleReport = JSON.parse(n.data);
      if (
        report.player?.toLowerCase() === wallet.toLowerCase() &&
        Number(report.level_id) === Number(levelId)
      ) {
        if (!latest || Number(n.tx_id) > latest.tx_id) {
          latest = { tx_id: Number(n.tx_id), report };
        }
      }
    } catch {
      /* skip malformed */
    }
  }
  return latest?.report ?? null;
}

// ---------------------------------------------------------------------------
// Theming
// ---------------------------------------------------------------------------

export interface BiomeTheme {
  label: string;
  tagline: string;
  emoji: string;
  /** tailwind-compatible gradient classes for cards/nodes */
  gradient: string;
  ring: string;
  text: string;
  /** three.js scene colors */
  fog: string;
  ground: string;
  light: string;
  accent: string;
  boosted: ElementName;
  dampened: ElementName;
}

export const BIOME_THEMES: Record<BiomeName, BiomeTheme> = {
  VerdantWilds: {
    label: "Verdant Wilds",
    tagline: "Living forest — Nature thrives, Shadow withers",
    emoji: "🌿",
    gradient: "from-emerald-900 via-green-800 to-emerald-950",
    ring: "ring-emerald-400",
    text: "text-emerald-300",
    fog: "#0d2818",
    ground: "#14532d",
    light: "#86efac",
    accent: "#34d399",
    boosted: "Nature",
    dampened: "Shadow",
  },
  VolcanicForge: {
    label: "Volcanic Forge",
    tagline: "Molten heart — Fire rages, Nature chars",
    emoji: "🌋",
    gradient: "from-red-950 via-orange-900 to-red-950",
    ring: "ring-orange-400",
    text: "text-orange-300",
    fog: "#2a0f05",
    ground: "#7c2d12",
    light: "#fdba74",
    accent: "#fb923c",
    boosted: "Fire",
    dampened: "Nature",
  },
  AbyssalDepths: {
    label: "Abyssal Depths",
    tagline: "Drowned ruins — Water surges, Fire sputters",
    emoji: "🌊",
    gradient: "from-blue-950 via-cyan-900 to-blue-950",
    ring: "ring-cyan-400",
    text: "text-cyan-300",
    fog: "#04121f",
    ground: "#164e63",
    light: "#67e8f9",
    accent: "#22d3ee",
    boosted: "Water",
    dampened: "Fire",
  },
  StormSpire: {
    label: "Storm Spire",
    tagline: "Eternal lightning — Storm strikes, minds scatter",
    emoji: "⚡",
    gradient: "from-indigo-950 via-violet-900 to-slate-950",
    ring: "ring-yellow-300",
    text: "text-yellow-200",
    fog: "#11122b",
    ground: "#312e81",
    light: "#fde047",
    accent: "#facc15",
    boosted: "Storm",
    dampened: "Psychic",
  },
  AstralPlane: {
    label: "Astral Plane",
    tagline: "Thought made terrain — Psychic amplifies, Water dulls",
    emoji: "🔮",
    gradient: "from-fuchsia-950 via-purple-900 to-fuchsia-950",
    ring: "ring-fuchsia-400",
    text: "text-fuchsia-300",
    fog: "#1d0a2e",
    ground: "#581c87",
    light: "#e879f9",
    accent: "#d946ef",
    boosted: "Psychic",
    dampened: "Water",
  },
  VoidNexus: {
    label: "Void Nexus",
    tagline: "Where light dies — Shadow reigns, Storm is silenced",
    emoji: "🕳️",
    gradient: "from-slate-950 via-zinc-900 to-black",
    ring: "ring-purple-500",
    text: "text-purple-300",
    fog: "#06060c",
    ground: "#18181b",
    light: "#a78bfa",
    accent: "#8b5cf6",
    boosted: "Shadow",
    dampened: "Storm",
  },
};

export const ELEMENT_META: Record<
  ElementName,
  { emoji: string; color: string; bg: string }
> = {
  Storm: { emoji: "⚡", color: "text-yellow-300", bg: "bg-yellow-500/20" },
  Fire: { emoji: "🔥", color: "text-orange-400", bg: "bg-orange-500/20" },
  Nature: { emoji: "🌿", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  Water: { emoji: "💧", color: "text-cyan-300", bg: "bg-cyan-500/20" },
  Psychic: { emoji: "🔮", color: "text-fuchsia-400", bg: "bg-fuchsia-500/20" },
  Shadow: { emoji: "🌑", color: "text-purple-400", bg: "bg-purple-500/20" },
  Neutral: { emoji: "✨", color: "text-gray-300", bg: "bg-gray-500/20" },
};

/** Mirrors the backend SuperPower -> Element mapping. */
export function powerToElement(power: string): ElementName {
  switch (power) {
    case "Thunderbolt":
    case "SonicKick":
      return "Storm";
    case "Flamethrower":
    case "HeadCrush":
      return "Fire";
    case "VineWhip":
    case "SleepSong":
      return "Nature";
    case "WaterGun":
      return "Water";
    case "Psychic":
    case "TelekineticHit":
      return "Psychic";
    case "ShadowBall":
    case "InvisibleClaws":
      return "Shadow";
    default:
      return "Neutral";
  }
}

const STRONG_PAIRS: [ElementName, ElementName][] = [
  ["Fire", "Nature"],
  ["Nature", "Water"],
  ["Water", "Fire"],
  ["Storm", "Psychic"],
  ["Psychic", "Shadow"],
  ["Shadow", "Storm"],
  ["Storm", "Water"],
  ["Nature", "Storm"],
];

/** Mirrors backend element_multiplier: 130 / 100 / 75. */
export function elementMultiplier(
  attacker: ElementName,
  defender: ElementName,
): number {
  if (STRONG_PAIRS.some(([a, d]) => a === attacker && d === defender)) return 130;
  if (STRONG_PAIRS.some(([a, d]) => a === defender && d === attacker)) return 75;
  return 100;
}

export function biomeMultiplier(biome: BiomeName, attacker: ElementName): number {
  const theme = BIOME_THEMES[biome];
  if (attacker === theme.boosted) return 125;
  if (attacker === theme.dampened) return 85;
  return 100;
}

/** Aggregate "how good is this squad on this level" score (percent). */
export function squadFitScore(
  biome: BiomeName,
  squadElements: ElementName[],
  enemyElements: ElementName[],
): number {
  if (!squadElements.length) return 100;
  let total = 0;
  let count = 0;
  for (const mine of squadElements) {
    const bio = biomeMultiplier(biome, mine);
    for (const theirs of enemyElements) {
      total += (elementMultiplier(mine, theirs) * bio) / 100;
      count += 1;
    }
  }
  return count ? Math.round(total / count) : 100;
}

/** Element → 3D model pool for campaign enemies. The portrait shown in the
 * briefing comes from the same mapping, so what you scout is what you fight. */
export const ENEMY_MODELS: Record<ElementName, string[]> = {
  Storm: ["/models/zylar.gltf", "/models/s-hawk.gltf"],
  Fire: ["/models/blaze.gltf", "/models/drake.gltf"],
  Nature: ["/models/troll.gltf", "/models/d-wolf.gltf"],
  Water: ["/models/vortex.gltf", "/models/c-valor.gltf"],
  Psychic: ["/models/mystic.gltf", "/models/techno.gltf"],
  Shadow: ["/models/ghoul.gltf", "/models/ravager.gltf"],
  Neutral: ["/models/berzerker.gltf", "/models/s-golem.gltf"],
};

import charactersdata from "./Charactersdata";

/** Deterministic model + portrait for a campaign enemy. */
export function enemyVisual(
  element: ElementName,
  enemyId: number,
): { model: string; img?: string } {
  const pool = ENEMY_MODELS[element] ?? ENEMY_MODELS.Neutral;
  const model = pool[enemyId % pool.length];
  const img = charactersdata.find((c) => c.model === model)?.img;
  return { model, img };
}

export const STRATEGIES: {
  id: number;
  name: string;
  description: string;
  emoji: string;
}[] = [
  {
    id: 1,
    name: "Executioner",
    description: "Focus the enemy with the MOST health — bring down the tanks first.",
    emoji: "🪓",
  },
  {
    id: 2,
    name: "Assassin",
    description: "Hunt the WEAKEST enemy — secure quick knockouts and thin their ranks.",
    emoji: "🗡️",
  },
  {
    id: 3,
    name: "Duelist",
    description: "Challenge the STRONGEST enemy — neutralise their biggest hitter early.",
    emoji: "⚔️",
  },
  {
    id: 4,
    name: "Opportunist",
    description: "Pick off the FRAILEST fighters — exploit low strength mercilessly.",
    emoji: "🎯",
  },
];

export const POWER_DESCRIPTIONS: Record<string, string> = {
  Thunderbolt: "180% strike, 25% chance to stun",
  Flamethrower: "140% strike + burns for 2 rounds",
  VineWhip: "120% strike, heals caster for half the damage",
  WaterGun: "130% strike, soaks target (-10% attack)",
  SleepSong: "60% strike, puts target to sleep (skips a turn)",
  Psychic: "150% strike that ignores the target's speed",
  Adaptability: "Strikes with the target's own strength, +15% self attack",
  ShadowBall: "160% strike with 15% lifesteal",
  HeadCrush: "200% strike, 10% self recoil",
  SonicKick: "Two 90% strikes in one turn",
  TelekineticHit: "140% strike, slows target (-20% speed)",
  InvisibleClaws: "170% strike, guaranteed critical",
  DodgeNdTailLash: "110% strike + dodges the next incoming hit",
};
