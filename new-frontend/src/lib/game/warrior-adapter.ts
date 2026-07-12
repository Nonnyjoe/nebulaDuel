/**
 * Adapter: a backend/local character (id, stats, super_power, portrait) → the
 * `Warrior` card shape the new UI renders. Element comes from the power, rarity
 * from the price tier, and the signature move IS the super_power (which maps
 * 1:1 onto the moves codex).
 */
import type { Warrior, Element, Rarity } from "@/lib/game-data";
import {
  powerToElement,
  POWER_DESCRIPTIONS,
  type ElementName,
} from "@/lib/cartesi/game-types";

export interface CharacterLike {
  id: number | string;
  name: string;
  health: number;
  attack: number;
  strength: number;
  speed: number;
  super_power: string;
  price?: number;
  img?: string;
  image?: string;
  level?: number;
}

const ELEMENT_TITLE: Record<ElementName, string> = {
  Storm: "Storm Sovereign",
  Fire: "Ember Bound",
  Water: "Tide Walker",
  Nature: "Bloom Keeper",
  Shadow: "Shadow Reaper",
  Psychic: "Mind Lance",
  Neutral: "Arena Veteran",
};

function rarityForPrice(price: number): Rarity {
  if (price >= 430) return "Legendary";
  if (price >= 380) return "Epic";
  if (price >= 340) return "Rare";
  return "Common";
}

export function toWarrior(c: CharacterLike): Warrior {
  const element = powerToElement(c.super_power) as Element;
  const price = c.price ?? 0;
  return {
    id: String(c.id),
    name: c.name,
    title: ELEMENT_TITLE[element as ElementName] ?? "Arena Veteran",
    element,
    rarity: rarityForPrice(price),
    level: c.level ?? 1,
    hp: c.health,
    atk: c.attack,
    str: c.strength,
    spd: c.speed,
    power: c.super_power,
    powerDesc: POWER_DESCRIPTIONS[c.super_power] ?? "",
    image: c.img ?? c.image ?? "",
    priceEth: price > 0 ? Math.round((price / 100) * 100) / 100 : undefined,
    pricePts: price || undefined,
  };
}

export function toWarriors(list: CharacterLike[]): Warrior[] {
  return list.map(toWarrior);
}
