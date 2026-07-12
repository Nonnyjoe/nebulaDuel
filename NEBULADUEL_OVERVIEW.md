# Nebula Duel — Full Game Description

Nebula Duel is an on-chain auto-battler. Players assemble squads of three warriors and fight in player-versus-player duels, against an AI, or through a 20-level story campaign. Every battle is resolved deterministically inside a **Cartesi Rollups v2** machine (a RISC-V virtual computer running a Rust backend), which means each fight is verifiable: the same inputs always produce the same outcome, and anyone can independently re-check a result. The frontend is a React app on **Base Sepolia** with a real 3D battle replay built in three.js.

The core fantasy: you are a commander in the Nebula, recruiting warriors, upgrading them through battle, choosing a combat strategy, and then watching the machine resolve the clash exactly and fairly.

---

## 1. How a match actually works

The game is a *strategy-then-simulation* auto-battler, which suits a blockchain perfectly: a player submits one decision (their squad and a targeting strategy), and the machine plays the whole battle out deterministically.

A duel proceeds: connect wallet → create or join a duel with three warriors → each side picks a strategy → the machine simulates the fight → the result and a full event log are returned and replayed in 3D. The campaign and AI duels follow the same shape but with computer-controlled opponents.

Since the most recent work, **all three modes (PvP, AI, campaign) run on a single unified combat engine**, so a warrior fights identically everywhere — same elements, powers, crits and energy.

---

## 2. The combat engine

### Stats
Every warrior has **health, strength, attack, speed**, a **super power**, an **element**, a **rarity**, and a **level**. Base damage is `strength + attack/2 − defender.speed/4` (floored at 1), then modified by element matchup, biome, crits, and charms.

### Elements (rock-paper-scissors layer)
Seven elements: **Storm, Fire, Nature, Water, Psychic, Shadow, Neutral**. Each warrior's element is derived from its super power. Matchups give a damage multiplier — strong hits deal 130%, weak hits 75%, neutral 100%. Example triangles: Fire > Nature > Water > Fire, and Storm > Psychic > Shadow > Storm, plus thematic crossovers (Storm > Water, Nature > Storm). The full matrix is served to the frontend via the `element_table` inspect route, so there is a single source of truth.

### Biomes (environment layer)
Six biomes — Verdant Wilds, Volcanic Forge, Abyssal Depths, Storm Spire, Astral Plane, Void Nexus — each **boosts** one element (+25%) and **dampens** another (−15%). Campaign levels each have a biome. **PvP duels are fought in a neutral arena** (no biome bias) to keep staked matches fair.

### Super powers (13 unique abilities)
Each warrior owns one power that charges via an energy bar (filled by acting and being hit) and fires when full:

| Power | Effect |
|---|---|
| Thunderbolt | 180% strike, 25% chance to stun |
| Flamethrower | 140% strike + burn for 2 rounds |
| VineWhip | 120% strike, heals caster for half the damage |
| WaterGun | 130% strike, soaks target (−10% attack) |
| SleepSong | 60% strike, puts target to sleep (skips a turn) |
| Psychic | 150% strike that ignores the target's speed |
| Adaptability | strikes with the target's own strength, +15% self attack |
| ShadowBall | 160% strike with 15% lifesteal |
| HeadCrush | 200% strike, 10% self recoil |
| SonicKick | two 90% strikes in one turn |
| TelekineticHit | 140% strike, slows target (−20% speed) |
| InvisibleClaws | 170% strike, guaranteed critical |
| DodgeNdTailLash | 110% strike + dodges the next incoming hit |

### Initiative, crits, and termination
Each round, living units act in order of current speed (id tiebreak). Crits add 50% damage (base 10% chance, raised by charms). The simulation is bounded (max 60 rounds; campaign tie-breaks on remaining health) so a single input can never loop forever — a hard requirement for the Cartesi machine.

### Determinism
The only randomness is a linear-congruential generator seeded from on-chain data (block timestamp, level id, attempt number, or duel id). Same seed → identical battle, so every result replays exactly and can be verified.

---

## 3. Strategies

Before a duel resolves, each side picks a **targeting strategy**. There are six:

1. **Executioner** — focus the enemy with the most health (bring down tanks first)
2. **Assassin** — hunt the weakest enemy (quick knockouts)
3. **Duelist** — challenge the strongest enemy (neutralise their biggest hitter)
4. **Opportunist** — pick off the frailest (lowest strength)
5. **Berserker** — focus the highest-attack threat
6. **Tactician** — target the slowest enemy (they retaliate last)

**Strategy hiding:** until both players have committed, a duel's strategies serialize as `"Hidden"`, so an opponent can't read your pick and counter it. A stronger **commit-reveal** path also exists on the backend (submit `keccak256("id:salt")`, then reveal), which cryptographically prevents anyone — even the node operator — from seeing or changing a pick after the other side commits.

---

## 4. Warriors, rarity, and progression

### The roster (20 templates)
There is a fixed catalog of 20 characters, each with distinct stats, a super power, and a points price. Examples: Mystic Seer (Thunderbolt), Zylar the Conqueror (Flamethrower), Bone Collector (Adaptability), Berzerker (highest base price at 480), Nyxar-tier bruisers, and so on.

