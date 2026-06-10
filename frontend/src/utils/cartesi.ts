/**
 * Unified Cartesi Rollups v2 client for NebulaDuel.
 *
 * Reads  : node JSON-RPC API (cartesi_* methods) + inspect endpoint
 * Writes : InputBox.addInput on L1 (see relayTransaction.tsx)
 *
 * All endpoints are env-driven so local dev / testnet / prod only differ by
 * .env values:
 *   VITE_JSONRPC_URL      e.g. http://localhost:6751/rpc  (cartesi run prints the port)
 *   VITE_INSPECT_URL      e.g. http://localhost:6751      (base, /inspect/<app> is appended)
 *   VITE_DAPP_ADDRESS     application contract address
 *   VITE_INPUTBOX_ADDRESS InputBox contract address
 */

export const JSON_RPC_URL: string = requireEnv(
  "VITE_JSONRPC_URL",
  import.meta.env.VITE_JSONRPC_URL,
);
export const INSPECT_BASE_URL: string = requireEnv(
  "VITE_INSPECT_URL",
  import.meta.env.VITE_INSPECT_URL,
);
export const APPLICATION_ADDRESS: string = requireEnv(
  "VITE_DAPP_ADDRESS",
  import.meta.env.VITE_DAPP_ADDRESS,
);
export const INPUTBOX_ADDRESS: string = requireEnv(
  "VITE_INPUTBOX_ADDRESS",
  import.meta.env.VITE_INPUTBOX_ADDRESS,
);

// Blockchain (L1) connection — Cartesi CLI v2 proxies anvil at <node-url>/anvil
export const CHAIN_RPC: string = requireEnv(
  "VITE_CHAIN_RPC",
  import.meta.env.VITE_CHAIN_RPC,
);
export const CHAIN_ID: number = Number(import.meta.env.VITE_CHAIN_ID ?? 31337);
export const CHAIN_NAME: string =
  import.meta.env.VITE_CHAIN_NAME ?? "Anvil (local)";

/** All connection endpoints/addresses MUST come from .env — warn loudly when
 * one is missing instead of silently falling back to a stale hardcoded URL. */
function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    console.error(
      `Missing ${name} in frontend/.env.local — set it and restart the dev server.`,
    );
    return "";
  }
  return value;
}

// ---------------------------------------------------------------------------
// JSON-RPC core
// ---------------------------------------------------------------------------

let rpcId = 0;

export async function rpcCall<T = any>(
  method: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(JSON_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcId, method, params }),
  });
  if (!res.ok) {
    throw new Error(`JSON-RPC HTTP error: ${res.status}`);
  }
  const json = await res.json();
  if (json.error) {
    throw new Error(`RPC error ${json.error.code}: ${json.error.message}`);
  }
  return json.result as T;
}

// ---------------------------------------------------------------------------
// Types (subset of the node v2 JSON-RPC schema)
// ---------------------------------------------------------------------------

export interface RpcPage<T> {
  data: T[];
  pagination: { total_count: number; limit: number; offset: number };
}

