---
name: cartesi-deploy
version: 0.1.0
description: >-
  Deploy a Cartesi Rollups v2 application to a self-hosted rollups node for
  testnet or production-style deployment using Docker Compose. Covers CLI
  version detection, project version detection, building the machine image,
  downloading and configuring the Mugen-Builders compose setup, setting up
  the .env file, starting the node services, and registering the application.
  Also covers application lifecycle management (list, status, remove, execution
  parameters) and the node components reference. Triggers on: "deploy",
  "self-hosted", "testnet", "rollups node", "docker compose", "compose.local",
  "register application", "node setup", "Sepolia", "mainnet deployment",
  "production node", "Mugen-Builders".
---

## Skill Version

| Skill            | Version | Cartesi Rollups target | Contract suite         | Compose setup       | Last updated |
| ---------------- | ------- | ---------------------- | ---------------------- | ------------------- | ------------ |
| `cartesi-deploy` | `0.1.0` | v2.0-alpha             | cartesi-rollups v2.2.0 | Mugen-Builders v2.0 | May 2026     |

> This skill targets the Mugen-Builders `compose.local.yaml` setup and `cartesi-rollups-runtime:0.12.0-alpha.39`. If the compose file or runtime image has been updated, verify that service names, ports, and CLI commands still match. Contract addresses are for v2.2.0 — confirm against `compose.local.yaml` image tags before deploying.

# Cartesi Rollups v2 — Self-Hosted Node Deployment

## Goal

Deploy a Cartesi Rollups v2 application to a self-hosted rollups node using
the official Docker Compose setup. This is the authoritative deployment guide
for going beyond `cartesi run` — targeting testnets or production-style
environments.

Official references:

- Self-hosted deployment:
  https://docs.cartesi.io/cartesi-rollups/2.0/deployment/self-hosted/

- Compose setup source:
  https://github.com/Mugen-Builders/deployment-setup-v2.0

> **Scope note**: This is suited for development and testnet-style testing.
> Full production hardening (HA, monitoring, public snapshot verification)
> is out of scope.

---

## Step 0 — Detect CLI version and project version

Before running any commands, the agent must detect which CLI the user has
and which version of Cartesi their project targets. These two things
determine the correct build command and compatibility expectations.

### Detect CLI version

```sh
cartesi --version
```

| Output contains | CLI version | Notes                                          |
| --------------- | ----------- | ---------------------------------------------- |
| `1.5.x`         | v1.5        | Has `cartesi deploy` command (deprecated path) |
| `2.0.0-alpha`   | v2.0-alpha  | No `cartesi deploy`; use compose-based deploy  |

### Detect project version from Dockerfile

```sh
grep -E "MACHINE_EMULATOR_TOOLS_VERSION|MACHINE_GUEST_TOOLS_VERSION" Dockerfile
```

| Match found                                            | Project targets    |
| ------------------------------------------------------ | ------------------ |
| `MACHINE_EMULATOR_TOOLS_VERSION=0.14.1`                | Cartesi v1.5       |
| `MACHINE_GUEST_TOOLS_VERSION=0.17.2` (or higher alpha) | Cartesi v2.0-alpha |

Both v1.5 and v2.0-alpha projects build with the same command:

```sh
cartesi build
```

Both versions produce the machine snapshot at `.cartesi/image/`.

### Quick Dockerfile fingerprints

| Signal in Dockerfile               | Version                          |
| ---------------------------------- | -------------------------------- |
| `MACHINE_EMULATOR_TOOLS_VERSION`   | v1.5                             |
| `MACHINE_GUEST_TOOLS_VERSION`      | v2.0-alpha                       |
| `cartesi/python:3.10-slim-jammy`   | v1.5 base                        |
| `cartesi/python:3.13.2-slim-noble` | v2.0-alpha base                  |
| `Multi-stage build `               | v2.0-alpha pattern               |
| `APT_UPDATE_SNAPSHOT=...`          | v2.0-alpha (reproducible builds) |
| `ENTRYPOINT ["rollup-init"]`       | v1.5                             |

> **Alpha note**: Guest tools version, base image tags, and APT snapshot dates
> continue to evolve. Always check the Cartesi CLI release notes for the latest
> canonical Dockerfile template before deploying a v2.0-alpha project.

---

## Step 1 — Prerequisites

```sh
docker --version          # Docker Desktop 4.x required
docker compose version    # Docker Compose plugin required
cartesi --version
```

