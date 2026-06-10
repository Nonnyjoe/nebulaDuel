---
name: cartesi-local-dev
version: 0.1.0
description: >-
  Run, test, and iterate on a Cartesi Rollups v2 application locally. Covers
  CLI version detection, building the Cartesi Machine image, running a local
  devnet, using cartesi run, sending advance and inspect requests via CLI,
  reading outputs, and running with a forked chain for realistic testing. Use
  this whenever the user wants to run their app locally, test their handlers,
  send inputs, read outputs, or debug application behaviour in a local
  environment. Triggers on: "run locally", "cartesi run", "test my app",
  "send input", "inspect", "read outputs", "local devnet", "Anvil", "fork",
  "sanity check", "cartesi build".
---

## Skill Version

| Skill               | Version | Cartesi Rollups target               | Contract suite         | Last updated |
| ------------------- | ------- | ------------------------------------ | ---------------------- | ------------ |
| `cartesi-local-dev` | `0.1.0` | v2.0-alpha (CLI v1.5 and v2.0-alpha) | cartesi-rollups v2.2.0 | May 2026     |

> **Important**: `cartesi-rollups-cli` is NOT available when using `cartesi run`. It only exists inside the Docker containers of a compose-based self-hosted deployment. All read/inspect commands in this skill use `curl` and the JSON-RPC API for the `cartesi run` workflow.

# Cartesi Rollups v2 — Local Development and Testing

## Goal

Build the Cartesi Machine image, spin up a local devnet, send advance and
inspect requests, and read outputs — all locally. This skill covers the full
local development loop. It does not cover self-hosted node deployment (see
`cartesi-deploy`).

---

## Step 0 — Detect CLI and project version (ALWAYS do first)

```sh
cartesi --version
```

| Output          | CLI version | Build command   | Run command   |
| --------------- | ----------- | --------------- | ------------- |
| `1.5.x`         | v1.5        | `cartesi build` | `cartesi run` |
| `2.0.0-alpha.x` | v2.0-alpha  | `cartesi build` | `cartesi run` |

Detect project version from Dockerfile:

```sh
grep -E "MACHINE_EMULATOR_TOOLS_VERSION|MACHINE_GUEST_TOOLS_VERSION" Dockerfile
```

- `MACHINE_EMULATOR_TOOLS_VERSION` → v1.5 project
- `MACHINE_GUEST_TOOLS_VERSION` → v2.0-alpha project

Use the CLI version that matches the project version.

### Concrete Dockerfile differences between v1.5 and v2.0-alpha

Understanding these differences prevents build errors when working across projects.

**v1.5 Dockerfile pattern:**

```dockerfile
# Single-stage build
FROM --platform=linux/riscv64 cartesi/python:3.10-slim-jammy

ARG MACHINE_EMULATOR_TOOLS_VERSION=0.14.1
ADD https://github.com/cartesi/machine-emulator-tools/releases/download/v${MACHINE_EMULATOR_TOOLS_VERSION}/machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.tar.gz /
RUN tar -xzf /machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.tar.gz -C / && \
    rm /machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.tar.gz

ENV PATH="/opt/cartesi/bin:${PATH}"

WORKDIR /opt/cartesi/dapp
COPY requirements.txt .
RUN pip install -r requirements.txt --break-system-packages
COPY . .
ENTRYPOINT ["rollup-init"]
CMD ["python3", "dapp.py"]
```

**v2.0-alpha Dockerfile pattern:**

