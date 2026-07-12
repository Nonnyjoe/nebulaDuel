---
name: cartesi-workflow
version: 0.1.0
description: >-
  Starter guide and routing map for the Cartesi Rollups v2 skill pack. Use this
  whenever the user is new to Cartesi, is unsure which skill to load, asks
  about the end-to-end lifecycle of a Cartesi dApp, or wants a high-level
  mental model before diving into a specific layer. This skill does NOT
  implement anything — it only points to the correct downstream skill for
  each phase. Triggers on: "where do I start", "overview", "full stack",
  "cartesi app", "lifecycle", "which skill", "what skill should I use",
  "how does cartesi work", "mental model", "phases", "roadmap", "getting
  started".
---

## Skill Version

| Skill              | Version | Cartesi Rollups target               | Last updated |
| ------------------ | ------- | ------------------------------------ | ------------ |
| `cartesi-workflow` | `0.1.0` | v2.0-alpha (CLI v1.5 and v2.0-alpha) | May 2026     |

> This skill is a **routing layer only**. All implementation detail lives in
> the linked skills. If a downstream skill contradicts this file, the
> downstream skill wins.

# Cartesi Rollups v2 — Workflow & Skill Map

## Goal

Give an agent or developer the **minimum mental model** of a Cartesi dApp,
broken into phases, and route each phase to the skill that owns its
detailed guidance. Read this first when starting a new task or onboarding
into the repo.

## What Cartesi is, in one paragraph

A Cartesi Rollups v2 dApp is a **deterministic backend program** running
inside a RISC-V Cartesi Machine. Inputs arrive on L1 through the
**InputBox** contract; the backend processes them via an `advance_state`
handler, can answer read-only `inspect_state` queries, and emits
**notices**, **reports**, and **vouchers**. A rollups node executes the
machine off-chain, posts claims on-chain, and exposes a **JSON-RPC API**
that frontends and scripts use to read application state and outputs.

A cartesi rollups application has four interacting layers:

| Layer        | What it does                                                  |
| ------------ | ------------------------------------------------------------- |
| **L1**       | InputBox, portals, voucher execution, on-chain ingress/egress |
| **Backend**  | Advance/inspect handlers running inside the Cartesi Machine   |
| **Node**     | Runs the machine, posts claims, exposes JSON-RPC              |
| **Frontend** | Wallets, send inputs, read outputs via JSON-RPC               |

---

## Phases of a Cartesi Application

Each phase has **one primary skill**. Load the primary skill for the phase
you are in; load secondary skills only when the task crosses into their
domain.

### Phase 0 — Plan

Decide the data model, which inputs the dApp accepts, what it emits
(notices / reports / vouchers), and whether any L1 contracts are involved.
This is language-agnostic design work.

- **Primary**: `cartesi-backend-core` — payload contracts, state
  transition model, output semantics, finish-loop correctness.
- **Secondary** (if L1 ingress/egress in scope): `cartesi-contracts`.

### Phase 1 — Scaffold

Create the project skeleton from the Cartesi CLI. One-shot setup.

- **Primary**: `cartesi-scaffold` — `cartesi --version`, `cartesi create`,
  template selection, initial file layout, first `cartesi build`.

### Phase 2 — Backend implementation

Implement the `/finish` loop, advance/inspect handlers, payload codecs,
and output emitters in the chosen language.

- **Primary (always)**: `cartesi-backend-core` — the source of truth for
  determinism and output rules.
- **Then one of**:
  - `cartesi-backend-js-ts` — Node.js / JS / TS backends.
  - `cartesi-backend-py` — Python backends.

### Phase 3 — L1 integration (optional)

Only when inputs originate from a contract (oracle, governance, bridge)
or when vouchers must be executed on-chain.

- **Primary**: `cartesi-contracts` — InputBox, portals, voucher
  execution, Foundry deployment, address book resolution.

### Phase 4 — Frontend / client integration

Wallet flows, sending inputs to InputBox, reading outputs and reports.

- **Primary**: `cartesi-frontend` — wallet, app I/O, configuration,
  optional asset bridging.
- **Secondary (programmatic clients)**: `cartesi-jsonrpc` — node JSON-RPC
  2.0 reference for scripts, bots, indexers.