The application must already be scaffolded (`cartesi-scaffold`) and have
backend handlers implemented (`cartesi-backend-core` plus
`cartesi-backend-py` or `cartesi-backend-js-ts`).

---

## Step 2 — Build the Cartesi Machine image

Build the application snapshot before starting the node:

```sh
cartesi build
```

This produces the machine snapshot at `.cartesi/image/`. The compose setup
mounts this directory directly into the advancer container — the node serves
whatever snapshot is in `.cartesi/image/` at startup.

Confirm the build succeeded:

```sh
ls .cartesi/image/
# Should contain: config.json, hash, 000000000000000.v8.f1048576.uarch
```

---

## Step 3 — Download the compose setup

Download the official Mugen-Builders deployment compose file into the
**project root** (alongside `.cartesi/`):

```sh
curl -L \
  https://raw.githubusercontent.com/Mugen-Builders/deployment-setup-v2.0/main/compose.local.yaml \
  -o compose.local.yaml
```

This compose file defines 6 services that together form the Cartesi Rollups
Node:

| Service       | Image                                      | Port(s)          | Role                            |
| ------------- | ------------------------------------------ | ---------------- | ------------------------------- |
| `database`    | `cartesi/rollups-database:0.12.0-alpha.39` | —                | Postgres — shared state bus     |
| `evm-reader`  | `cartesi/rollups-runtime:0.12.0-alpha.39`  | `10001`          | Reads InputAdded events from L1 |
| `advancer`    | `cartesi/rollups-runtime:0.12.0-alpha.39`  | `10002`, `10012` | Runs Cartesi Machine; inspect   |
| `validator`   | `cartesi/rollups-runtime:0.12.0-alpha.39`  | `10003`          | Computes epoch claims + proofs  |
| `claimer`     | `cartesi/rollups-runtime:0.12.0-alpha.39`  | `10004`          | Submits claims to blockchain    |
| `jsonrpc-api` | `cartesi/rollups-runtime:0.12.0-alpha.39`  | `10005`, `10011` | Query API                       |

The advancer mounts `.cartesi/image/` from the project root as the
application snapshot:

```yaml
volumes:
  - .cartesi/image:/var/lib/cartesi-rollups-node/snapshot/
```

---

## Step 4 — Create the `.env` file

The compose file reads configuration from a `.env` file in the project root.
Create it with the following variables:

```sh
# .env
AUTH_KIND=private_key
CARTESI_AUTH_PRIVATE_KEY=<your-funded-private-key-hex>
BLOCKCHAIN_ID=<chain-id>
BLOCKCHAIN_HTTP_ENDPOINT=<https-rpc-url>
BLOCKCHAIN_WS_ENDPOINT=<wss-rpc-url>
CARTESI_BLOCKCHAIN_DEFAULT_BLOCK=<latest-or-finalized>
```

### Values by target network

| Network          | `BLOCKCHAIN_ID` | Example RPC (use your own key)                |
| ---------------- | --------------- | --------------------------------------------- |
| Sepolia          | `11155111`      | `https://sepolia.infura.io/v3/<KEY>`          |
| Arbitrum Sepolia | `421614`        | `https://arbitrum-sepolia.infura.io/v3/<KEY>` |
| Local Anvil      | `31337`         | `http://host.docker.internal:8545`            |

> **Security**: Never commit `.env` to version control. Add it to `.gitignore`.
> For the private key, use a funded wallet with only the minimum ETH needed
> for gas. For production, prefer `AUTH_KIND=aws` with AWS KMS.

### Contract addresses — cartesi-rollups v2.2.0

The contracts below are the canonical **v2.2.0** deployment. All contracts in this version work together as a suite — `SelfHostedApplicationFactory` depends on both `AuthorityFactory` and `ApplicationFactory`, and all portals depend on `InputBox`. Use the addresses for the version your node is running.

> **Version note**: Future releases will use different addresses. Always confirm the version by checking the `cartesi-rollups-runtime` image tag in `compose.local.yaml` and use the matching address set. For newer versions, the Cannon registry (`https://usecannon.com/packages/cartesi-rollups/<version>/84532-main/deployment/contracts`) has the canonical list — open in a browser as the page is client-side rendered.
>
> **Local devnet**: These addresses do NOT apply to `cartesi run`. Use `cartesi address-book` for local Anvil.

