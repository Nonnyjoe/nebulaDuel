---
name: cartesi-frontend
version: 0.1.0
description: >-
  Build Cartesi Rollups v2 frontend applications with clear module boundaries
  and predictable runtime behavior: wallet integration, app I/O, configuration,
  and optional asset bridging. Use this whenever the user asks for React/Next.js/
  Angular (or any web frontend) that connects wallets, sends inputs to InputBox,
  reads machine state via Cartesi JSON-RPC, or uses @cartesi/wagmi and
  @cartesi/viem packages. If the user provides or references a project
  DESIGN.md, treat it as the primary visual design authority and follow Google
  DESIGN.md format/spec conventions.
---

# Cartesi Rollups v2 frontend app

## Objective

Implement a minimal but production-shaped Cartesi frontend with clean separation and explicit operational checks:

- **Wallet operations** (connect, disconnect, account, chain);
- **App interactions (I/O)** (send inputs, read outputs/reports through JSON-RPC);
- **Configuration** (addresses, RPC URLs, chain and environment setup);
- **Asset bridging** as a **separate component** only when needed.

Use vanilla CSS by default. Only switch UI styling approach if the user provides a specific design spec (for example, `DESIGN.md`).

## Instruction precedence for design

When frontend design directions conflict, apply this order:

1. User's explicit request in the current chat.
2. Project `DESIGN.md` (for example `cartesi-frontend/DESIGN.md`).
3. This `SKILL.md` default UI guidance (vanilla CSS, simple components).

If a developer wants a different design and provides/updates `DESIGN.md`, that file overrides this skill's default styling guidance.

## Authoritative references

