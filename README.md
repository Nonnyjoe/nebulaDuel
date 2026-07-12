# Nebula Duel

**A fully on-chain auto-battler running inside a Cartesi Rollups v2 machine.**
Every battle is computed deterministically in a verifiable RISC-V machine — outcomes can't be faked, by anyone, including us.

![Cartesi Rollups v2](https://img.shields.io/badge/Cartesi-Rollups%20v2-45f882) ![Rust backend](https://img.shields.io/badge/backend-Rust-orange) ![React frontend](https://img.shields.io/badge/frontend-React%2018-blue)

---

## What this is (honestly)

Nebula Duel is a working testnet prototype. The features below are **implemented and functional**; anything not listed here doesn't exist yet.

### Implemented

- **Profiles & roster** — create a profile (1050 free points), claim a one-time 3-warrior starter team, recruit more from a 20-character catalog with battle points (escalating premium + 6h cooldown, anti-farm) or deposited CTSI.
- **P2P duels** — open lobby, optional CTSI staking, 4 targeting strategies. Committed strategies are **hidden until both sides commit** (anti-front-running). Initiative goes to the faster squad. Winners earn points.
- **AI duels** — Easy/Hard PvE against the Nebula AI.
- **Campaign** — 20 hand-designed levels across 6 elemental biomes; 7 elements with matchup triangles, 13 unique special powers, energy bars, retry costs, decaying replay rewards, permanent first-clear stat boosts, milestone titles, and a leaderboard.
- **Battle charms** — 11 consumable boosters (elemental sigils, wards, salves…), max 2 per battle, consumed win-or-lose.
- **Marketplace** — list/delist/reprice/buy warriors P2P in CTSI with a configurable platform fee (default 3%); admin fee withdrawal emits real v2 vouchers.
- **Money rails** — CTSI deposit via the v2 ERC-20 portal, withdrawal via v2 vouchers (`Application.executeOutput`), executed from the Assets Manager UI.
- **3D battle replay** — single-scene three.js stage: fighters run to their targets, named attack/hit/death/victory animations, floating damage, screen shake, procedural biome arenas, and fully synthesized Web Audio music/SFX.

### Not implemented (planned)

- $nebular token (the `nebula_token_balance` field is reserved, unused)
- NFT bridge to the Tableland ERC-721 contract in `Dynamic_NFT/` (contract exists but is **not wired** to the game)
- Tournaments, ghost-battle PvP/ELO, daily quests, rarity/XP

## Architecture

```
React 18 + Vite + thirdweb + three.js        (frontend/)
        │  InputBox.addInput / portals             ▲ reads
        ▼                                          │
L1 chain (local Anvil or Base Sepolia)             │
        │ inputs                                   │
        ▼                                          │
Cartesi Rollups v2 node ──► RISC-V machine: Rust backend (app/src)
        ├─ notices/reports ──► JSON-RPC + Inspect APIs ──► frontend
        └─ vouchers (CTSI withdrawals, treasury) ──► executeOutput on L1
```

- Backend: pure Rust, ~30 advance handlers + 18 inspect routes, in-machine state, deterministic LCG randomness (PvE only).
- All contract addresses are **env-configurable** (`ERC20_PORTAL_ADDRESS`, `CTSI_TOKEN_ADDRESS`, `ADMIN_ADDRESS`, …) with local-Anvil defaults.

## Run locally

Prereqs: Docker, [Cartesi CLI](https://docs.cartesi.io/cartesi-rollups/), Node 18+, a browser wallet.

```bash
# 1. Build & run the Cartesi machine + local chain
cd app
cartesi build
cartesi run        # note the printed port (e.g. 6751) and application address

# 2. Configure the frontend
cd ../frontend
cp .env.example .env.local   # then fill in the values printed by `cartesi run`

# 3. Start the frontend
npm install
npm run dev        # http://localhost:5173
```

`.env.local` keys: `VITE_DAPP_ADDRESS`, `VITE_INPUTBOX_ADDRESS`, `VITE_JSONRPC_URL`, `VITE_INSPECT_URL`, `VITE_CHAIN_RPC` (use `<node-url>/anvil`), `VITE_CHAIN_ID`, `VITE_ERC20_PORTAL`, `VITE_CTSI_ADDRESS`, plus your own Pinata keys for avatar upload (`VITE_PINATA_API_KEY`, `VITE_PINATA_SECRET_API_KEY`). **Never commit real keys.**

## Tests

```bash
cd app
cargo test    # battle math, element/biome multipliers, campaign determinism, charm rules, mint economics
```

## Repository map

| Path | Contents |
|---|---|
| `app/src/` | Rust backend: `advance_router`, `inspect_router`, `battle_challenge`, `campaign`, `charms`, `market_place`, `players_profile`, … |
| `frontend/src/` | React app: `components/battle/BattleStage` (3D engine), `utils/cartesi.ts` (v2 client), campaign/marketplace pages |
| `Dynamic_NFT/` | UUPS ERC-721 + Tableland contract — **not yet wired into the game** |
| `REVIEW.md` | Full product & technical audit with remediation log |

## Known limitations

See `REVIEW.md` for the complete audit. Headlines: balances are float-typed (integer-wei migration pending), duels use a simpler engine than the campaign (unification pending), notices carry full state snapshots (delta migration pending), and strategy hiding is serialization-level rather than full commit-reveal.

## License

Apache-2.0 — see `LICENSE`.