| Contract                       | Address                                      |
| ------------------------------ | -------------------------------------------- |
| `InputBox`                     | `0x1b51e2992A2755Ba4D6F7094032DF91991a0Cfac` |
| `EtherPortal`                  | `0xA632c5c05812c6a6149B7af5C56117d1D2603828` |
| `ERC20Portal`                  | `0xACA6586A0Cf05bD831f2501E7B4aea550dA6562D` |
| `ERC721Portal`                 | `0x9E8851dadb2b77103928518846c4678d48b5e371` |
| `ERC1155SinglePortal`          | `0x18558398Dd1a8cE20956287a4Da7B76aE7A96662` |
| `ERC1155BatchPortal`           | `0xe246Abb974B307490d9C6932F48EbE79de72338A` |
| `AuthorityFactory`             | `0x5E96408CFE423b01dADeD3bc867E6013135990cc` |
| `QuorumFactory`                | `0x1C91Ba8aa5648cdAC77E97eaC781447c646EF239` |
| `ApplicationFactory`           | `0x26E758238CB6eC5aB70ce0dd52aF2d7b82e1972E` |
| `SelfHostedApplicationFactory` | `0x010D3CbB4223F5bCc7b7B03cEE59f3aAea8eDb8A` |
| `SafeERC20Transfer`            | `0xb7C2bcAA4437425cfcE9d233bFf15EF461273D63` |

Add any addresses that differ from the compose defaults to your `.env`:

```sh
# .env — only needed if compose.local.yaml defaults are wrong for your chain
CARTESI_CONTRACTS_INPUT_BOX_ADDRESS=0x1b51e2992A2755Ba4D6F7094032DF91991a0Cfac
CARTESI_CONTRACTS_AUTHORITY_FACTORY_ADDRESS=0x5E96408CFE423b01dADeD3bc867E6013135990cc
CARTESI_CONTRACTS_APPLICATION_FACTORY_ADDRESS=0x26E758238CB6eC5aB70ce0dd52aF2d7b82e1972E
CARTESI_CONTRACTS_SELF_HOSTED_APPLICATION_FACTORY_ADDRESS=0x010D3CbB4223F5bCc7b7B03cEE59f3aAea8eDb8A
```

---

## Step 5 — Start the rollups node

Bring up all services:

```sh
docker compose -f compose.local.yaml --env-file .env up -d
```

Verify all containers are healthy:

```sh
docker compose -f compose.local.yaml ps
```

All services should show `running` or `healthy`. The `database` service has
a health check — other services wait for it before starting.

View logs:

```sh
# All services
docker compose -f compose.local.yaml logs -f

# Specific service
docker compose -f compose.local.yaml logs -f advancer
```

---

## Step 6 — Deploy and register the application

With the node running, deploy the application contracts to the blockchain
and register the application on the node using `cartesi-rollups-cli` inside
the advancer container:

```sh
docker compose -f compose.local.yaml exec advancer \
  cartesi-rollups-cli deploy application <app-name> \
  /var/lib/cartesi-rollups-node/snapshot/ \
  --epoch-length 10 \
  --salt <unique-32byte-hex-salt> \
  --register
```

Replace:

- `<app-name>`: your dApp identifier (e.g. `my-dapp`)
- `<unique-32byte-hex-salt>`: a unique value to prevent address collisions.
  Generate one with:
  ```sh
  cast keccak "$(echo $RANDOM-$(date +%s))"
  ```

> **Record the application contract address** printed after this command.
> You will need it for InputBox calls, frontends, and L1 contracts.

### Deploy with an existing consensus contract

If you already deployed an authority consensus and want to reuse it:

```sh
docker compose -f compose.local.yaml exec advancer \
  cartesi-rollups-cli deploy application <app-name> \
  /var/lib/cartesi-rollups-node/snapshot/ \
  --consensus <authority-contract-address> \
  --register
```

### Manual authority fallback

If the automated `deploy application` fails (factory address mismatch, gas issues,
or custom consensus requirements), deploy an authority contract directly via `cast`
and pass it explicitly:

**Step 1** — Deploy an authority via the AuthorityFactory. Resolve the factory address
with `cartesi address-book` or the official Deployed Contracts page for your chain.

```sh
# newAuthority(address owner, uint256 epochLength)
# Extracts the deployed authority address from the transaction logs
AUTH_ADDRESS=$(cast send <AUTHORITY_FACTORY_ADDRESS> \
  "newAuthority(address,uint256)" \
  <APPLICATION_OWNER_ADDRESS> \
  10 \
  --private-key <PRIVATE_KEY> \
  --rpc-url <RPC_URL> \
  --json | jq -r '.logs[-1].data' | sed 's/^0x000000000000000000000000/0x/')

echo "Authority deployed at: $AUTH_ADDRESS"
```

