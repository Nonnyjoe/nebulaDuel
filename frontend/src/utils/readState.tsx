import { hexToString } from "viem";

const INSPECT_BASE_URL =
  import.meta.env.VITE_INSPECT_URL ?? "http://localhost:8080";
const APPLICATION_ADDRESS =
  import.meta.env.VITE_DAPP_ADDRESS ?? "";

/**
 * Inspect request format (Cartesi v2):
 * POST {INSPECT_BASE_URL}/inspect/{APPLICATION_ADDRESS}
 * Body: plain string payload (e.g. "profile/0x...", "has_profile/0x...")
 * Response: { status, reports: [{ payload: "0x..." }], processed_input_count }
 */
async function readGameState(data: any) {
  if (!APPLICATION_ADDRESS) {
    console.error("VITE_DAPP_ADDRESS is not set for inspect requests");
    return { Status: false, request_payload: "Missing application address" };
  }
  const payloadString = typeof data === "string" ? data : JSON.stringify(data);
  const url = `${INSPECT_BASE_URL}/inspect/${APPLICATION_ADDRESS}`;
  console.log("Inspecting state from Cartesi........", url, payloadString);
  try {

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payloadString,
    });

    const result = await response.json();
    console.log("Response: ", response.status, response.ok, " Result:", result);

    if (!response.ok) {
      console.log("I AM BREAKING HERE 1")
      return {
        Status: false,
        request_payload: result.exception_payload ?? result.status ?? String(response.status),
      };
    }
    if (result.status !== "Accepted" && result.status !== "accepted") {
      console.log("I AM BREAKING HERE 2", result.status)
      return {
        Status: false,
        request_payload: result.exception_payload ?? result.status,
      };
    }
    console.log("Attempting to destructure response: ", result.reports ?? [], payloadString);
    const { Status, request_payload } = destructureResponse(
      result.reports ?? [],
      payloadString
    );
    console.log("Destructured response: ", Status, request_payload);
    return { Status, request_payload };
  } catch (error: any) {
    const message = error?.message ?? String(error);
    console.error("Error sending inspect request:", message);
    return { Status: false, request_payload: message };
  }
}

function decodeReportPayload(hexPayload: string): string {
  if (!hexPayload) return "";
  const hex = hexPayload.startsWith("0x") ? hexPayload : `0x${hexPayload}`;
  try {
    return hexToString(hex as `0x${string}`);
  } catch {
    return "";
  }
}

function destructureResponse(reports: any, data: any) {
  if (!reports || reports.length === 0) {
    return { Status: false, request_payload: "Empty response" };
  }
  const raw = decodeReportPayload(reports[0].payload as string);
  console.log("Raw: ", raw);
  console.log("Data: ", data);
  if (!raw) {
    return { Status: false, request_payload: "Invalid or empty report payload" };
  }

  // Backend routes and what they return (inspect_router.rs):
  // - has_profile/<addr>  -> "true" | "false" (handle_check_has_profile)
  // - profile/<addr>     -> single JSON object (single_player_profile_to_json)
  // - profile (no addr)  -> all players JSON array (players_profile_to_json)
  // - characters, duels, players_characters, get_duel_characters -> JSON (array or object)
  // - listed_characters  -> JSON
  // - admin, relayer, check_relayed_dapp_address -> plain string

  if (data.startsWith("has_profile/")) {
    console.log("Raw for has_profile:", raw);
    const normalized = raw.trim().toLowerCase();
    const hasProfile =
      normalized === "true" ||
      normalized === "rue" ||
      normalized.endsWith("rue");
    return { Status: true, request_payload: hasProfile };
  }

  if (data.startsWith("profile/")) {
    try {
      // Backend sends profile JSON without surrounding braces, e.g.
      // `"monika":"...","wallet_address":"...","id":2,...`
      // so we wrap it to form a valid object literal.
      const profile = JSON.parse(`{${raw}`);
      return { Status: true, request_payload: profile };
    } catch {
      return { Status: false, request_payload: "Invalid profile JSON" };
    }
  }

  if (data.includes("players_characters")) {
    try {
      console.log("Raw for players_characters: ", raw);
      const parsed = JSON.parse(`[${raw}`);
      console.log("Parsed for players_characters: ", parsed);
      const request_payload = Array.isArray(parsed) ? parsed : [parsed];
      console.log("Request payload for players_characters: ", request_payload);
      return { Status: true, request_payload: request_payload };
    } catch {
      return { Status: true, request_payload: [] };
    }
  }

  // Backend sends JSON array for these (e.g. character_to_json). Raw may be "[{...},{...}]" or "{...},{...}"
  if (
    data.includes("get_duel_characters") ||
    data.includes("characters") ||
    data.includes("duels") ||
    data.includes("listed_characters")
  ) {
    try {
      console.log("Raw for get_duel_characters, characters, duels, listed_characters: ", raw);
      const parsed = JSON.parse(raw);
      return { Status: true, request_payload: Array.isArray(parsed) ? parsed : [parsed] };
    } catch {
      try {
        const arr = JSON.parse(`[${raw}]`);
        return { Status: true, request_payload: Array.isArray(arr) ? arr : [arr] };
      } catch {
        return { Status: true, request_payload: [] };
      }
    }
  }

  if (
    data.includes("check_relayed_dapp_address") ||
    data.includes("admin") ||
    data.includes("relayer")
  ) {
    return { Status: true, request_payload: raw };
  }

  try {
    const parsed = JSON.parse(`{${raw}}`);
    return { Status: true, request_payload: parsed };
  } catch {
    return { Status: true, request_payload: raw };
  }
}

export default readGameState;