### Seeded rarity
Every mint rolls a deterministic per-stat multiplier (90–110%) and a **rarity tier** — Common, Uncommon, Rare, Epic, Legendary — based on how lucky the rolls were. Two copies of the same template are therefore no longer identical, and a well-rolled veteran has real value on the marketplace.

### Per-fighter XP and leveling
Characters earn XP from every battle (a win pays more than a loss) and **level up** for small permanent stat boosts (health/strength/attack, with an occasional speed bump). This gives the "valuable veteran" premise teeth: a leveled, well-rolled character is meaningfully stronger than a fresh mint of the same template.

### Acquiring warriors
- **Starter team** — a one-time purchase of three warriors at base points price.
- **Single mint** — pay with battle **points** (with an escalating anti-farm premium of +15% per mint and a 6-hour cooldown) or with deposited **CTSI** (base price, no cooldown).
- **Marketplace** — buy another player's listed warrior with CTSI.

---

## 5. Charms

Eleven consumable **charms** add a pre-battle loadout layer, bought with points or CTSI:

- **Elemental Sigils** (Storm/Fire/Nature/Water/Psychic/Shadow) — +20% damage to your warriors of that element
- **Healing Salve** — +15% squad max health
- **Energy Catalyst** — start with half-charged power bars
- **Guardian Ward** — halve the first hit each warrior takes
- **War Horn** — +10% squad strength
- **Lucky Talisman** — double crit chance (10% → 20%)

Anti pay-to-win rules are enforced on-chain: at most **2 charms per battle**, no duplicates, at most one elemental sigil, each charm consumed by the battle that uses it, and inventory capped at 5 per type. Charms apply in the campaign.

---

## 6. Game modes

**P2P duels.** Create an open duel with three warriors (optionally staking CTSI), wait for someone to join, both pick strategies, fight. Winner takes 90% of the pot; the house rakes 10%. Wins also pay points and grant fighter XP.

**AI duels.** Easy or Hard PvE against "Nebula AI," which fields its own roster and picks a strategy based on relative squad strength. AI battle counters (total/won/lost) are tracked on your profile.

**Ghost-battle PvP (async).** No opponent online? Challenge a frozen **snapshot** of a real player's squad. The machine deterministically picks an eligible rival, simulates on the unified engine, and credits only your record (the defender is a passive snapshot). Reachable from the "Ghost Match" button on the Duels page.

**Campaign (20 levels).** A hand-designed PvE gauntlet across the six biomes, with elemental matchups, boss fights (levels 5, 10, 15, 20 — Pyrelord Karn, Tempest Queen Voltra, Sylvaron, and final boss Nyxar the Eternal), lore, energy/powers, charm loadouts, retry costs, decaying replay rewards, permanent squad stat boosts on first clear, and unlockable titles. There is a campaign leaderboard (top 50 by progress).

---

## 7. Economy and progression loops

- **Points** — the soft currency, earned from campaign clears, P2P/AI wins, and the daily reward; spent on warriors and charms.
- **CTSI** — the real token. Deposited via the ERC-20 portal, used for premium mints, stakes, marketplace purchases, and charms; withdrawable via voucher. **All CTSI money is integer base units (wei)** end-to-end, so fees and stake splits are lossless.
- **Daily reward** — an escalating streak bonus (50 → 200 points, 7-day cap, resets if a day is missed), claimable once per day, derived deterministically from the block timestamp. Claim button on the homepage.
- **Achievements** — nine badges (First Blood, Veteran, Sharpshooter, Champion of Nebula, Collector, Legendary Bond, Ascended, Daily Devotee, Arena Veteran) computed live from your record, with progress bars, shown on the profile page.
- **Leaderboards** — campaign standings and a global P2P/duel ladder (rating = wins up, losses down), both on the homepage Top Gamers board (Campaign / Duels tabs).
- **Marketplace** — list/delist/reprice/buy warriors in CTSI; the platform keeps a configurable fee (default 3%). A warrior in an active duel can't be listed; stale listings (seller no longer owns the warrior) are auto-removed.

---

## 8. Pages (frontend routes)

| Route | Page | What it does |
|---|---|---|
| `/` | Home | Hero CTA (branches on wallet/profile/roster state), Daily Reward claim, Top Gamers board (Campaign + Duels leaderboards) |
| `/about` | About | Marketing / lore overview |
| `/contact` | Contact | Contact form |
| `/profile` | Profile | Player stats, balances, and the Achievements panel |
| `/profile/useractivity` | Assets Manager | Deposit / withdraw / transfer CTSI; execute withdrawal vouchers on L1 |
| `/profile/purchasecharacter` | Purchase Character | Mint a warrior with points or CTSI |
| `/profile/yourcharacters` | Your Characters | Your owned roster |
| `/characters` | Characters | Character browser |
| `/campaign` | Campaign | Level select (1–20) with progress and biomes |
| `/campaign/:levelId` | Campaign Level | Pick squad + charms + strategy, fight, 3D replay |
| `/duels` | Duels | Open duel lobby (auto-refreshing) + Ghost Match button |
| `/selectWarriors` | Warriors | Choose three warriors to create a duel (with optional stake) |
| `/joinduel/:duelId` | Join Duel | Join an open duel with your squad |
| `/strategy/:duelId` | Strategy | Pick your targeting strategy; auto-fights when both sides are set |
| `/duels/:duelId` | Arena | 3D battle replay of a duel (also serves as a shareable replay link) |
| `/aiduel` | AI Duel | Create an Easy/Hard AI duel |
| `/marketplace` | Marketplace | Buy/sell warriors in CTSI |

