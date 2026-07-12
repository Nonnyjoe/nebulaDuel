/**
 * Unified arena pool — combines the original biome environments (3D floor
 * texture + fog/light theme from BIOME_THEMES) with image backdrops (the new
 * frontend's arena art + the original Nebula arenas). Campaign battles use
 * their level's biome arena; PvP / AI / ghost battles get a randomly chosen
 * arena per fight. Arena choice is purely cosmetic and never affects the
 * deterministic on-chain result.
 */
import {
  BIOME_THEMES,
  type BiomeName,
  type BiomeTheme,
} from "@/lib/cartesi/game-types";

export interface Arena {
  id: string;
  theme: BiomeTheme;
  /** optional image backdrop (public URL) layered under the biome wash */
  backdrop?: string;
}

// Image backdrops live in /public/arenas (old Nebula arenas + the new art).
export const ARENA_BACKDROPS: string[] = [
  "/arenas/arena-bg.jpg",
  "/arenas/nebula-arena-2.jpeg",
  "/arenas/nebula-arena-4.jpeg",
  "/arenas/nebula-arena-9.webp",
  "/arenas/nebula-arena-10.jpeg",
];

const BIOMES = Object.keys(BIOME_THEMES) as BiomeName[];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Choose an arena to render a battle in.
 * - `biome` given (campaign) → that biome's environment; ~half the time we also
 *   drop in a random image backdrop for variety.
 * - no biome (duel/AI/ghost) → a fully random biome environment + backdrop.
 */
export function pickArena(opts?: { biome?: BiomeName }): Arena {
  if (opts?.biome) {
    return {
      id: `campaign-${opts.biome}`,
      theme: BIOME_THEMES[opts.biome],
      backdrop: Math.random() < 0.5 ? pick(ARENA_BACKDROPS) : undefined,
    };
  }
  const biome = pick(BIOMES);
  return {
    id: `arena-${biome}-${Math.floor(Math.random() * 1e6)}`,
    theme: BIOME_THEMES[biome],
    backdrop: pick(ARENA_BACKDROPS),
  };
}
