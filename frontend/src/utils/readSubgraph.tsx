/**
 * Notice-based state reads, built on the Cartesi node v2 JSON-RPC API.
 *
 * The backend emits a full snapshot of a collection inside each notice
 * (players, characters, duels...). To answer "give me all X", we find the
 * NEWEST notice (highest tx_id) whose method updates that collection and
 * parse its data field.
 *
 * Kept the `fetchNotices(request)` signature so existing imports keep working.
 */
import { listDecodedNotices, DecodedNotice } from "./cartesi";

/** Methods whose notices carry a full `all_players` snapshot. */
const PROFILE_METHODS = new Set([
  "create_player",
  "deposit",
  "withdraw",
  "transfer_tokens",
  "purchase_points",
  "modify_monika",
  "modify_avatar",
]);

/** Methods whose notices carry a full `all_characters` snapshot. */
const CHARACTER_METHODS = new Set([
  "purchase_team",
  "purchase_single_character",
  "buy_character",
]);

/** Methods whose notices carry a full `all_duels` snapshot. */
const DUEL_METHODS = new Set([
  "create_duel",
  "join_duel",
  "set_strategy",
  "fight",
  "select_ai_battle_strategy",
]);

/** Methods whose notices carry the `all_ai_duels` snapshot. */
const AI_DUEL_METHODS = new Set(["create_ai_duel"]);

function latestByMethods(
  notices: DecodedNotice[],
  methods: Set<string>,
): DecodedNotice | undefined {
  let latest: DecodedNotice | undefined;
  for (const n of notices) {
    if (!methods.has(n.method)) continue;
    if (!latest || Number(n.tx_id) > Number(latest.tx_id)) {
      latest = n;
    }
  }
  return latest;
}

function parseData(notice: DecodedNotice | undefined): any[] {
  if (!notice?.data) return [];
  try {
    const parsed = JSON.parse(notice.data);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

async function fetchNotices(request: string): Promise<any> {
  try {
    const notices = await listDecodedNotices();

    switch (request) {
      case "all_profiles":
        return parseData(latestByMethods(notices, PROFILE_METHODS));
      case "all_characters":
        return parseData(latestByMethods(notices, CHARACTER_METHODS));
      case "all_duels": {
        const p2p = parseData(latestByMethods(notices, DUEL_METHODS));
        return p2p;
      }
      case "ai_duels": {
        // AI duels live in two snapshots: `create_ai_duel` notices carry the
        // ai-duel list at creation, while strategy/fight notices carry the
        // global duel list with the final battle state. Merge: prefer the
        // freshest copy of each duel.
        const created = parseData(latestByMethods(notices, AI_DUEL_METHODS));
        const allDuels = parseData(latestByMethods(notices, DUEL_METHODS));
        const merged = new Map<number, any>();
        for (const duel of created) {
          if (duel?.duel_id != null) merged.set(Number(duel.duel_id), duel);
        }
        for (const duel of allDuels) {
          if (
            duel?.duel_id != null &&
            duel.difficulty &&
            duel.difficulty !== "P2P" &&
            merged.has(Number(duel.duel_id))
          ) {
            merged.set(Number(duel.duel_id), duel);
          }
        }
        return Array.from(merged.values());
      }
      case "all_tx": {
        // Latest notice of any kind carries the most recent tx snapshot.
        const latest = notices.reduce<DecodedNotice | undefined>(
          (acc, n) => (!acc || Number(n.tx_id) > Number(acc.tx_id) ? n : acc),
          undefined,
        );
        return parseData(latest);
      }
      default:
        return [];
    }
  } catch (error) {
    console.error("Error fetching notices via JSON-RPC:", error);
    return [];
  }
}

export default fetchNotices;