**Step 2** — Register the application using the deployed authority:

```sh
docker compose -f compose.local.yaml exec advancer \
  cartesi-rollups-cli deploy application <app-name> \
  /var/lib/cartesi-rollups-node/snapshot/ \
  --epoch-length 10 \
  --consensus $AUTH_ADDRESS \
  --register \
  --json
```

> Record both the authority address and the application contract address —
> you will need both for L1 integrations and future re-deployments.

### Register only (contracts already deployed)

If contracts are already on-chain and you only need to register:

```sh
docker compose -f compose.local.yaml exec advancer \
  cartesi-rollups-cli app register \
  --name <app-name> \
  --address <application-contract-address> \
  --template-path /var/lib/cartesi-rollups-node/snapshot/ \
  --consensus <consensus-address>
```

---

## Step 7 — Verify the deployment

### Check the app is registered and enabled

```sh
docker compose -f compose.local.yaml exec advancer \
  cartesi-rollups-cli app list
```

### Send a test advance input

```sh
docker compose -f compose.local.yaml exec advancer \
  cartesi-rollups-cli send <app-name> "hello world"
```

Requires these env vars to be set (already in compose via `.env`):
`CARTESI_CONTRACTS_INPUT_BOX_ADDRESS`, `CARTESI_BLOCKCHAIN_HTTP_ENDPOINT`,
`CARTESI_AUTH_MNEMONIC` or `CARTESI_AUTH_PRIVATE_KEY`.

### Test an inspect request

```sh
curl -s -X POST "http://localhost:10012/inspect/<app-name>" \
  -H "Content-Type: application/json" \
  -d '{"payload":"0x<hex-encoded-route>"}'
```

### Read outputs via JSON-RPC

```sh
curl -s -X POST "http://localhost:10011/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"cartesi_listOutputs","params":[{"application":"<app-name>"}],"id":1}'
```

---

## Step 8 — Application lifecycle management

All commands run inside the advancer container via `docker compose exec`:

```sh
# Prefix for all commands:
EXEC="docker compose -f compose.local.yaml exec advancer cartesi-rollups-cli"

# List all registered apps
$EXEC app list

# Get app status
$EXEC app status <app-name>

# Disable an app (required before removal)
$EXEC app status <app-name> disabled

# Re-enable an app
$EXEC app status <app-name> enabled

# Remove an app (disable first)
$EXEC app remove <app-name>
$EXEC app remove <app-name> --force   # skip confirmation

# Read processed inputs
$EXEC read inputs <app-name>
$EXEC read inputs <app-name> 42                          # by index
$EXEC read inputs <app-name> --epoch-index 0x0 --limit 20

# Read outputs
$EXEC read outputs <app-name>
$EXEC read outputs <app-name> 42

# Read reports
$EXEC read reports <app-name>

# Read epochs
$EXEC read epochs <app-name>
$EXEC read epochs <app-name> --status OPEN

# Validate an output on-chain
$EXEC validate <app-name> <output-index>

# Execute a voucher on-chain
$EXEC execute <app-name> <output-index>
$EXEC execute <app-name> <output-index> --yes
```

---

## Step 9 — Manage execution parameters

```sh
EXEC="docker compose -f compose.local.yaml exec advancer cartesi-rollups-cli"

# List all parameters
$EXEC app execution-parameters list <app-name>

# Get specific parameter
$EXEC app execution-parameters get <app-name> snapshot_policy

# Set specific parameter (disable app first)
$EXEC app status <app-name> disabled
$EXEC app execution-parameters set <app-name> snapshot_policy EVERY_INPUT
$EXEC app status <app-name> enabled

# Load full parameter set from JSON
$EXEC app execution-parameters load <app-name> <<< '{
  "snapshot_policy": "EVERY_INPUT",
  "advance_inc_cycles": "0x400000",
  "advance_max_cycles": "0x3fffffffffffffff",
  "inspect_inc_cycles": "0x400000",
  "inspect_max_cycles": "0x3fffffffffffffff",
  "advance_inc_deadline": "0x2540be400",
  "advance_max_deadline": "0x29e8d60800",
  "inspect_inc_deadline": "0x2540be400",
  "inspect_max_deadline": "0x29e8d60800",
  "load_deadline": "0x45d964b800",
  "store_deadline": "0x29e8d60800",
  "fast_deadline": "0x12a05f200",
  "max_concurrent_inspects": 10
}'
```

