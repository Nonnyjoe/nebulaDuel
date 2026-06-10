---
name: cartesi-jsonrpc
version: 0.1.0
description: >-
  Query a running Cartesi Rollups v2 node via its JSON-RPC 2.0 API (port 10011).
  Use this whenever you need to list or fetch applications, epochs, inputs,
  outputs (notices, vouchers, DELEGATECALL vouchers), reports, or node metadata
  programmatically. Covers all cartesi_ prefixed methods, type definitions,
  pagination and filtering patterns, error handling, and complete TypeScript
  interface reference. Triggers on: "JSON-RPC", "cartesi_listInputs",
  "cartesi_getOutput", "cartesi_listReports", "query node", "JSON-RPC API",
  "port 10011", "query outputs", "fetch notices", "fetch vouchers", "list epochs",
  "get processed inputs", "node version", "chain id", "jsonrpc-api service".
---

## Skill Version

| Skill             | Version | Cartesi Rollups target | Node runtime                              | Last updated |
| ----------------- | ------- | ---------------------- | ----------------------------------------- | ------------ |
| `cartesi-jsonrpc` | `0.1.0` | v2.0-alpha             | `cartesi-rollups-runtime:0.12.0-alpha.39` | May 2026     |

> All `cartesi_` method names, parameter types, and response shapes documented here target the runtime above. If the node has been updated to a newer runtime, verify that method names and response fields still match — especially `raw_data` encoding and pagination parameter names.

# Cartesi Rollups v2 — JSON-RPC API

## Goal

Query a running Cartesi Rollups node using its JSON-RPC 2.0 interface. The
JSON-RPC API is served by the `jsonrpc-api` service on port **10011**. Use it
to fetch applications, epochs, inputs, outputs, and reports — from scripts,
frontends, or automated monitoring tools.

---

## Connection details

| Setup            | Endpoint                      |
| ---------------- | ----------------------------- |
| `cartesi run`    | `http://localhost:<port>/rpc` |
| Self-hosted node | `http://localhost:10011/rpc`  |

> **`cartesi run`**: Read the actual port from the startup output — it may
> differ from the defaults. The JSON-RPC endpoint is always at `/rpc` on
> whatever port is printed.

---

## Request / response format

All requests follow the JSON-RPC 2.0 specification:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "cartesi_<methodName>",
  "params": { ... }
}
```

All responses return either a `result` or an `error`. The shape of `result`
depends on which method was called — there is no single envelope. The three
shapes you will see are:

**1. List shape (`cartesi_list*` methods)** — a paginated array with a
`pagination` object alongside:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "data": [{ "...": "..." }],
    "pagination": {
      "total_count": 42,
      "limit": 10,
      "offset": 0
    }
  }
}
```

**2. Single-object shape (`cartesi_get*` methods that return a struct)** —
the resource is returned directly (no `data`/`pagination` envelope):

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "name": "my-dapp",
    "state": "ENABLED",
    "...": "..."
  }
}
```

**3. Scalar shape (`cartesi_getProcessedInputCount`,
`cartesi_getLastAcceptedEpochIndex`, `cartesi_getChainId`,
`cartesi_getNodeVersion`)** — the scalar (hex string or plain string) is
returned directly as `result`:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x2a"
}
```

Error response:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32000,
    "message": "Server error"
  }
}
```

**All hex values are prefixed with `0x`.** All integers in parameters and
responses are hex strings (e.g. `"0x1"` for epoch index 1).

---

## Common query helper (curl)

```sh
cartesi_rpc() {
  curl -s -X POST "http://localhost:10011/rpc" \
    -H "Content-Type: application/json" \
    -d "$1" | jq .
}