```dockerfile
# Multi-stage build — build tools separate from runtime
FROM --platform=linux/riscv64 cartesi/python:3.13.2-slim-noble AS base

ARG MACHINE_GUEST_TOOLS_VERSION=0.17.2
ARG APT_UPDATE_SNAPSHOT=20250915T030400Z

# Pinned APT snapshot for reproducibility
RUN echo "deb [check-valid-until=no] https://snapshot.debian.org/archive/debian/${APT_UPDATE_SNAPSHOT} noble main" > ...

# Package installed with sha256 checksum verification
ADD --checksum=sha256:<hash> \
    https://github.com/cartesi/machine-guest-tools/releases/download/v${MACHINE_GUEST_TOOLS_VERSION}/machine-guest-tools_riscv64.deb \
    /tmp/machine-guest-tools_riscv64.deb
RUN dpkg -i /tmp/machine-guest-tools_riscv64.deb

WORKDIR /opt/cartesi/dapp
COPY . .
```

Key differences at a glance:

| Aspect                | v1.5                              | v2.0-alpha                                |
| --------------------- | --------------------------------- | ----------------------------------------- |
| Dockerfile stages     | Single stage                      | Multi-stage (common pattern)              |
| Guest tools package   | `machine-emulator-tools` (tar.gz) | `machine-guest-tools` (.deb)              |
| Version variable      | `MACHINE_EMULATOR_TOOLS_VERSION`  | `MACHINE_GUEST_TOOLS_VERSION`             |
| Base Python image     | `cartesi/python:3.10-slim-jammy`  | `cartesi/python:3.13.2-slim-noble`        |
| APT snapshot pinning  | Not used                          | `APT_UPDATE_SNAPSHOT` for reproducibility |
| Checksum verification | Not used                          | sha256 checksum on downloaded package     |
| Entrypoint            | `rollup-init`                     | Handled internally by guest tools         |

> **v2.0-alpha note**: Internal service versions (guest tools version, base image tags,
> APT snapshot dates) are still evolving as it is in alpha. Always check the latest
> Cartesi CLI release notes for the canonical Dockerfile template.

---

## Preconditions

```sh
cartesi --version
docker --version    # Docker running
```

The application must already be scaffolded (`cartesi-scaffold`) and have
backend handlers implemented (`cartesi-backend-core` plus
`cartesi-backend-py` or `cartesi-backend-js-ts`).

---

## Phase 1 — Build the Cartesi Machine image

Every code change requires a rebuild before `cartesi run` picks it up:

```sh
cartesi build
```

This compiles the application into a RISC-V Cartesi Machine snapshot at
`.cartesi/image/`. A successful build prints:

```
Cartesi machine snapshot stored as .cartesi/image
```

Common build failures:

- **Missing system packages**: Add them to the `Dockerfile` via `apt install`.
- **Dependency errors**: Install packages inside the Dockerfile, not just on
  the host.
- **Docker not running**: Start Docker Desktop or the Docker daemon.

---

## Phase 2 — Run locally with `cartesi run`

`cartesi run` starts a local Anvil devnet with the Cartesi contracts
pre-deployed, plus the Rollups Node services, all in Docker.

```sh
cartesi run
```

To expose on a specific port:

```sh
cartesi run -p <port>
```

Default endpoints after `cartesi run` starts:

| Service      | Default URL                             |
| ------------ | --------------------------------------- |
| Inspect      | `http://localhost:<port>/inspect/<app>` |
| JSON-RPC API | `http://localhost:<port>/rpc`           |
| Anvil L1 RPC | `http://localhost:8545`                 |

Watch the output for the actual ports — they are printed on startup.

**Teardown**: If you see "application name is already in use":

```sh
docker compose -p <app-name> down
```

Then re-run `cartesi run`.

---

## Phase 3 — Send advance inputs (state-changing)

Advance inputs are submitted **on-chain** to the InputBox contract. The node
monitors the contract and forwards new inputs to your backend.

### Using the Cartesi CLI

> **Note**: The `cartesi send` command is available in v1.5. In v2.0-alpha,
> check your CLI's available commands with `cartesi --help`. If `send` is not
> listed, use `cast` (Foundry) to call `InputBox.addInput` directly (see the cast
> command in Phase 2 below). `cartesi-rollups-cli` is NOT available with `cartesi run` —
> it only exists inside the compose-based self-hosted deployment containers.

