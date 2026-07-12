/**
 * Unified Cartesi Rollups v2 client for NebulaDuel.
 *
 * Reads  : node JSON-RPC API (cartesi_* methods) + inspect endpoint
 * Writes : InputBox.addInput on L1 (see inputs.ts)
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
      `Missing ${name} in new-frontend/.env.local — set it and restart the dev server.`,
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
  // Generous by default: the node must (1) ingest the input from L1 and
  // (2) run advance_state. On testnet that L1→node hop can take a while.
  timeoutMs = 120_000,
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
// State-condition polling
//
// After an input is ACCEPTED, confirm the *expected state change* is actually
// visible via inspect before telling the user "done". This is a bounded poll
// loop (not a single delayed retry): it re-reads on an interval until the
// predicate holds or a generous deadline passes, busting the inspect cache each
// attempt so every read is fresh.
// ---------------------------------------------------------------------------

export interface PollOptions {
  timeoutMs?: number;
  intervalMs?: number;
  /** runs before each attempt — used to bust read caches for fresh data */
  beforeEach?: () => void;
}

export async function pollUntil<T>(
  fetcher: () => Promise<T>,
  predicate: (value: T) => boolean,
  opts: PollOptions = {},
): Promise<boolean> {
  const timeoutMs = opts.timeoutMs ?? 90_000;
  const intervalMs = opts.intervalMs ?? 2_000;
  const start = Date.now();
  // Immediate first attempt, then poll on the interval until the deadline.
  for (;;) {
    opts.beforeEach?.();
    try {
      const value = await fetcher();
      if (predicate(value)) return true;
    } catch {
      /* transient read error — keep polling */
    }
    if (Date.now() - start >= timeoutMs) return false;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

// ---------------------------------------------------------------------------
// Input outcome — did the backend ACCEPT or REJECT this input?
//
// `processed` only means the node consumed the input; the dapp can still reject
// it (handle_advance returns "reject"). The authoritative signal is the input's
// InputCompletionStatus; on rejection the backend also emits a report
// {"error": "...", "status": "rejected"} we can surface to the user.
// ---------------------------------------------------------------------------

export interface InputOutcome {
  accepted: boolean;
  status: string;
  error?: string;
}

const TERMINAL_FAIL = new Set([
  "REJECTED",
  "EXCEPTION",
  "MACHINE_HALTED",
  "OUTPUTS_LIMIT_EXCEEDED",
  "CYCLE_LIMIT_EXCEEDED",
  "TIME_LIMIT_EXCEEDED",
  "PAYLOAD_LENGTH_LIMIT_EXCEEDED",
]);

async function inputStatus(inputIndex: number): Promise<string> {
  try {
    const input = await rpcCall<any>("cartesi_getInput", {
      application: APPLICATION_ADDRESS,
      input_index: "0x" + inputIndex.toString(16),
    });
    const raw =
      typeof input === "object" ? input?.status ?? input?.data?.status : undefined;
    return typeof raw === "string" ? raw : "NONE";
  } catch {
    return "NONE";
  }
}

/** First `{"error": ...}` report the backend emitted for this input, if any. */
async function firstErrorReport(inputIndex: number): Promise<string | undefined> {
  try {
    const res = await rpcCall<RpcPage<{ raw_data?: string }>>(
      "cartesi_listReports",
      {
        application: APPLICATION_ADDRESS,
        input_index: "0x" + inputIndex.toString(16),
        limit: 50,
        offset: 0,
      },
    );
    for (const r of res?.data ?? []) {
      try {
        const j = JSON.parse(hexToUtf8(r.raw_data ?? ""));
        if (j && j.error) return String(j.error);
      } catch {
        /* not a JSON error report */
      }
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

/**
 * Definitive accept/reject for a processed input, with the backend's error
 * message when it was rejected. Retries briefly while the status is still
 * non-terminal.
 */
export async function getInputOutcome(inputIndex: number): Promise<InputOutcome> {
  let status = "NONE";
  for (let i = 0; i < 4; i++) {
    status = await inputStatus(inputIndex);
    if (status === "ACCEPTED" || TERMINAL_FAIL.has(status)) break;
    await new Promise((r) => setTimeout(r, 800));
  }
  if (status === "ACCEPTED") return { accepted: true, status };
  const error = await firstErrorReport(inputIndex);
  if (TERMINAL_FAIL.has(status)) return { accepted: false, status, error };
  // Status indeterminate — trust an error report if one exists, else assume ok.
  return { accepted: !error, status, error };
}

// ---------------------------------------------------------------------------
// Inspect (read-only state queries)
// ---------------------------------------------------------------------------

export interface InspectResult {
  ok: boolean;
  reports: string[]; // decoded utf8 payloads
  error?: string;
}

// Lightweight read cache: identical inspect calls within TTL share one result,
// and concurrent identical calls are de-duplicated into a single request. This
// cuts the RPC chatter from pages that fetch on mount across multiple
// components. Writes should call `clearInspectCache()` to force fresh reads.
const INSPECT_TTL_MS = 4000;
const inspectCache = new Map<string, { at: number; value: InspectResult }>();
const inspectInflight = new Map<string, Promise<InspectResult>>();

/** Drop all cached inspect results (call after a state-changing input). */
export function clearInspectCache(): void {
  inspectCache.clear();
  inspectInflight.clear();
}

export async function inspectState(path: string): Promise<InspectResult> {
  const cached = inspectCache.get(path);
  if (cached && Date.now() - cached.at < INSPECT_TTL_MS) {
    return cached.value;
  }
  const inflight = inspectInflight.get(path);
  if (inflight) return inflight;

  const req = inspectStateUncached(path).then((value) => {
    // Only cache successful reads; errors should be retried freely.
    if (value.ok) inspectCache.set(path, { at: Date.now(), value });
    inspectInflight.delete(path);
    return value;
  });
  inspectInflight.set(path, req);
  return req;
}

async function inspectStateUncached(path: string): Promise<InspectResult> {
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