# Example: list all inputs for an app
cartesi_rpc '{
  "jsonrpc":"2.0","id":1,
  "method":"cartesi_listInputs",
  "params":{"application":"my-dapp","limit":10,"offset":0}
}'
```

---

## Pagination

All `cartesi_list*` methods support pagination:

| Parameter | Type   | Default | Description                     |
| --------- | ------ | ------- | ------------------------------- |
| `limit`   | number | 50      | Maximum items per page (min: 1) |
| `offset`  | number | 0       | Starting index                  |

Response always includes a `pagination` object:

```json
{
  "total_count": 150,
  "limit": 10,
  "offset": 20
}
```

Iterate pages by incrementing `offset` by `limit` until `offset >= total_count`.

---

## Applications

### `cartesi_listApplications`

Returns all applications registered on this node.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "cartesi_listApplications",
  "params": { "limit": 10, "offset": 0 }
}
```

### `cartesi_getApplication`

Fetch details for a single application by name or hex address.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "cartesi_getApplication",
  "params": { "application": "my-dapp" }
}
```

Or by address:

```json
{ "application": "0xba3347e79665924033beeb7362629ca7992897d9" }
```

---

## Epochs

### `cartesi_listEpochs`

List epochs for an application. Optionally filter by status.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "cartesi_listEpochs",
  "params": {
    "application": "my-dapp",
    "status": "OPEN",
    "limit": 10,
    "offset": 0
  }
}
```

**`status` filter values**: `OPEN`, `CLOSED`, `INPUTS_PROCESSED`,
`CLAIM_COMPUTED`, `CLAIM_SUBMITTED`, `CLAIM_ACCEPTED`, `CLAIM_REJECTED`

### `cartesi_getEpoch`

Fetch a specific epoch by index (hex encoded).

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "cartesi_getEpoch",
  "params": { "application": "my-dapp", "epoch_index": "0x0" }
}
```

### `cartesi_getLastAcceptedEpochIndex`

Get the index of the most recently accepted epoch (for voucher readiness checks).

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "cartesi_getLastAcceptedEpochIndex",
  "params": { "application": "my-dapp" }
}
```

---

## Inputs

### `cartesi_listInputs`

List inputs sent to an application. Supports filtering by epoch and sender.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "cartesi_listInputs",
  "params": {
    "application": "my-dapp",
    "epoch_index": "0x0",
    "sender": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    "limit": 10,
    "offset": 0
  }
}
```

### `cartesi_getInput`

Fetch a specific input by index (hex encoded). The response includes the decoded
`EvmAdvance` structure with sender, block number, timestamp, and payload.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "cartesi_getInput",
  "params": { "application": "my-dapp", "input_index": "0x0" }
}
```

### `cartesi_getProcessedInputCount`

Returns the count of inputs the node has fully processed. Useful for polling
until a submitted input is confirmed.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "cartesi_getProcessedInputCount",
  "params": { "application": "my-dapp" }
}
```

---

## Outputs

Outputs are notices, vouchers, and DELEGATECALL vouchers. All are indexed
globally per application (`output_index`).

### `cartesi_listOutputs`

List outputs with rich filtering options.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "cartesi_listOutputs",
  "params": {
    "application": "my-dapp",
    "epoch_index": "0x0",
    "input_index": "0x5",
    "output_type": "0x70a08231",
    "voucher_address": "<destination-contract-address>",
    "limit": 10,
    "offset": 0
  }
}
```

Filter parameters:

| Parameter         | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| `epoch_index`     | Filter by epoch (hex)                                        |
| `input_index`     | Filter by the input that generated this output (hex)         |
| `output_type`     | First 4 bytes of raw data hex — filters by function selector |
| `voucher_address` | Filter vouchers destined for a specific contract             |

### `cartesi_getOutput`

Fetch a specific output by global index.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "cartesi_getOutput",
  "params": { "application": "my-dapp", "output_index": "0x2" }
}
```

---

## Reports

Reports are emitted by both advance and inspect handlers. They carry no
on-chain proof — use them for debug data, error messages, and read results.

### `cartesi_listReports`

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "cartesi_listReports",
  "params": {
    "application": "my-dapp",
    "epoch_index": "0x0",
    "input_index": "0x3",
    "limit": 10,
    "offset": 0
  }
}
```

