/**
 * Inspect-based state reads. The backend's inspect_router always answers with
 * exactly one report: either the requested data or `{"error": ...}`.
 *
 * Kept the `readGameState(path)` -> { Status, request_payload } signature so
 * existing imports keep working.
 */
import { inspectState } from "./client";

export interface ReadStateResult {
  Status: boolean;
  request_payload: any;
}

export async function readGameState(data: any): Promise<ReadStateResult> {
  const path = typeof data === "string" ? data : JSON.stringify(data);
  const { ok, reports, error } = await inspectState(path);

  if (!ok) {
    return { Status: false, request_payload: error ?? "Inspect failed" };
  }
  if (!reports.length) {
    return { Status: false, request_payload: "Empty response" };
  }

  return destructureResponse(reports[0], path);
}

function destructureResponse(raw: string, path: string): ReadStateResult {
  if (!raw) {
    return { Status: false, request_payload: "Invalid or empty report payload" };
  }

  // Structured error from the backend (always JSON: {"error": "...", ...})
  const asJson = tryParseJson(raw);
  if (asJson && typeof asJson === "object" && !Array.isArray(asJson) && asJson.error) {
    return { Status: false, request_payload: asJson.error };
  }

  // Route-specific shapes (see inspect_router.rs):
  // - has_profile/<addr>               -> "true" | "false"
  // - admin | relayer | check_relayed_dapp_address -> plain string
  // - profile/<addr>                   -> JSON object
  // - everything else                  -> JSON array (or object)

  if (path.startsWith("has_profile/")) {
    return { Status: true, request_payload: raw.trim().toLowerCase() === "true" };
  }

  if (
    path.startsWith("check_relayed_dapp_address") ||
    path.startsWith("admin") ||
    path.startsWith("relayer")
  ) {
    return { Status: true, request_payload: raw.trim() };
  }

  if (path.startsWith("profile/")) {
    if (asJson && typeof asJson === "object") {
      return { Status: true, request_payload: asJson };
    }
    return { Status: false, request_payload: "Invalid profile JSON" };
  }

  // Array-shaped routes: characters, duels, players_characters,
  // get_duel_characters, listed_characters, available_duels, profile (all)
  if (asJson !== undefined) {
    return { Status: true, request_payload: asJson };
  }

  // Last resort: hand back the raw string.
  return { Status: true, request_payload: raw };
}

function tryParseJson(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export default readGameState;