```sh
# v1.5 — send a plain string
cartesi send --encoding string '<your-payload>'

# v1.5 — send a JSON payload
cartesi send --encoding string '{"action":"buy","item":"sword","qty":1}'

# v1.5 — send hex-encoded payload
cartesi send 0x68656c6c6f --hex

# v2.0-alpha — check available commands first
cartesi --help | grep send
```

### Using curl directly against the InputBox (alternative)

```sh
cast send <InputBox-address> \
  "addInput(address,bytes)" <app-address> <hex-payload> \
  --rpc-url http://localhost:8545 \
  --private-key <funded-private-key>
```

For Anvil's default funded key:

```sh
--private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

---

## Phase 3.5 — Local devnet test tokens

When you run `cartesi run`, the CLI automatically deploys three test token contracts
to the local Anvil devnet alongside your application contracts. These are available
immediately for testing token deposit flows without any manual deployment.

### Resolving test token and portal addresses

> **Never hardcode token or portal addresses.** These are redeployed with each CLI version
> and change frequently. Always resolve them at task time using `cartesi address-book`.

All three test token contracts (ERC20, ERC721, ERC1155) are automatically deployed when
`cartesi run` starts. They are owned by Anvil's first address. The ERC20 is pre-minted
with 1,000,000,000 TEST tokens; minting new tokens is disabled.

Run the following with `cartesi run` active to get every deployed address (tokens, portals,
InputBox, app contract):

```sh
cartesi address-book
```

Capture the addresses you need into shell variables before running any `cast` commands:

```sh
# Capture all addresses from address-book output into shell variables
ADDR_BOOK=$(cartesi address-book 2>&1)

export TEST_TOKEN=$(echo "$ADDR_BOOK"  | grep -i "TestToken"         | grep -oE '0x[0-9a-fA-F]{40}')
export TEST_NFT=$(echo "$ADDR_BOOK"    | grep -i "TestNFT"           | grep -oE '0x[0-9a-fA-F]{40}')
export TEST_MULTI=$(echo "$ADDR_BOOK"  | grep -i "TestMultiToken"    | grep -oE '0x[0-9a-fA-F]{40}')
export ERC20_PORTAL=$(echo "$ADDR_BOOK"   | grep -i "ERC20Portal"         | grep -oE '0x[0-9a-fA-F]{40}')
export ERC721_PORTAL=$(echo "$ADDR_BOOK"  | grep -i "ERC721Portal"        | grep -oE '0x[0-9a-fA-F]{40}')
export ERC1155_PORTAL=$(echo "$ADDR_BOOK" | grep -i "ERC1155SinglePortal" | grep -oE '0x[0-9a-fA-F]{40}')
export APP_ADDRESS=$(echo "$ADDR_BOOK" | grep -i "Application" | grep -oE '0x[0-9a-fA-F]{40}' | tail -1)

# Verify — all variables should be non-empty 40-char hex addresses
echo "TEST_TOKEN=$TEST_TOKEN  TEST_NFT=$TEST_NFT  TEST_MULTI=$TEST_MULTI"
echo "ERC20_PORTAL=$ERC20_PORTAL  ERC721_PORTAL=$ERC721_PORTAL  ERC1155_PORTAL=$ERC1155_PORTAL"
echo "APP_ADDRESS=$APP_ADDRESS"
```

> **Tip**: If any variable is empty, run `cartesi address-book` unfiltered and read the
> contract names directly, then set the variables manually before proceeding.

The Anvil default funded private key (standard Hardhat/Anvil dev key — never changes):

```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

