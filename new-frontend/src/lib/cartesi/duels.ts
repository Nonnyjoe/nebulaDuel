/** Duel reads — shared by the query hooks and the AI-duel resolution chain. */
import { readGameState } from "./inspect";

export interface DuelRow {
  id: number;
  duel_creator: string;
  duel_opponent: string;
  /** "Easy" | "Hard" for AI duels, "P2P" for player-vs-player. */
  difficulty: string;
  is_active: boolean;
  is_completed: boolean;
  has_staked: boolean;
  stake_amount: number;
  creator_warriors: number[];
  opponent_warriors: number[];
  winner?: string;
  [key: string]: unknown;
}

/** The backend's sentinel address for the AI opponent (ai_battle::AI_ADDRESS). */
export const AI_ADDRESS = "0xnebula";

/** AI duels carry difficulty Easy/Hard (P2P is the player-vs-player marker), or
 *  face the Nebula AI sentinel opponent. */
export function isAiDuel(d: DuelRow): boolean {
  const diff = String(d.difficulty ?? "").toLowerCase();
  return diff === "easy" || diff === "hard" || (d.duel_opponent ?? "").toLowerCase() === AI_ADDRESS;
}

/**
 * The backend serializes warrior lists via vec_of_id_to_json as a JSON *string*
 * of `[{"char_id":1},…]` (not a plain number array). Parse it into number[].
 */
function toWarriorIds(v: unknown): number[] {
  let arr: unknown = v;
  if (typeof v === "string") {
    try {
      arr = JSON.parse(v);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((x) => Number(x && typeof x === "object" ? (x as any).char_id ?? (x as any).id : x))
    .filter((n) => Number.isFinite(n));
}

/**
 * Normalize the backend duel JSON (duels_to_json) to the shape the UI uses.
 * The backend emits `duel_id` / `has_stake` / `duel_winner` and stringified
 * warrior lists; the UI expects `id` / `has_staked` / `winner` and number[].
 * Getting this wrong silently breaks duel id lookups (e.g. the AI-duel resolve).
 */
export async function fetchDuels(path: string): Promise<DuelRow[]> {
  const res = await readGameState(path);
  const raw = res.Status && Array.isArray(res.request_payload) ? res.request_payload : [];
  return (raw as any[]).map((d) => ({
    ...d,
    id: Number(d.duel_id ?? d.id ?? 0),
    difficulty: String(d.difficulty ?? ""),
    is_active: Boolean(d.is_active),
    is_completed: Boolean(d.is_completed),
    has_staked: Boolean(d.has_stake ?? d.has_staked ?? false),
    stake_amount: Number(d.stake_amount ?? 0),
    creator_warriors: toWarriorIds(d.creator_warriors),
    opponent_warriors: toWarriorIds(d.opponent_warriors),
    winner: d.duel_winner || undefined,
  }));
}