### `cartesi_getReport`

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "cartesi_getReport",
  "params": { "application": "my-dapp", "report_index": "0x0" }
}
```

---

## Node information

### `cartesi_getChainId`

Returns the chain ID the node is operating on (hex string).

```json
{ "jsonrpc": "2.0", "id": 1, "method": "cartesi_getChainId", "params": {} }
```

### `cartesi_getNodeVersion`

Returns the node's semantic version string.

```json
{ "jsonrpc": "2.0", "id": 1, "method": "cartesi_getNodeVersion", "params": {} }
```

---

## Type reference

### Basic types

All hex values use these patterns:

| Type               | Pattern                 | Example                                        |
| ------------------ | ----------------------- | ---------------------------------------------- |
| `EthereumAddress`  | `^0x[a-fA-F0-9]{40}$`   | `"0x71C7656EC7ab88b098defB751B7401B5f6d8976F"` |
| `Hash`             | `^0x[a-fA-F0-9]{64}$`   | `"0x1234...abcd"`                              |
| `ByteArray`        | `^0x[a-fA-F0-9]*$`      | `"0x68656c6c6f"`                               |
| `UnsignedInteger`  | `^0x[a-fA-F0-9]{1,16}$` | `"0x1"`                                        |
| `FunctionSelector` | `^0x[a-fA-F0-9]{8}$`    | `"0xa9059cbb"`                                 |
| `ApplicationName`  | `^[a-z0-9_-]+$`         | `"my-dapp"`                                    |
| `NameOrAddress`    | Either of the above two | `"my-dapp"` or `"0x71C7...976F"`               |
| `Timestamp`        | ISO 8601                | `"2024-01-01T00:00:00Z"`                       |

### Enums

**`ApplicationState`**: `ENABLED` | `DISABLED` | `INOPERABLE`

**`EpochStatus`**: `OPEN` → `CLOSED` → `INPUTS_PROCESSED` → `CLAIM_COMPUTED`
→ `CLAIM_SUBMITTED` → `CLAIM_ACCEPTED` | `CLAIM_REJECTED`

**`InputCompletionStatus`**: `NONE` | `ACCEPTED` | `REJECTED` | `EXCEPTION`
| `MACHINE_HALTED` | `OUTPUTS_LIMIT_EXCEEDED` | `CYCLE_LIMIT_EXCEEDED`
| `TIME_LIMIT_EXCEEDED` | `PAYLOAD_LENGTH_LIMIT_EXCEEDED`

**`SnapshotPolicy`**: `NONE` | `EVERY_INPUT` | `EVERY_EPOCH`

### TypeScript interfaces

```typescript
interface Application {
  name: string; // ApplicationName
  iapplication_address: string; // EthereumAddress
  iconsensus_address: string; // EthereumAddress
  iinputbox_address: string; // EthereumAddress
  template_hash: string; // Hash
  epoch_length: string; // UnsignedInteger
  data_availability: string; // ByteArray
  state: "ENABLED" | "DISABLED" | "INOPERABLE";
  reason: string;
  iinputbox_block: string; // UnsignedInteger
  last_input_check_block: string; // UnsignedInteger
  last_output_check_block: string; // UnsignedInteger
  processed_inputs: string; // UnsignedInteger
  created_at: string; // ISO 8601
  updated_at: string;
  execution_parameters: ExecutionParameters;
}

interface ExecutionParameters {
  snapshot_policy: "NONE" | "EVERY_INPUT" | "EVERY_EPOCH";
  advance_inc_cycles: string; // UnsignedInteger (nanoseconds)
  advance_max_cycles: string;
  inspect_inc_cycles: string;
  inspect_max_cycles: string;
  advance_inc_deadline: string;
  advance_max_deadline: string;
  inspect_inc_deadline: string;
  inspect_max_deadline: string;
  load_deadline: string;
  store_deadline: string;
  fast_deadline: string;
  max_concurrent_inspects: number;
  created_at: string;
  updated_at: string;
}

