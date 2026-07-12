# Nebula Duel — Frontend

The cinematic Lovable redesign, now wired to the live Cartesi Rollups v2 backend
in [`../app`](../app). It uses the original game's proven stack — **React Router
+ thirdweb/ethers + React Three Fiber** on **React 18** — with a plain Vite SPA
build (no SSR).

## Run it

```bash
# 1) Start the Cartesi app (from ../app)
cd ../app && cartesi build && cartesi run    # prints node URL + deployed addresses

# 2) Configure the frontend
cd ../new-frontend
cp .env.example .env.local                   # fill from the `cartesi run` output
npm install --legacy-peer-deps               # web3 + R3F peer ranges require this
npm run dev                                   # http://localhost:5173
```

`.env.local` keys (all from the `cartesi run` deployment output):

| Key | Meaning |
|-----|---------|
| `VITE_DAPP_ADDRESS` / `VITE_INPUTBOX_ADDRESS` | application + InputBox contracts |
| `VITE_INSPECT_URL` / `VITE_JSONRPC_URL` / `VITE_CHAIN_RPC` | node inspect, JSON-RPC, and proxied anvil endpoints |
| `VITE_CHAIN_ID` / `VITE_CHAIN_NAME` | local chain id / label |
| `VITE_ERC20_PORTAL` / `VITE_CTSI_ADDRESS` | CTSI deposits |
| `VITE_ERC721_PORTAL` / `VITE_NEBULA_NFT_ADDRESS` | NFT character bridge |
| `VITE_THIRDWEB_CLIENT_ID` | wallet connect (a dev fallback is baked in) |

Without a node the app still renders — reads fail gracefully into loading/empty
states (the "conditional display" behavior).

## Architecture

- **`src/lib/cartesi/`** — the integration layer (ported from the old frontend):
  `client.ts` (JSON-RPC + inspect + voucher listing), `inputs.ts`
  (InputBox.addInput writes), `inspect.ts`, `vouchers.ts`, `portals.ts`
  (ERC20/721 deposits), `game-types.ts` (battle/campaign types + fetchers +
  biome themes), `market.ts`, `duels.ts`, `signer.ts`.
- **`src/hooks/`** — `useWallet` (thirdweb), `useProfile` (gates on a registered
  player), `useSendInput` (write → wait-for-processed → invalidate → toast),
  `game.ts` (TanStack Query read hooks), `useVouchers`.
- **`src/lib/game/`** — `characters.ts` (the 20 original characters + 3D models +
  portraits), `warrior-adapter.ts` (character → card shape), `arenas.ts`
  (unified random arena pool).
- **`src/components/game/BattleStage3D.tsx`** — the original 3D battle engine
  (R3F). Same characters/moves; battle audio routed through the new `sound.ts`
  SFX engine, with the new super-power **VFX sprites** overlaid per power hit.
  `BattleArena.tsx` feeds it a backend battle report.
- **Routes** (`src/routes/*`, React Router via `src/app-routes.tsx`): home,
  market, campaign, duels, create-duel, battle, replay (3D), results, profile,
  leaderboard, codex, warrior/:id, wallet, join/:duelId, admin.

## Flow coverage

Wired to the backend: connect + `create_player` gate, recruit
(`purchase_single_character`), P2P/AI duels (`create_duel` / `create_ai_duel` →
`set_strategy` / `select_ai_battle_strategy` → 3D replay), `join_duel`, campaign
(`play_campaign_level` → 3D replay), marketplace trade/charms/listings, funding
(deposit / `withdraw` + voucher execution), NFT bridge, `purchase_points`,
`claim_daily_reward`, leaderboards, achievements, and an admin console.

Follow-ups: commit-reveal for staked duels (currently uses `set_strategy`),
in-place profile editing (`modify_monika` / `modify_avatar`), and ghost battles.