export interface CartesiOutput {
  epoch_index: string;
  input_index: string;
  index: string;
  raw_data: string;
  decoded_data: {
    type: string; // "Notice" | "Voucher" | function selector hex
    payload?: string;
    destination?: string;
    value?: string;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

export interface DecodedNotice {
  method: string;
  tx_id: number;
  target: string;
  data: string;
  notice_type: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function hexToUtf8(hex: string): string {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length === 0) return "";
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

function isNotice(output: CartesiOutput): boolean {
  const d = output.decoded_data;
  if (!d || !d.payload) return false;
  // The runtime reports notices either with a literal "Notice" type or with
  // the Notice(bytes) function selector; vouchers always carry a destination.
  if (d.destination) return false;
  return true;
}

function isVoucher(output: CartesiOutput): boolean {
  const d = output.decoded_data;
  return !!d && !!d.destination && !!d.payload;
}

// ---------------------------------------------------------------------------
// Paginated output listing
// ---------------------------------------------------------------------------

export async function listAllOutputs(): Promise<CartesiOutput[]> {
  if (!APPLICATION_ADDRESS) {
    console.error("VITE_DAPP_ADDRESS is not set — cannot query outputs");
    return [];
  }
  const results: CartesiOutput[] = [];
  const limit = 200;
  let offset = 0;
  // Bounded loop: never spin forever even if the node misreports counts.
  for (let page = 0; page < 100; page++) {
    const result = await rpcCall<RpcPage<CartesiOutput>>("cartesi_listOutputs", {
      application: APPLICATION_ADDRESS,
      limit,
      offset,
    });
    results.push(...(result?.data ?? []));
    const total = result?.pagination?.total_count ?? 0;
    offset += limit;
    if (offset >= total) break;
  }
  return results;
}

/** All notices emitted by the backend, decoded into their JSON envelope. */
export async function listDecodedNotices(): Promise<DecodedNotice[]> {
  const outputs = await listAllOutputs();
  const notices: DecodedNotice[] = [];
  for (const output of outputs) {
    if (!isNotice(output)) continue;
    try {
      const parsed = JSON.parse(hexToUtf8(output.decoded_data!.payload!));
      if (parsed && typeof parsed === "object" && parsed.method) {
        notices.push(parsed as DecodedNotice);
      }
    } catch {
      // not a JSON notice — ignore
    }
  }
  return notices;
}

export interface VoucherInfo {
  index: number;
  payload: string;
  destination: string;
  value: string;
  epoch_index: number;
  input_index: number;
  executed: boolean;
  proofReady: boolean;
  /** Full output blob — first argument of Application.executeOutput */
  rawData: string;
  /** Merkle siblings — proof for Application.executeOutput (v2) */
  outputHashesSiblings: string[] | null;
}

/** All vouchers (e.g. CTSI withdrawals) with execution metadata. */
export async function listVouchers(): Promise<VoucherInfo[]> {
  const outputs = await listAllOutputs();
  const vouchers: VoucherInfo[] = [];
  for (const output of outputs) {
    if (!isVoucher(output)) continue;
    const d = output.decoded_data!;
    const siblings = (output as any).output_hashes_siblings ?? null;
    vouchers.push({
      index: parseInt(output.index ?? "0x0", 16),
      payload: d.payload ?? "0x",
      destination: d.destination ?? "",
      value: d.value ?? "0x0",
      epoch_index: parseInt(output.epoch_index ?? "0x0", 16),
      input_index: parseInt(output.input_index ?? "0x0", 16),
      executed: !!(output as any).execution_transaction_hash,
      proofReady: Array.isArray(siblings),
      rawData: output.raw_data ?? "0x",
      outputHashesSiblings: Array.isArray(siblings) ? siblings : null,
    });
  }
  return vouchers;
}

// ---------------------------------------------------------------------------
// Input-processing chaining
// ---------------------------------------------------------------------------

export async function getProcessedInputCount(): Promise<number> {
  const result = await rpcCall<any>("cartesi_getProcessedInputCount", {
    application: APPLICATION_ADDRESS,
  });
  // Result may be a bare hex scalar or wrapped in { data }
  const raw = typeof result === "string" ? result : result?.data;
  return typeof raw === "string" ? parseInt(raw, 16) : Number(raw ?? 0);
}

/**
 * Wait until the node has processed more inputs than `baselineCount`.
 * This is the correct way to chain "send input → refresh state": notices for
 * the new input only exist after this resolves.
 */
export async function waitForInputProcessed(
  baselineCount: number,
  timeoutMs = 60_000,
  pollIntervalMs = 1_500,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const count = await getProcessedInputCount();
      if (count > baselineCount) return true;
    } catch (e) {
      console.warn("waitForInputProcessed poll failed:", e);
    }
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
  console.warn("Timed out waiting for input to be processed");
  return false;
}

// ---------------------------------------------------------------------------
// Inspect (read-only state queries)
// ---------------------------------------------------------------------------

export interface InspectResult {
  ok: boolean;
  reports: string[]; // decoded utf8 payloads
  error?: string;
}

export async function inspectState(path: string): Promise<InspectResult> {
  if (!APPLICATION_ADDRESS) {
    return { ok: false, reports: [], error: "VITE_DAPP_ADDRESS is not set" };
  }
  try {
    const url = `${INSPECT_BASE_URL}/inspect/${APPLICATION_ADDRESS}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: path,
    });
    const result = await response.json();
    if (!response.ok) {
      return {
        ok: false,
        reports: [],
        error: result?.exception_payload ?? String(response.status),
      };
    }
    const status = String(result?.status ?? "").toLowerCase();
    if (status !== "accepted") {
      return {
        ok: false,
        reports: [],
        error: result?.exception_payload ?? result?.status,
      };
    }
    const reports = (result?.reports ?? []).map((r: { payload: string }) =>
      hexToUtf8(r.payload ?? ""),
    );
    return { ok: true, reports };
  } catch (e: any) {
    return { ok: false, reports: [], error: e?.message ?? String(e) };
  }
}