- React frontend reference:
  [Build a React frontend for Cartesi Apps](https://docs.cartesi.io/cartesi-rollups/2.0/tutorials/react-frontend-application/)
- JSON-RPC methods and data model:
  [Cartesi Rollups v2 JSON-RPC Overview](https://docs.cartesi.io/cartesi-rollups/2.0/api-reference/jsonrpc/overview/)
- Advance/inspect flow and inspect endpoint usage:
  [Sending inputs and assets](https://docs.cartesi.io/cartesi-rollups/2.0/development/send-inputs-and-assets/)
- For non-React frameworks (Next.js, Angular, others), use each framework's official docs for app structure and rendering conventions:
  - [Next.js Docs](https://nextjs.org/docs)
  - [Angular Docs](https://angular.dev/overview)

## Inputs expected from user

- Target framework (`react`, `next`, `angular`, etc.)
- Environment (`local devnet`, `sepolia`, other chain)
- Application address and Cartesi RPC URL
- Whether asset bridging is required
- Whether a design spec exists (`DESIGN.md` / `design.md`)

## Dependency policy (Cartesi alphas)

Always prefer explicit versions over `@alpha` tags for Cartesi packages.

Reason: `@alpha` can resolve to an older prerelease (for example `alpha.0`) instead of the newest.

Recommended workflow:

```sh
pnpm view @cartesi/wagmi versions --json
pnpm view @cartesi/viem versions --json
```

Then pin latest compatible alphas explicitly, and align peers:

- `@cartesi/wagmi` currently expects `wagmi@^3` and `react@^19`.
- If peer constraints differ from project constraints, explain the tradeoff and choose a consistent set.

## Required architecture

Keep these concerns in distinct modules/files:

1. **Configuration layer**
   - Environment parsing and validation (`APP_ADDRESS`, Cartesi JSON-RPC URL, chain IDs, local L1 RPC URL).
   - Typed config object and validation on startup.
   - No wallet or business logic in config module.
   - For local runs, include explicit local chain settings (for example `VITE_ANVIL_RPC_URL`, `VITE_L1_CHAIN_ID`).

2. **Wallet layer**
   - Wallet connectors (in-browser injected wallet recommended by default).
   - Connection state and account/chain helpers.
   - No InputBox calls or JSON-RPC data fetching here.
   - Prefer one primary connect action (`Connect Wallet`) rather than mapping every discovered connector.

3. **Cartesi I/O layer**
   - Send input payloads to InputBox contract.
   - Read notices, vouchers, delegated vouchers, reports, and input/epoch status via Cartesi JSON-RPC.
   - Provide inspect call helpers as a read-only state check path (`POST /inspect/<application>`).
   - Data transformation utilities (hex <-> utf-8, formatting and pagination).
   - Support response shape compatibility across alpha versions (for example `decoded_data.type` / `decoded_data.payload` vs older `output_type` / `payload` fields).

4. **UI layer**
   - Composes wallet + I/O modules into components/pages.
   - Uses vanilla CSS unless design requirements override.

5. **Optional asset bridging layer**
   - Separate component(s) for Ether/ERC20/ERC721 deposit/withdraw bridge interactions.
   - Do not mix bridge code into base input/output components.

## Implementation workflow

### 1) Scaffold for target framework

- **React**: follow Cartesi's React tutorial shape for providers/components.
- **Next.js/Angular/etc.**: apply same Cartesi integration model, but follow official framework conventions for routing, SSR, and state boundaries.

### 2) Set up providers and wallet

- Configure wagmi client and connectors.
- Prefer injected in-browser wallet as the default connector unless user asks otherwise.
- Add `CartesiProvider` (or equivalent integration point) with JSON-RPC URL from config.
- For local environments, define and use an explicit local chain object with correct chain ID and RPC URL.

### 3) Send inputs through InputBox

- Use wallet client extended with Cartesi L1 actions from `@cartesi/viem`.
- Encode payloads (for example with `stringToHex`) consistently with backend expectations.
- Show tx hash and failure states in UI.
- Always preflight before submit:
  - wallet connected,
  - expected chain selected,
  - app address configured,
  - non-empty payload.
- If wallet is not connected, show explicit user feedback (alert and/or inline error), not just a silently disabled path.

### 4) Read machine outputs via JSON-RPC

- Use Cartesi hooks/client from `@cartesi/wagmi` where practical.
- For low-level calls, map to documented JSON-RPC methods:
  - application listing/details
  - epoch listing/details
  - input listing/details and processed count
  - output listing/details
  - report listing/details
- Implement pagination and optional filters (`limit`, `offset`, `epoch_index`, `input_index`, etc.).
- Handle JSON-RPC error objects explicitly.
- Decode outputs from both:
  - `decoded_data` (`type`, `payload`) when present, and
  - legacy/raw payload fields as fallback.

### 5) Add inspect call path for state checks

- Implement a dedicated inspect helper in I/O module, separate from `addInput`:
  - request: `POST <node-url>/inspect/<application-address-or-name>`
  - headers: `Content-Type: application/json`
  - body: inspect payload (for example `JSON.stringify("test")` or app-specific serialized query)
- Parse inspect response reports and decode payloads for UI display.
- Treat inspect as read-only app state check:
  - do not mix inspect endpoint logic with InputBox advance submit logic,
  - keep inspect UI/loading/error state isolated from transaction submit state.
- Add explicit note in generated outputs:
  - inspect is useful for local/testing/debug workflows and may not be reliable in production.

### 6) Add optional bridge component(s)

- Only when app requirements include asset bridging.
- Keep bridge transactions and state in dedicated files/components.
- Reuse shared wallet/config utilities, but keep bridge UI and logic isolated.

## DESIGN.md compliance rules (Google format)

Apply this section when the user provides, references, or requests a `DESIGN.md` file.

### File structure

- Use YAML frontmatter followed by markdown body.
- Keep design tokens machine-readable in frontmatter (`colors`, `typography`, `rounded`, `spacing`, optional `components`).
- Keep rationale in markdown sections.

### Canonical section order

If these sections are present, keep this order:

1. `## Overview` (or `## Brand & Style`)
2. `## Colors`
3. `## Typography`
4. `## Layout` (or `## Layout & Spacing`)
5. `## Elevation & Depth`
6. `## Shapes`
7. `## Components`
8. `## Do's and Don'ts`

### Validation

When `DESIGN.md` is created or updated, run:

```sh
npx @google/design.md lint DESIGN.md
```

Fix high-confidence structural issues (broken refs, invalid section order, malformed tokens) before finalizing.

## Minimal output contract

When generating or refactoring frontend code, return:

- A short module map showing where wallet, config, I/O, and optional bridge live.
- Required environment variables.
- Installed package commands.
- A runnable baseline path (for example: connect wallet -> send input -> read outputs).
- If inspect is implemented, also include:
  - inspect endpoint URL pattern used,
  - sample inspect request payload,
  - where inspect reports are rendered.

Keep examples concise; avoid over-engineering and unnecessary abstractions.

## Quality checks

Before finishing, verify:

- Wallet logic is not mixed with Cartesi JSON-RPC read code.
- Input submission goes through InputBox contract interactions.
- Output/report reads come from Cartesi JSON-RPC API paths or corresponding wrappers.
- Inspect calls are implemented as a separate read path (`/inspect/...`) and not conflated with advance transactions.
- Bridge logic is absent unless requested; if present, it is isolated.
- UI styling is vanilla CSS unless user provided design requirements.
- Local development path is complete when user runs Cartesi locally:
  - local chain config present,
  - wallet can connect and switch,
  - input tx is sent,
  - backend output is visible and decoded in UI,
  - inspect call returns and renders reports for state checks.