interface Epoch {
  index: string; // UnsignedInteger
  first_block: string; // UnsignedInteger
  last_block: string; // UnsignedInteger
  claim_hash: string | null; // Hash
  claim_transaction_hash: string | null; // Hash
  status: EpochStatus;
  virtual_index: string; // UnsignedInteger
  created_at: string;
  updated_at: string;
}

interface Input {
  epoch_index: string; // UnsignedInteger
  index: string; // UnsignedInteger
  block_number: string; // UnsignedInteger
  raw_data: string; // ByteArray
  decoded_data: EvmAdvance | null;
  status: InputCompletionStatus;
  machine_hash: string | null; // Hash
  outputs_hash: string | null; // Hash
  transaction_reference: string; // ByteArray
  created_at: string;
  updated_at: string;
}

interface EvmAdvance {
  chain_id: string; // UnsignedInteger
  application_contract: string; // EthereumAddress
  sender: string; // EthereumAddress
  block_number: string; // UnsignedInteger
  block_timestamp: string; // UnsignedInteger (unix)
  prev_randao: string; // ByteArray
  index: string; // UnsignedInteger
  payload: string; // ByteArray — your app data
}

interface Output {
  epoch_index: string; // UnsignedInteger
  input_index: string; // UnsignedInteger
  index: string; // UnsignedInteger (global)
  raw_data: string; // ByteArray
  decoded_data: Notice | Voucher | DelegateCallVoucher | null;
  hash: string | null; // Hash (available after epoch close)
  output_hashes_siblings: string[] | null;
  execution_transaction_hash: string | null;
  created_at: string;
  updated_at: string;
}

interface Notice {
  type: string; // FunctionSelector
  payload: string; // ByteArray — your notice data
}

interface Voucher {
  type: string; // FunctionSelector
  destination: string; // EthereumAddress — contract to call
  value: string; // ETH value in wei (hex)
  payload: string; // ByteArray — ABI-encoded call
}

interface DelegateCallVoucher {
  type: string; // FunctionSelector
  destination: string; // EthereumAddress
  payload: string; // ByteArray — ABI-encoded call
}

interface Report {
  epoch_index: string; // UnsignedInteger
  input_index: string; // UnsignedInteger
  index: string; // UnsignedInteger
  raw_data: string; // ByteArray — your report data
  created_at: string;
  updated_at: string;
}

