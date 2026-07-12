/**
 * Canonical NebulaDuel roster — the 20 characters from the original game, with
 * their 3D models (under /public/models) and animated portraits (under
 * /public/nebula-characters). Ported from the old frontend's Charactersdata.
 *
 * Portrait URL is derived from the model basename: /models/mystic.gltf →
 * /nebula-characters/mystic.gif (the two asset sets share basenames).
 */
import type { ElementName } from "@/lib/cartesi/game-types";
import { ENEMY_MODELS } from "@/lib/cartesi/game-types";

export interface CharacterData {
  id: number;
  name: string;
  health: number;
  strength: number;
  attack: number;
  speed: number;
  super_power: string;
  price: number;
  model: string;
  /** animated portrait (public URL) */
  img: string;
}

function portraitFor(model: string): string {
  const base = model.split("/").pop()!.replace(/\.(gltf|glb)$/i, "");
  return `/nebula-characters/${base}.gif`;
}

interface RawCharacter {
  id: number;
  name: string;
  health: number;
  strength: number;
  attack: number;
  speed: number;
  super_power: string;
  price: number;
  model: string;
}

const RAW: RawCharacter[] = [
  { id: 1, name: "Mystic Seer", health: 80, strength: 10, attack: 10, speed: 10, super_power: "Thunderbolt", price: 317, model: "/models/mystic.gltf" },
  { id: 2, name: "Zylar the Conqueror", health: 90, strength: 10, attack: 13, speed: 9, super_power: "Flamethrower", price: 385, model: "/models/zylar.gltf" },
  { id: 3, name: "Shadow Strike", health: 75, strength: 10, attack: 13, speed: 10, super_power: "VineWhip", price: 307, model: "/models/s-strike.gltf" },
  { id: 4, name: "Captain Valor", health: 85, strength: 8, attack: 10, speed: 8, super_power: "WaterGun", price: 350, model: "/models/c-valor.gltf" },
  { id: 5, name: "Sir Elara the Great", health: 88, strength: 9, attack: 13, speed: 7, super_power: "SleepSong", price: 362, model: "/models/s-elara.gltf" },
  { id: 6, name: "Goul King", health: 92, strength: 11, attack: 14, speed: 9, super_power: "Psychic", price: 415, model: "/models/ghoul.gltf" },
  { id: 7, name: "Elinor Swiftstrike", health: 80, strength: 10, attack: 13, speed: 7, super_power: "HeadCrush", price: 320, model: "/models/e-swiftstrike.gltf" },
  { id: 8, name: "Ravager", health: 75, strength: 8, attack: 16, speed: 6, super_power: "ShadowBall", price: 300, model: "/models/ravager.gltf" },
  { id: 9, name: "Bone Collector", health: 93, strength: 12, attack: 15, speed: 8, super_power: "Adaptability", price: 440, model: "/models/b-collector.gltf" },
  { id: 10, name: "Vortex", health: 88, strength: 10, attack: 13, speed: 8, super_power: "SonicKick", price: 370, model: "/models/vortex.gltf" },
  { id: 11, name: "Dire Wolf", health: 90, strength: 11, attack: 14, speed: 6, super_power: "TelekineticHit", price: 397, model: "/models/d-wolf.gltf" },
  { id: 12, name: "Luna Empress", health: 87, strength: 8, attack: 15, speed: 10, super_power: "InvisibleClaws", price: 357, model: "/models/luna.gltf" },
  { id: 13, name: "Blaze", health: 83, strength: 8, attack: 13, speed: 8, super_power: "DodgeNdTailLash", price: 338, model: "/models/blaze.gltf" },
  { id: 14, name: "Techno Mage", health: 93, strength: 10, attack: 12, speed: 8, super_power: "DodgeNdTailLash", price: 430, model: "/models/techno.gltf" },
  { id: 15, name: "Berzerker", health: 96, strength: 13, attack: 14, speed: 8, super_power: "DodgeNdTailLash", price: 480, model: "/models/berzerker.gltf" },
  { id: 16, name: "Gorgon", health: 92, strength: 11, attack: 13, speed: 8, super_power: "DodgeNdTailLash", price: 405, model: "/models/gorgon.gltf" },
  { id: 17, name: "Troll", health: 93, strength: 11, attack: 15, speed: 7, super_power: "DodgeNdTailLash", price: 440, model: "/models/troll.gltf" },
  { id: 18, name: "Drake Fire", health: 90, strength: 10, attack: 10, speed: 8, super_power: "DodgeNdTailLash", price: 380, model: "/models/drake.gltf" },
  { id: 19, name: "Stone Golem", health: 91, strength: 10, attack: 13, speed: 7, super_power: "DodgeNdTailLash", price: 400, model: "/models/s-golem.gltf" },
  { id: 20, name: "Serena Hawk", health: 88, strength: 10, attack: 11, speed: 9, super_power: "DodgeNdTailLash", price: 365, model: "/models/s-hawk.gltf" },
];

const charactersdata: CharacterData[] = RAW.map((c) => ({
  ...c,
  img: portraitFor(c.model),
}));

export default charactersdata;

export function characterByName(name: string): CharacterData | undefined {
  return charactersdata.find((c) => c.name === name);
}

export function characterById(id: number): CharacterData | undefined {
  return charactersdata.find((c) => c.id === id);
}

/** Deterministic 3D model + portrait for a campaign enemy (mirrors the old
 * enemyVisual: element → model pool → portrait by model basename). */
export function enemyVisual(
  element: ElementName,
  enemyId: number,
): { model: string; img: string } {
  const pool = ENEMY_MODELS[element] ?? ENEMY_MODELS.Neutral;
  const model = pool[enemyId % pool.length];
  return { model, img: portraitFor(model) };
}