(owner address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`)

### Depositing tokens via the CLI (recommended)

The easiest way to deposit test tokens is the interactive `cartesi deposit` command.
Run this with your application already started:

```sh
# Interactive deposit — walks you through selecting token type, address, amount
cartesi deposit
```

Deposit options:

- `erc20` — deposits ERC20 tokens (pre-filled with TestToken address)
- `erc721` — deposits an NFT by token ID
- `erc1155-single` — deposits a single ERC1155 token
- `erc1155-batch` — deposits multiple ERC1155 tokens in one tx

### Depositing ERC20 via cast (manual)

> **Prerequisite**: set the shell variables from the "Resolving addresses" section above
> before running these commands.

Step 1 — Approve the ERC20Portal to spend tokens:

```sh
cast send $TEST_TOKEN \
  "approve(address,uint256)" \
  $ERC20_PORTAL \
  300000000000000000000 \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Step 2 — Deposit to your application:

```sh
cast send $ERC20_PORTAL \
  "depositERC20Tokens(address,address,uint256,bytes)" \
  $TEST_TOKEN \
  $APP_ADDRESS \
  202 \
  0x \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Minting and depositing ERC721 via cast

Step 1 — Mint an NFT to the default Anvil address:

```sh
cast send $TEST_NFT \
  "safeMint(address,uint256,string)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  1 \
  "https://example.com/metadata/1.json" \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Step 2 — Approve the ERC721Portal:

```sh
cast send $TEST_NFT \
  "setApprovalForAll(address,bool)" \
  $ERC721_PORTAL \
  true \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Step 3 — Deposit token ID 1 to your application:

```sh
cast send $ERC721_PORTAL \
  "depositERC721Token(address,address,uint256,bytes,bytes)" \
  $TEST_NFT \
  $APP_ADDRESS \
  1 \
  0x \
  0x \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Minting and depositing ERC1155 via cast

Step 1 — Mint token ID 1 (quantity 1) to the default address:

```sh
cast send $TEST_MULTI \
  "mint(address,uint256,uint256,bytes)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  1 1 0x \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Step 2 — Approve the ERC1155SinglePortal:

```sh
cast send $TEST_MULTI \
  "setApprovalForAll(address,bool)" \
  $ERC1155_PORTAL \
  true \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Step 3 — Deposit 1 unit of token ID 1:

```sh
cast send $ERC1155_PORTAL \
  "depositSingleERC1155Token(address,address,uint256,uint256,bytes,bytes)" \
  $TEST_MULTI \
  $APP_ADDRESS \
  1 1 0x 0x \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Transferring ERC20 to a different test address

When testing multi-address scenarios (e.g. deposits from different users):

```sh
# Anvil account 2 — second funded dev address (standard, never changes)
cast send $TEST_TOKEN \
  "transfer(address,uint256)" \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  202 \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

> **Note**: All state resets when you stop `cartesi run`. Token balances, minted NFTs,
> and any deposits do not persist across restarts. For persistent state across sessions,
> deploy using the compose-based setup (`cartesi-deploy` skill) which supports node
> snapshots via `cartesi-rollups-cli` inside the advancer container.

---

## Phase 4 — Send inspect requests (read-only)

Inspect requests are sent directly to the Rollups Node via HTTP — no
blockchain transaction required.

> **`cartesi-rollups-cli` is NOT available with `cartesi run`.** It only exists inside
> the Docker containers of a compose-based self-hosted deployment. With `cartesi run`,
> use `curl` directly against the inspect HTTP endpoint.

### With `cartesi run` — use curl

`cartesi run` prints the inspect port on startup. Use that port:

```sh
# Replace <port> with the inspect port printed by `cartesi run`
# Replace <app-name> with your dApp name from `cartesi create`

# String payload (hex-encode it first)
PAYLOAD=$(echo -n "stats" | xxd -p | tr -d '\n')
curl -s -X POST "http://localhost:<port>/inspect/<app-name>" \
  -H "Content-Type: application/json" \
  -d "{\"payload\":\"0x${PAYLOAD}\"}"

# Or send raw hex directly
curl -s -X POST "http://localhost:<port>/inspect/<app-name>" \
  -H "Content-Type: application/json" \
  -d '{"payload":"0x7374617473"}'
```

### With compose deployment — use `cartesi-rollups-cli` inside the container

If you deployed via the compose file (see `cartesi-deploy` skill), the CLI is
available inside the advancer container:

```sh
docker compose -f compose.local.yaml exec advancer \
  cartesi-rollups-cli inspect <app-name> "stats"

docker compose -f compose.local.yaml exec advancer \
  cartesi-rollups-cli inspect <app-name> 0x7374617473 --hex
```

Decode the report payload from the response:

```sh
# Response contains hex payload — decode it:
echo "0x<hex-payload>" | xxd -r -p
# Or with cast:
cast --to-ascii <hex-without-0x>
```

---

## Phase 5 — Read outputs from the node

After sending advance inputs and waiting for processing, read the results.

> **`cartesi-rollups-cli` is NOT available with `cartesi run`.** It only exists inside
> the Docker containers of a compose-based self-hosted deployment. With `cartesi run`,
> use the JSON-RPC API exposed by the local node (see `cartesi-jsonrpc` skill for the
> full method reference).

### With `cartesi run` — use the JSON-RPC API

`cartesi run` exposes a JSON-RPC endpoint. Read the port from the startup output (default `10011` in the compose setup; `cartesi run` may use a different port — check the output).

```sh
# Read all outputs for your app
curl -s -X POST "http://localhost:<jsonrpc-port>/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"cartesi_listOutputs","params":[{"application":"<app-name>"}],"id":1}'

# Read all reports for your app
curl -s -X POST "http://localhost:<jsonrpc-port>/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"cartesi_listReports","params":[{"application":"<app-name>"}],"id":1}'

# Read all inputs processed
curl -s -X POST "http://localhost:<jsonrpc-port>/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"cartesi_listInputs","params":[{"application":"<app-name>"}],"id":1}'

# Read epoch status
curl -s -X POST "http://localhost:<jsonrpc-port>/rpc" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"cartesi_listEpochs","params":[{"application":"<app-name>"}],"id":1}'
```

See the `cartesi-jsonrpc` skill for the complete method reference and TypeScript client patterns.

### With compose deployment — use `cartesi-rollups-cli` inside the container

If you deployed via the compose file (see `cartesi-deploy` skill), the CLI is
available inside the advancer container. All commands must be prefixed with
`docker compose -f compose.local.yaml exec advancer`:

```sh
EXEC="docker compose -f compose.local.yaml exec advancer cartesi-rollups-cli"

# Read all outputs (notices, vouchers, delegated call vouchers)
$EXEC read outputs <app-name>
$EXEC read outputs <app-name> 42        # specific output by index

# Read reports
$EXEC read reports <app-name>
$EXEC read reports <app-name> --limit 10 --offset 0

# Read inputs processed by the node
$EXEC read inputs <app-name>
$EXEC read inputs <app-name> 5          # specific input by index
$EXEC read inputs <app-name> --epoch-index 0x0 --limit 20

# Read epoch status
$EXEC read epochs <app-name>
$EXEC read epochs <app-name> --status OPEN
```

---

## Phase 6 — Sanity checklist after startup

After `cartesi run` and `cartesi build`, run this minimal roundtrip to confirm
everything works end-to-end.

> **Remember**: `cartesi-rollups-cli` is NOT available with `cartesi run`. Use `curl`
> and the JSON-RPC API for all read operations. The `cartesi-rollups-cli` commands
> shown below only apply if you are running the compose-based self-hosted deployment.

### With `cartesi run`

1. **Send one valid advance input** using `cartesi send` (v1.5) or `cast`:

   ```sh
   # v1.5
   cartesi send --encoding string '{"ping":true}'

   # v2.0-alpha (cast to InputBox — resolve address with cartesi address-book)
   INPUT_BOX=$(cartesi address-book 2>&1 | grep -i "InputBox" | grep -oE '0x[0-9a-fA-F]{40}')
   cast send $INPUT_BOX "addInput(address,bytes)" <APP_ADDRESS> \
     $(echo -n '{"ping":true}' | xxd -p | tr -d '\n' | sed 's/^/0x/') \
     --rpc-url http://127.0.0.1:8545 \
     --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

2. **Confirm the input was processed** via JSON-RPC:

   ```sh
   curl -s -X POST "http://localhost:<jsonrpc-port>/rpc" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"cartesi_listInputs","params":[{"application":"<app-name>"}],"id":1}'
   ```

3. **Call a simple inspect route** and decode the response:

   ```sh
   PAYLOAD=$(echo -n "stats" | xxd -p | tr -d '\n')
   curl -s "http://localhost:<inspect-port>/inspect/<app-name>" \
     -H "Content-Type: application/json" \
     -d "{\"payload\":\"0x${PAYLOAD}\"}"
   ```

4. **Read reports** and verify the payload decodes correctly:

   ```sh
   curl -s -X POST "http://localhost:<jsonrpc-port>/rpc" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"cartesi_listReports","params":[{"application":"<app-name>"}],"id":1}'
   ```

5. **Read outputs** and confirm notices appear for accepted inputs.

6. **Check state changed**: call the inspect route again and verify it reflects the advance input.

### With compose deployment

```sh
EXEC="docker compose -f compose.local.yaml exec advancer cartesi-rollups-cli"