---

## Step 10 — Stopping and restarting the node

```sh
# Stop all services (preserves data volume)
docker compose -f compose.local.yaml down

# Stop and wipe all data (full reset)
docker compose -f compose.local.yaml down -v

# Restart after code changes:
# 1. Rebuild the machine image
cartesi build

# 2. Restart the node (advancer will pick up new snapshot on startup)
docker compose -f compose.local.yaml down
docker compose -f compose.local.yaml --env-file .env up -d
```

---

## Node service ports reference

| Service       | Port    | Purpose                        |
| ------------- | ------- | ------------------------------ |
| `evm-reader`  | `10001` | Telemetry / health             |
| `advancer`    | `10002` | Telemetry / health             |
| `advancer`    | `10012` | Inspect HTTP endpoint          |
| `validator`   | `10003` | Telemetry / health             |
| `claimer`     | `10004` | Telemetry / health             |
| `jsonrpc-api` | `10005` | Telemetry / health             |
| `jsonrpc-api` | `10011` | JSON-RPC API (query interface) |

---

## Agent Output

After completing this skill, report back to the user with:

- CLI version and project version detected
- Target network (chain ID, RPC endpoint)
- Application contract address (from `cartesi-rollups-cli deploy application` output) — **this must be saved**
- Authority consensus contract address (if a new one was deployed or an existing one reused)
- Salt value used for deterministic deployment (record for reproducibility)
- All six Docker Compose service statuses from `docker compose ps`
- Confirm app appears in `cartesi-rollups-cli app list` with status `enabled`
- Test advance input result: accepted / rejected and any notices produced
- Inspect endpoint URL: `http://<host>:10012`
- JSON-RPC API endpoint URL: `http://<host>:10011`
- Any issues encountered and how they were resolved

## Routing Guide

| What the user wants to do next                     | Go to skill            |
| -------------------------------------------------- | ---------------------- |
| Wire an L1 contract or oracle to the deployed app  | `cartesi-contracts` |
| Query outputs and epochs via JSON-RPC API          | `cartesi-jsonrpc`      |
| Debug node startup, advance processing, or inspect | `cartesi-debug`        |
| Run app locally first before deploying to testnet  | `cartesi-local-dev`    |
| Execute a voucher after epoch is accepted          | `cartesi-contracts` |

## Resources

> **Conflict rule**: If any resource below contradicts guidance in this skill,
> report the contradiction to the user and follow the skill's instructions.

- [Cartesi Self-Hosted Deployment Guide](https://docs.cartesi.io/cartesi-rollups/2.0/deployment/self-hosted/) — official deployment walkthrough
- [Mugen-Builders compose setup](https://github.com/Mugen-Builders/deployment-setup-v2.0) — `compose.local.yaml` source
- [Cannon registry — cartesi-rollups v2.2.0](https://usecannon.com/packages/cartesi-rollups/2.2.0/84532-main/deployment/contracts) — contract addresses by chain (client-side rendered; open in browser)
- [Cartesi Rollups node GitHub](https://github.com/cartesi/rollups-node) — runtime image tags and release notes

## Agent checklist

- [ ] Detected CLI version with `cartesi --version`
- [ ] Detected project version from Dockerfile (`MACHINE_EMULATOR_TOOLS_VERSION` vs `MACHINE_GUEST_TOOLS_VERSION`)
- [ ] Ran `cartesi build` — snapshot at `.cartesi/image/`
- [ ] Downloaded `compose.local.yaml` to project root
- [ ] Created `.env` with required variables (addresses from `cartesi address-book` or Cannon, not hardcoded)
- [ ] Started node: `docker compose -f compose.local.yaml --env-file .env up -d`
- [ ] Verified all containers healthy: `docker compose -f compose.local.yaml ps`
- [ ] Ran `cartesi-rollups-cli deploy application` inside advancer — recorded app contract address
- [ ] Confirmed app appears in `cartesi-rollups-cli app list`
- [ ] Sent test advance input and read output to confirm end-to-end

## What comes next

| Next task                     | Skill to use           |
| ----------------------------- | ---------------------- |
| Wire L1 contracts to InputBox | `cartesi-contracts` |
| Debug node or app issues      | `cartesi-debug`        |