### Phase 5 — Local run & test

Build the machine image, run a local devnet, send advance/inspect
requests, read outputs, optionally fork a real chain.

- **Primary**: `cartesi-local-dev` — `cartesi build`, `cartesi run`,
  devnet tokens, forked-chain testing.

### Phase 6 — Deploy

Deploy to a self-hosted node (testnet or production-style) using the
Mugen-Builders Docker Compose setup.

- **Primary**: `cartesi-deploy` — compose flow, `.env`, app registration,
  lifecycle management, node component reference.

### Ongoing — Debug

Triggered whenever something fails or behaves unexpectedly at any layer.

- **Primary**: `cartesi-debug` — symptom-indexed troubleshooting across
  CLI, build, node, advance/inspect, vouchers, and chain interaction.

---

## Phase → primary skill at a glance

| Phase                            | Primary skill                              | Common companion skills              |
| -------------------------------- | ------------------------------------------ | ------------------------------------ |
| 0 — Plan                         | `cartesi-backend-core`                     | `cartesi-contracts`               |
| 1 — Scaffold                     | `cartesi-scaffold`                         | —                                    |
| 2 — Backend implementation       | `cartesi-backend-core` + language skill    | `cartesi-contracts`               |
| 3 — L1 integration               | `cartesi-contracts`                     | `cartesi-backend-core`               |
| 4 — Frontend / client            | `cartesi-frontend`                         | `cartesi-jsonrpc`                    |
| 5 — Local run & test             | `cartesi-local-dev`                        | `cartesi-jsonrpc`, `cartesi-debug`   |
| 6 — Deploy                       | `cartesi-deploy`                           | `cartesi-debug`                      |
| Ongoing — Debug                  | `cartesi-debug`                            | layer-specific skill                 |

---

## Quick decision lookup

| User says…                                              | Load this skill              |
| ------------------------------------------------------- | ---------------------------- |
| "create a new Cartesi app" / "scaffold"                 | `cartesi-scaffold`           |
| "write advance/inspect handlers"                        | `cartesi-backend-core` + language skill |
| "Python backend" / "JS backend" / "TS backend"          | `cartesi-backend-py` or `cartesi-backend-js-ts` |
| "Solidity" / "InputBox" / "portal" / "voucher exec"     | `cartesi-contracts`       |
| "React" / "Next.js" / "wallet" / "wagmi" / "viem"       | `cartesi-frontend`           |
| "query the node from a script" / "list outputs"         | `cartesi-jsonrpc`            |
| "run locally" / "cartesi run" / "send a test input"     | `cartesi-local-dev`          |
| "deploy" / "self-hosted" / "Docker Compose" / "Sepolia" | `cartesi-deploy`             |
| "error" / "failed" / "stuck" / "not working"            | `cartesi-debug`              |
| "what is Cartesi" / "where do I start"                  | stay in `cartesi-workflow`   |

---

## What this skill is NOT

- It is **not a tutorial**. It does not show code, commands, or payload
  schemas.
- It does **not** replace any downstream skill. Always load the relevant
  phase skill before implementing anything.
- It is **not a scaffold** — that is `cartesi-scaffold`.
- It is **not a planning document generator** — planning detail lives in
  `cartesi-backend-core` and `cartesi-contracts`.

## Agent checklist

- [ ] Identified the user's current phase (0–6 or debug)
- [ ] Loaded the **primary** skill for that phase
- [ ] Loaded any **companion** skill if the task crosses layers
- [ ] If unsure of CLI/project version, deferred to `cartesi-scaffold` Step 0
  or `cartesi-debug` Layer 0
- [ ] Did not implement directly from this skill — used downstream skills

## Resources

> **Conflict rule**: If any resource below contradicts guidance in a
> downstream skill, the downstream skill wins.

- [Cartesi Rollups v2 Overview](https://docs.cartesi.io/cartesi-rollups/2.0/) — architecture and mental model
- [Cartesi Rollups v2 Installation](https://docs.cartesi.io/cartesi-rollups/2.0/development/installation/) — CLI and prerequisites
- [Cartesi Rollups GitHub](https://github.com/cartesi/rollups-node) — node source
