import thunderbolt from "@/assets/fx/thunderbolt.png";
import flamethrower from "@/assets/fx/flamethrower.png";
import vinewhip from "@/assets/fx/vinewhip.png";
import watergun from "@/assets/fx/watergun.png";
import sleepsong from "@/assets/fx/sleepsong.png";
import psychic from "@/assets/fx/psychic.png";
import adaptability from "@/assets/fx/adaptability.png";
import shadowball from "@/assets/fx/shadowball.png";
import headcrush from "@/assets/fx/headcrush.png";
import sonickick from "@/assets/fx/sonickick.png";
import telekinetic from "@/assets/fx/telekinetic.png";
import invisibleclaws from "@/assets/fx/invisibleclaws.png";
import shield from "@/assets/fx/shield.png";
import heal from "@/assets/fx/heal.png";

import type { Element } from "@/lib/game-data";

export type MoveId =
  | "Thunderbolt" | "Flamethrower" | "VineWhip" | "WaterGun"
  | "SleepSong" | "Psychic" | "Adaptability" | "ShadowBall"
  | "HeadCrush" | "SonicKick" | "TelekineticHit"
  | "InvisibleClaws" | "DodgeNdTailLash";

export type SfxKind =
  | "thunder" | "fire" | "vine" | "water" | "sleep" | "psychic"
  | "buff" | "shadow" | "impact" | "kick" | "telekinetic"
  | "crit" | "shield" | "heal" | "ui" | "win" | "lose";

export type TravelKind = "projectile" | "beam" | "self" | "melee";

export interface MoveDef {
  id: MoveId;
  name: string;
  short: string;
  vfx: string;        // sprite
  vfxAlt?: string;    // optional secondary sprite (e.g. shield/heal)
  sfx: SfxKind;
  element: Element;
  damageLabel: string;
  special: string;
  tint: string;       // css color for glow
  travel: TravelKind;
  /** world-space size of the VFX sprite in the 3D arena (height in units). */
  vfxScale?: number;
}

/** Default arena size per travel kind (overridable per move via `vfxScale`). */
export const VFX_DEFAULT_SCALE: Record<TravelKind, number> = {
  projectile: 1.3,
  beam: 1.6,
  self: 1.7,
  melee: 1.5,
};

/** Resolved world-space size for a move's VFX sprite. */
export function vfxScaleFor(move: MoveDef): number {
  return move.vfxScale ?? VFX_DEFAULT_SCALE[move.travel];
}

export const MOVES: Record<MoveId, MoveDef> = {
  Thunderbolt:    { id:"Thunderbolt",    name:"Thunderbolt",    short:"180% · Stun",        vfx:thunderbolt,   sfx:"thunder",     element:"Storm",   damageLabel:"180%", special:"25% stun chance",         tint:"oklch(0.88 0.18 95)",  travel:"projectile" },
  Flamethrower:   { id:"Flamethrower",   name:"Flamethrower",   short:"140% · Burn",        vfx:flamethrower,  sfx:"fire",        element:"Fire",    damageLabel:"140%", special:"Burn for 2 rounds",       tint:"oklch(0.7 0.22 30)",   travel:"beam" },
  VineWhip:       { id:"VineWhip",       name:"VineWhip",       short:"120% · Drain",       vfx:vinewhip,      vfxAlt:heal,       sfx:"vine",        element:"Nature",  damageLabel:"120%", special:"Heal self for 50% dealt", tint:"oklch(0.78 0.2 145)",  travel:"melee" },
  WaterGun:       { id:"WaterGun",       name:"WaterGun",       short:"130% · Soak",        vfx:watergun,      sfx:"water",       element:"Water",   damageLabel:"130%", special:"-10% target attack",      tint:"oklch(0.72 0.18 240)", travel:"beam" },
  SleepSong:      { id:"SleepSong",      name:"SleepSong",      short:"60% · Sleep",        vfx:sleepsong,     sfx:"sleep",       element:"Psychic", damageLabel:"60%",  special:"Target skips a turn",     tint:"oklch(0.78 0.18 320)", travel:"self" },
  Psychic:        { id:"Psychic",        name:"Psychic",        short:"150% · Pierce",      vfx:psychic,       sfx:"psychic",     element:"Psychic", damageLabel:"150%", special:"Ignores speed defense",   tint:"oklch(0.72 0.27 320)", travel:"projectile" },
  Adaptability:   { id:"Adaptability",   name:"Adaptability",   short:"Buff · +15% ATK",    vfx:adaptability,  sfx:"buff",        element:"Neutral", damageLabel:"scales",special:"+15% own attack",        tint:"oklch(0.85 0.2 75)",   travel:"self" },
  ShadowBall:     { id:"ShadowBall",     name:"ShadowBall",     short:"160% · Lifesteal",   vfx:shadowball,    sfx:"shadow",      element:"Shadow",  damageLabel:"160%", special:"Heal 15% damage dealt",   tint:"oklch(0.55 0.18 300)", travel:"projectile" },
  HeadCrush:      { id:"HeadCrush",      name:"HeadCrush",      short:"200% · Recoil",      vfx:headcrush,     sfx:"impact",      element:"Neutral", damageLabel:"200%", special:"Caster takes 10% recoil", tint:"oklch(0.7 0.22 30)",   travel:"melee" },
  SonicKick:      { id:"SonicKick",      name:"SonicKick",      short:"90% × 2 · Double",   vfx:sonickick,     sfx:"kick",        element:"Neutral", damageLabel:"90%×2",special:"Two strikes in one turn", tint:"oklch(0.82 0.18 200)", travel:"melee" },
  TelekineticHit: { id:"TelekineticHit", name:"TelekineticHit", short:"140% · Slow",        vfx:telekinetic,   sfx:"telekinetic", element:"Psychic", damageLabel:"140%", special:"-20% target speed",       tint:"oklch(0.72 0.2 260)",  travel:"projectile" },
  InvisibleClaws: { id:"InvisibleClaws", name:"InvisibleClaws", short:"170% · Crit",        vfx:invisibleclaws,sfx:"crit",        element:"Shadow",  damageLabel:"170%", special:"Guaranteed critical hit", tint:"oklch(0.65 0.24 22)",  travel:"melee" },
  DodgeNdTailLash:{ id:"DodgeNdTailLash",name:"DodgeNdTailLash",short:"110% · Dodge",       vfx:invisibleclaws,vfxAlt:shield,     sfx:"shield",      element:"Neutral", damageLabel:"110%", special:"Evades next incoming hit",tint:"oklch(0.82 0.18 200)", travel:"melee" },
};

export const MOVE_LIST = Object.values(MOVES);

// Map warrior power → move definition
export const WARRIOR_MOVE: Record<string, MoveId> = {
  w1: "Thunderbolt",
  w2: "Flamethrower",
  w3: "WaterGun",
  w4: "VineWhip",
  w5: "ShadowBall",
  w6: "SleepSong",
};