# 1. Send a test input
$EXEC send <app-name> '{"ping":true}'

# 2. Confirm input is indexed
$EXEC read inputs <app-name>

# 3. Inspect a route
$EXEC inspect <app-name> "stats"

# 4. Read reports
$EXEC read reports <app-name>

# 5. Read outputs (notices/vouchers)
$EXEC read outputs <app-name>
```

---

## Phase 7 — Forked chain workflow

Fork a public testnet to test with realistic contract state. The same flags
work in both CLI versions (v1.5 and v2.0-alpha); confirm support with
`cartesi run --help` if a flag is rejected.

```sh
# Fork at the chain's latest block
cartesi run --fork-url <RPC_URL>

# Fork at a specific historical block (deterministic)
cartesi run --fork-url <RPC_URL> --fork-block-number <N>
```

Important caveats for forked chains:

- Fork state is **static** at the chosen block height. Repeated oracle reads
  return identical values — this is expected.
- To test changing external data, use new advance inputs that bypass L1
  or re-fork at a later block.
- Chain ID must match your wallet / signer config — mismatches surface as
  `invalid chain id for signer`.

---

## Environment variables for compose deployment CLI commands

> **This section only applies to compose-based self-hosted deployments** (see `cartesi-deploy`
> skill). `cartesi-rollups-cli` does NOT run on the host machine and is NOT available when
> using `cartesi run`. These variables are only needed when running `cartesi-rollups-cli`
> commands inside the advancer container via `docker compose exec`.

When the compose file's `.env` does not cover a needed variable, set it inside the container:

```sh
export CARTESI_DATABASE_CONNECTION=postgres://postgres:password@localhost:5432/postgres?sslmode=disable
export CARTESI_BLOCKCHAIN_HTTP_ENDPOINT=http://localhost:8545
export CARTESI_BLOCKCHAIN_WS_ENDPOINT=ws://localhost:8545
export CARTESI_BLOCKCHAIN_ID=31337
export CARTESI_AUTH_MNEMONIC="test test test test test test test test test test test junk"
# Resolve InputBox address from cartesi address-book — do not hardcode:
export CARTESI_CONTRACTS_INPUT_BOX_ADDRESS=$(cartesi address-book 2>&1 | grep -i "InputBox" | grep -oE '0x[0-9a-fA-F]{40}')
export CARTESI_INSPECT_ADDRESS=http://localhost:10012
```

For Anvil's devnet, chain ID `31337` and the mnemonic above are the standard Anvil defaults.

---

## Agent Output

After completing this skill, report back to the user with:

- CLI and project version detected
- Confirm build succeeded and snapshot is at `.cartesi/image/`
- Actual port numbers printed by `cartesi run` (do not assume defaults)
- All addresses from `cartesi address-book` (InputBox, app, portals, test tokens)
- Result of at least one advance input: accepted/rejected and any notices/reports emitted
- Result of at least one inspect call: route used and decoded report payload
- Confirmation that state updated correctly between advance and inspect
- Any errors encountered and how they were resolved

## Routing Guide

| What the user wants to do next                   | Go to skill            |
| ------------------------------------------------ | ---------------------- |
| Wire an L1 contract or oracle to InputBox        | `cartesi-contracts` |
| Deploy to testnet or self-hosted node            | `cartesi-deploy`       |
| Query outputs programmatically via JSON-RPC      | `cartesi-jsonrpc`      |
| Debug advance not being processed or state wrong | `cartesi-debug`        |
| Improve backend advance/inspect handler logic    | `cartesi-backend-core` + `cartesi-backend-py` / `cartesi-backend-js-ts` |

## Resources

> **Conflict rule**: If any resource below contradicts guidance in this skill,
> report the contradiction to the user and follow the skill's instructions.

- [Cartesi Rollups v2 Local Development](https://docs.cartesi.io/cartesi-rollups/2.0/development/running-the-application/) — `cartesi run` flags and local workflow
- [https://docs.cartesi.io/cartesi-rollups/2.0/development/](https://docs.cartesi.io/cartesi-rollups/2.0/development/)
- [https://docs.cartesi.io/cartesi-rollups/2.0/development/send-inputs-and-assets/](https://docs.cartesi.io/cartesi-rollups/2.0/development/send-inputs-and-assets/)
- [Utilizing test tokens in dev environment](https://docs.cartesi.io/cartesi-rollups/2.0/tutorials/) — test token deposit patterns with `cartesi deposit` and `cast`
- [Cartesi CLI address-book](https://docs.cartesi.io/cartesi-rollups/2.0/development/cli-commands/) — address resolution for local devnet
- [Cartesi Rollups HTTP API](https://docs.cartesi.io/cartesi-rollups/2.0/rollups-apis/backend/cartesi-rollup-http-api/) — `/finish`, advance, inspect endpoints

## Agent checklist

- [ ] Detected CLI version with `cartesi --version`
- [ ] Detected project version from Dockerfile (`MACHINE_EMULATOR_TOOLS_VERSION` vs `MACHINE_GUEST_TOOLS_VERSION`)
- [ ] Ran `cartesi build` successfully — snapshot at `.cartesi/image/`
- [ ] Started `cartesi run` and noted the actual port numbers from output (inspect port and JSON-RPC port)
- [ ] Ran `cartesi address-book` and captured all addresses into shell variables
- [ ] Sent at least one valid advance input and confirmed it was indexed
- [ ] Used `curl` or JSON-RPC API to read inputs/outputs/reports — NOT bare `cartesi-rollups-cli` (not available with `cartesi run`)
- [ ] Called at least one inspect route via `curl` and decoded the report payload
- [ ] Verified output/notice appears after a successful advance via JSON-RPC API
- [ ] Checked state counters or items updated correctly via inspect
- [ ] If testing token deposits: used `cartesi deposit` or cast commands with address-book variables
- [ ] If testing portal deposits: confirmed backend correctly identifies portal address via `msg_sender`
- [ ] If using forked chain: confirmed chain ID matches wallet config
- [ ] If user needs `cartesi-rollups-cli` commands: directed them to the compose-based deployment (`cartesi-deploy` skill)

## What comes next

| Next task                     | Skill to use           |
| ----------------------------- | ---------------------- |
| Wire L1 contracts to InputBox | `cartesi-contracts` |
| Deploy to self-hosted node    | `cartesi-deploy`       |
| Debug unexpected behaviour    | `cartesi-debug`        |