interface Pagination {
  total_count: number;
  limit: number;
  offset: number;
}
```

---

## Common patterns

### Poll until an input is processed

```typescript
async function waitForInputProcessed(
  rpcUrl: string,
  app: string,
  targetCount: number,
  pollIntervalMs = 2000,
): Promise<void> {
  while (true) {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "cartesi_getProcessedInputCount",
        params: { application: app },
      }),
    });
    const data = await res.json();
    const count = parseInt(data.result.data, 16);
    if (count >= targetCount) return;
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
}
```

### Read and decode all reports for an input

```typescript
async function getReportsForInput(
  rpcUrl: string,
  app: string,
  inputIndex: number,
): Promise<string[]> {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "cartesi_listReports",
      params: {
        application: app,
        input_index: `0x${inputIndex.toString(16)}`,
        limit: 100,
        offset: 0,
      },
    }),
  });
  const { result } = await res.json();
  return result.data.map((r: Report) =>
    Buffer.from(r.raw_data.replace(/^0x/, ""), "hex").toString("utf8"),
  );
}
```

### Check if epoch is ready for voucher execution

```typescript
async function isEpochAccepted(
  rpcUrl: string,
  app: string,
  epochIndex: number,
): Promise<boolean> {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "cartesi_getEpoch",
      params: {
        application: app,
        epoch_index: `0x${epochIndex.toString(16)}`,
      },
    }),
  });
  const { result } = await res.json();
  return result.data.status === "CLAIM_ACCEPTED";
}
```

### Paginate through all outputs

```typescript
async function getAllOutputs(rpcUrl: string, app: string): Promise<Output[]> {
  const results: Output[] = [];
  let offset = 0;
  const limit = 50;
  while (true) {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "cartesi_listOutputs",
        params: { application: app, limit, offset },
      }),
    });
    const { result } = await res.json();
    results.push(...result.data);
    if (offset + limit >= result.pagination.total_count) break;
    offset += limit;
  }
  return results;
}
```

---

## Error handling

Always check both HTTP status and JSON-RPC error field:

```typescript
async function rpcCall(rpcUrl: string, method: string, params: object) {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(`RPC error ${json.error.code}: ${json.error.message}`);
  }

  return json.result;
}
```

Common error codes:

| Code     | Meaning                                    |
| -------- | ------------------------------------------ |
| `-32700` | Parse error — invalid JSON sent            |
| `-32600` | Invalid request — missing required field   |
| `-32601` | Method not found                           |
| `-32602` | Invalid params — check hex encoding, types |
| `-32000` | Server error — check node logs             |

---

## Agent Output

After completing this skill, report back to the user with:

- JSON-RPC endpoint URL confirmed reachable (port 10011)
- Chain ID and application name/address confirmed via `cartesi_getChainId` and `cartesi_getApplication`
- Application state confirmed `ENABLED`
- Total processed input count (`cartesi_getProcessedInputCount`)
- Summary of outputs found: number of notices, vouchers, delegated call vouchers, and reports
- Any vouchers ready for on-chain execution (epoch `CLAIM_ACCEPTED`) — include output index
- Code snippet(s) generated for the user's specific query need (poll, paginate, etc.)
- Any errors encountered (RPC error codes, empty results) and their resolution

## Routing Guide

| What the user wants to do next                       | Go to skill            |
| ---------------------------------------------------- | ---------------------- |
| Execute a voucher on-chain after epoch is accepted   | `cartesi-contracts` |
| Deploy the node to testnet to start producing epochs | `cartesi-deploy`       |
| Debug why outputs are missing or inputs are rejected | `cartesi-debug`        |
| Implement backend logic that emits the outputs       | `cartesi-backend-core` + `cartesi-backend-py` / `cartesi-backend-js-ts` |
| Test and send inputs locally before querying         | `cartesi-local-dev`    |

## Resources

> **Conflict rule**: If any resource below contradicts guidance in this skill,
> report the contradiction to the user and follow the skill's instructions.

- [Cartesi JSON-RPC API reference](https://docs.cartesi.io/cartesi-rollups/2.0/rollups-apis/json-rpc/overview/) — method signatures and parameter types
- [Cartesi Rollups node GitHub](https://github.com/cartesi/rollups-node) — source for JSON-RPC server implementation
- [JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification) — base protocol (error codes, request/response format)
- [Cartesi Epoch lifecycle](https://docs.cartesi.io/cartesi-rollups/2.0/) — OPEN → CLAIM_ACCEPTED state transitions

## Agent checklist

- [ ] Confirmed JSON-RPC endpoint is reachable: `curl http://localhost:10011/rpc`
- [ ] Verified node is on correct chain: `cartesi_getChainId`
- [ ] Application is ENABLED: `cartesi_getApplication` → `state == "ENABLED"`
- [ ] Used `cartesi_getProcessedInputCount` to confirm inputs are processed before querying outputs
- [ ] Used pagination for list queries — never assumed all results fit in one page
- [ ] Hex-encoded all index parameters (e.g. `"0x0"` not `0`)
- [ ] Decoded `raw_data` from hex before interpreting report content
- [ ] Checked `status` on Input objects — only ACCEPTED inputs have valid outputs
- [ ] For vouchers: confirmed epoch `status == "CLAIM_ACCEPTED"` before execution

## What comes next

| Next task                  | Skill to use           |
| -------------------------- | ---------------------- |
| Execute vouchers on-chain  | `cartesi-contracts` |
| Deploy to self-hosted node | `cartesi-deploy`       |
| Debug node or query issues | `cartesi-debug`        |