Supporting UI: a shared 3D `BattleStage` engine (fighters run to their target, attack/hit/death animations, floating damage numbers, screen shake, biome-specific synthesized music and hit/crit/KO sound via Web Audio, skip button), a React error boundary that catches render crashes, a mobile drawer nav, and an SWR-style read cache that de-duplicates state queries and refreshes after every transaction.

---

## 9. Backend surface (Cartesi machine)

The Rust backend exposes two kinds of endpoints.

**Advance (state-changing inputs)** — `create_player`, `modify_monika`, `modify_avatar`, `purchase_team`, `purchase_single_character`, `purchase_points`, `buy_charm`, `create_duel`, `join_duel`, `set_strategy`, `commit_strategy`, `reveal_strategy`, `fight`, `create_ai_duel`, `select_ai_battle_strategy`, `ghost_battle`, `play_campaign_level`, `claim_daily_reward`, `list_character`, `delist_character`, `modify_list_price`, `buy_character`, `transfer_tokens`, `withdraw`, `withdraw_character_as_nft`, plus admin functions (`change_admin_address`, `change_relayer_address`, `change_points_rate`, `set_cartesi_token_address`, `set_nebula_token_address`, `set_marketplace_fee`, `withdraw_profit_from_stake` / `_p2p_sales` / `_points_purchase`). Deposits arrive automatically via the ERC-20 and ERC-721 portals.

**Inspect (read-only queries)** — `profile`, `has_profile`, `characters`, `players_characters`, `duels`, `available_duels`, `get_duel_characters`, `listed_characters`, `market_info`, `charm_catalog`, `campaign_levels`, `campaign`, `campaign_leaderboard`, `pvp_leaderboard`, `element_table`, `achievements`, `admin`, `relayer`, `check_relayed_dapp_address`.

Every advance handler returns a `Result`, so malformed input becomes a clean rejection rather than a machine halt; identity is derived from `metadata.msg_sender`, so players can't impersonate each other; and a participant check guards duel resolution.

---

## 10. Blockchain integrations

- **Cartesi Rollups v2** — self-hosted node (Fly.io), v2 finish loop, v2 portal payload parsing, and v2 vouchers (with a `value` field) executed on L1 via `Application.executeOutput`.
- **Base Sepolia** (chain 84532) — the L1 the app reads/writes against; the frontend calls `InputBox.addInput` directly, so users pay gas per action.
- **Wallet** — thirdweb ConnectButton with a chain-switch preflight, plus ethers v5.
- **CTSI ERC-20** — deposits through the ERC-20 portal; withdrawals emit a `transfer` voucher the user executes once its epoch finalises.
- **NFT bridge** — withdrawing a warrior as an NFT emits a real ERC-721 mint voucher calling the Nebula contract's `entrypoint(...)` (Tableland-backed metadata), with rollback if the voucher fails. (Requires the Application contract to be registered as the NFT's `dappAddress`.)
- **Address book** — portal/token/admin addresses are environment-configurable, so the same machine image runs on local Anvil and production.
- **State reads** — the frontend reads notices via JSON-RPC (`cartesi_listOutputs`) and inspect reports; there is no subgraph.

---

## 11. Verification and quality

The deterministic engine, economy math, rarity rolls, XP curve, element/biome multipliers, commit-reveal hashing, fee/stake splits, daily streak, ghost-opponent selection, and achievement thresholds are covered by **28 backend unit tests** (run with `cargo test`), and the frontend typechecks under `tsc`. This matters because the game's selling point is *provably fair* computation — every battle log is on-chain and independently re-checkable.

---

## 12. Known partial / not-yet-built

To be accurate about the current state:

- **$nebular token** — a `nebula_token_balance` field exists but is never used; it is not a real currency today.
- **Commit-reveal** — fully implemented and tested on the backend; the frontend still uses the simpler "Hidden" flow (which already blocks the practical exploit). The two-step commit-reveal UI is the remaining wiring.
- **Battle juice** — powers currently render as a strike + colored number; element-tinted projectiles/particles are a planned enhancement.
- **Output scaling** — each action emits a full state snapshot as a notice; moving to delta notices + `input_index`-filtered report fetches is a planned optimization.
- **NFT bridge** — the mint voucher is emitted, but the end-to-end loop depends on the deployed NFT contract trusting the Application address as its `dappAddress`.

---

*This document reflects the implementation as of the current working tree, including the unified combat engine, integer-wei economy, rarity/XP, six strategies, ghost battles, daily rewards, achievements, leaderboards, commit-reveal (backend), and the NFT mint voucher.*
