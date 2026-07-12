---
name: cartesi-debug
version: 0.1.0
description: >-
  Diagnose and fix errors across the Cartesi Rollups v2 stack. Use this
  whenever the user hits an error, unexpected behaviour, or a failed operation
  at any layer — CLI version confusion, build, run, node startup, application
  deployment, advance processing, inspect, voucher execution, or blockchain
  interaction. Triggers on: "error", "failed", "not working", "stuck", "wrong
  output", "inspect returns nothing", "advance not processed", "deploy failed",
  "deploy command not found", "chain id mismatch", "port", "container",
  "docker", "node won't start", "debug", "troubleshoot", "cartesi run fails",
  "wrong version", "command not found".
---

## Skill Version

| Skill           | Version | Cartesi Rollups target               | Compose setup       | Last updated |
| --------------- | ------- | ------------------------------------ | ------------------- | ------------ |
| `cartesi-debug` | `0.1.0` | v2.0-alpha (CLI v1.5 and v2.0-alpha) | Mugen-Builders v2.0 | May 2026     |

> Error messages, command names, and Dockerfile markers documented here target CLI v1.5 and v2.0-alpha. If the user is on a newer CLI version, some symptoms or fixes may have changed — always start diagnosis with `cartesi --version`.

> **`cartesi-rollups-cli` execution context**: every `cartesi-rollups-cli`
> command in this file runs **inside the advancer container** of a
> compose-based self-hosted deployment. Prefix each command with
> `docker compose -f compose.local.yaml exec advancer …`. With `cartesi run`,
> `cartesi-rollups-cli` is not on the host — use `curl` against the inspect
> endpoint and the JSON-RPC API instead (see `cartesi-local-dev` and
> `cartesi-jsonrpc`).

# Cartesi Rollups v2 — Debugging and Troubleshooting

## Goal

Quickly identify and resolve issues anywhere in the Cartesi stack. This skill
is organised by layer and symptom. Start with the symptom that matches the
user's problem, work through the diagnosis steps, and apply the fix.

---

## Layer 0 — CLI version and project version issues (check first)

These are the most common source of confusion. Always resolve version
mismatches before diagnosing anything else.

### Symptom: `cartesi deploy` command not found

```
error: unknown command 'deploy'
```

**Cause**: The `cartesi deploy` command **does not exist in Cartesi CLI
v2.0-alpha**. It was removed. Deployment in v2 is done via Docker Compose.

**Fix**: Use the `cartesi-deploy` skill. The correct deployment flow is:

1. `cartesi build` to build the machine snapshot
2. Download `compose.local.yaml` from the Mugen-Builders repo
3. Create `.env` with your chain configuration
4. `docker compose -f compose.local.yaml --env-file .env up -d`
5. Register the app with `cartesi-rollups-cli deploy application` inside the
   advancer container

### Symptom: Unknown command or flag not recognised

Check which CLI version is installed:

```sh
cartesi --version
```

Then check available commands:

```sh
cartesi --help
```

If the user appears to have both versions installed (for example npm-global
plus a Homebrew-managed binary), list every `cartesi` binary on `PATH` and
inspect each:

```sh
which -a cartesi               # show every cartesi binary on PATH
npm ls -g @cartesi/cli         # version installed by npm (if any)
brew list --versions cartesi   # version installed by Homebrew (if any)
```

Use the CLI that matches the project version (check Dockerfile). If the
wrong one wins on `PATH`, either reorder `PATH`, alias `cartesi` to the
intended binary, or uninstall the unwanted version.

### Symptom: Built with wrong CLI version / image incompatible

A project built with v1.5 CLI cannot be run with a v2.0-alpha node and
vice versa. Identify the project version:

```sh
grep -E "MACHINE_EMULATOR_TOOLS_VERSION|MACHINE_GUEST_TOOLS_VERSION" Dockerfile
```

| Match                            | Project version | Correct CLI                      |
| -------------------------------- | --------------- | -------------------------------- |
| `MACHINE_EMULATOR_TOOLS_VERSION` | v1.5            | `cartesi` (v1.5)                 |
| `MACHINE_GUEST_TOOLS_VERSION`    | v2.0-alpha      | `cartesi` (v2.0-alpha installed) |

Additional Dockerfile signals that confirm the version:

| Signal in Dockerfile               | Version            |
| ---------------------------------- | ------------------ |
| `cartesi/python:3.10-slim-jammy`   | v1.5 base image    |
| `cartesi/python:3.13.2-slim-noble` | v2.0-alpha base    |
| Single-stage build                 | v1.5 pattern       |
| Multi-stage build (`AS base`)      | v2.0-alpha pattern |
| `APT_UPDATE_SNAPSHOT=...`          | v2.0-alpha only    |
| `ENTRYPOINT ["rollup-init"]`       | v1.5 only          |
| Tools installed as `.deb` package  | v2.0-alpha         |
| Tools installed as `.tar.gz`       | v1.5               |

If the wrong CLI was used to build, clean the build and rebuild:

```sh
rm -rf .cartesi/image/
cartesi build
```

### Symptom: `cartesi send` command not found (v2.0-alpha)

The `cartesi send` command may not be available in all v2.0-alpha releases.
Use `cast` (Foundry) to send inputs directly:

```sh
cast send <InputBox-address> \
  "addInput(address,bytes)" <app-address> <hex-payload> \
  --rpc-url http://localhost:8545 \
  --private-key <funded-key>
```

Or use the `cartesi-rollups-cli send` command inside the compose advancer:

```sh
docker compose -f compose.local.yaml exec advancer \
  cartesi-rollups-cli send <app-name> "your-payload"
```

---

## Layer 1 — Build failures (`cartesi build`)

### Symptom: `cartesi build` fails immediately

**Check Docker is running:**

```sh
docker info
```

If Docker is not running, start Docker Desktop or the daemon.

**Check Cartesi CLI is installed:**

```sh
cartesi --version
```

### Symptom: Build fails with missing package / dependency error

The Dockerfile defines the Cartesi Machine Linux environment. System
packages must be installed inside the Dockerfile, not on the host.

```dockerfile
# Wrong: installed on host, not inside machine
# apt install libsomething

# Correct: install inside the Dockerfile
RUN apt-get update && apt-get install -y libsomething
```

After fixing the Dockerfile, rebuild:

```sh
cartesi build
```

### Symptom: Language runtime version mismatch

Check the Dockerfile base image matches the language version you're using.
For Node.js:

```dockerfile
FROM node:20-alpine   # pin the version explicitly
```

---

## Layer 2 — Local run failures (`cartesi run`)

### Symptom: "application name is already in use"

A previous `cartesi run` session left a Docker Compose project running.
Tear it down and retry:

```sh
docker compose -p <app-name> down
cartesi run
```

Replace `<app-name>` with the name from `cartesi create`.

### Symptom: `cartesi run` starts but ports are wrong

`cartesi run` prints actual ports on startup. Read those — do not assume
defaults. Update all CLI commands and frontend proxies to use the printed ports.

### Symptom: Inspect URL returns 404 or connection refused

- Confirm the URL format: `http://localhost:<port>/inspect/<app-name>`
- Confirm `<port>` matches what `cartesi run` printed
- Confirm the app name matches what was created with `cartesi create`
- Check containers are still running: `docker ps`

### Symptom: State seems unchanged after advance input

Possible causes:

1. **Input rejected**: the backend returned `"reject"`. Read reports to see
   the error:

   ```sh
   # With cartesi run — use JSON-RPC (replace <port> with the printed JSON-RPC port)
   curl -s -X POST "http://localhost:<port>/rpc" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"cartesi_listReports","params":{"application":"<app-name>"}}'

   # With compose deployment — use cartesi-rollups-cli inside advancer
   docker compose -f compose.local.yaml exec advancer \
     cartesi-rollups-cli read reports <app-name>
   ```

2. **Wrong app address**: the input was sent to the wrong application.
3. **Backend restarted and lost ephemeral state**: state is in-memory.
   Resend from scratch or use snapshots.
4. **Input not yet processed**: wait and re-check, or lower polling interval.

---

## Layer 3 — Node startup failures

### Symptom: Node won't start — database connection error

```
error: failed to connect to postgres
```

Checks:

1. Is Postgres running?
   ```sh
   docker ps | grep postgres
   ```
2. Is `CARTESI_DATABASE_CONNECTION` set and correct?
   ```sh
   echo $CARTESI_DATABASE_CONNECTION
   # Expected: postgres://user:password@hostname:port/database
   ```
3. Have migrations been run?
   ```sh
   cartesi-rollups-cli db init
   ```
4. If using Docker networking, use `host.docker.internal` not `localhost`:
   ```sh
   export CARTESI_DATABASE_CONNECTION=postgres://postgres:password@host.docker.internal:5432/postgres?sslmode=disable
   ```

### Symptom: Node exits immediately — max startup time exceeded

```
error: service exceeded max startup time
```

Increase the startup timeout:

```sh
export CARTESI_MAX_STARTUP_TIME=60
```

Check logs for underlying cause before increasing:

```sh
export CARTESI_LOG_LEVEL=debug
cartesi-rollups-node
```

### Symptom: Node logs show blockchain connection errors

```
error: failed to connect to blockchain HTTP endpoint
```

Checks:

1. Is the RPC endpoint correct and reachable?
   ```sh
   curl -s http://localhost:8545 -X POST \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
   ```
2. Is `CARTESI_BLOCKCHAIN_ID` set to the correct chain ID?
3. Is `CARTESI_BLOCKCHAIN_WS_ENDPOINT` set (required by EVM Reader)?

---

## Layer 4 — Application deployment failures

### Symptom: `deploy application` fails with "insufficient funds"

The wallet derived from `CARTESI_AUTH_MNEMONIC` has no ETH on the target chain.
For Anvil devnet, use the default funded mnemonic:

```sh
export CARTESI_AUTH_MNEMONIC="test test test test test test test test test test test junk"
```

For testnets, fund the address from a faucet.

### Symptom: `deploy application` fails with unknown selector / revert

Check:

1. Contract addresses match the target chain. Verify with:
   ```sh
   cartesi address-book
   ```
2. The ABI used client-side includes custom errors from the contract.
   Look up unknown selectors at https://www.4byte.directory/

### Symptom: Deterministic deploy collision

If deploying the same app image with the same owner address again, the
contract address will collide. Use a different salt:

```sh
cartesi-rollups-cli deploy application myapp .cartesi/image/ \
  --salt $(cast keccak "your-unique-string-$(date +%s)")
```

### Symptom: `deploy application` succeeds but app is not processing inputs

The application must be **enabled** on the node. Check status:

```sh
cartesi-rollups-cli app status myapp
```

If disabled, enable it:

```sh
cartesi-rollups-cli app status myapp enabled
```

---

## Layer 5 — Advance input not processed

### Symptom: Input sent but never appears in node reads

Check if the EVM Reader is reading the correct InputBox address:

```sh
echo $CARTESI_CONTRACTS_INPUT_BOX_ADDRESS
# Should match the address on the target chain
```

Check the node logs for EVM Reader activity:

```sh
export CARTESI_LOG_LEVEL=debug
```

Verify the input was actually submitted on-chain:

```sh
cast logs \
  --address <InputBox-address> \
  --from-block 0 \
  --to-block latest \
  --rpc-url http://localhost:8545
```

### Symptom: Input appears in node but state is wrong

Read reports for that input to see what the backend returned:

```sh
cartesi-rollups-cli read reports <app-name>
```

If the report shows a backend error, the issue is in the advance handler.
Add more logging inside the handler and rebuild:

```sh
cartesi build && cartesi run
```

### Symptom: "invalid chain id for signer"

The wallet/signer chain ID does not match the RPC endpoint's chain ID.

Fix: align `CARTESI_BLOCKCHAIN_ID` with the RPC chain:

```sh
# Check actual chain ID from RPC
cast chain-id --rpc-url http://localhost:8545

# Set it
export CARTESI_BLOCKCHAIN_ID=31337   # adjust to actual value
```

---

## Layer 6 — Inspect issues

### Symptom: Inspect returns empty or no reports

1. Confirm the inspect endpoint URL is correct:
   ```sh
   export CARTESI_INSPECT_ADDRESS=http://localhost:10012
   ```
2. Confirm the route string matches what the backend handles:
   ```sh
   # Backend handles route "stats" — call with exactly "stats"
   cartesi-rollups-cli inspect myapp "stats"
   ```
3. Make sure the inspect handler emits at least one report — even on error.

### Symptom: Inspect returns stale data

Inspect forks the **current** machine state. If the Advancer is still
processing a large advance, inspect sees the state _before_ that advance.
Wait for advance processing to complete, then re-inspect.

### Symptom: Parallel inspects fail or timeout

Increase `max_concurrent_inspects` in execution parameters:

```sh
cartesi-rollups-cli app execution-parameters set myapp max_concurrent_inspects 20
```

---

## Layer 7 — Forked chain issues

### Symptom: Oracle/external data reads return identical values

Expected behaviour. A forked chain is static at the chosen block height.
To test changing data:

- Re-fork at a later block: `cartesi run --fork-url <RPC> --fork-block-number <N>`
- Or send advance inputs directly (bypassing L1) to simulate data changes.

### Symptom: Fork not loading the correct state

Confirm the RPC URL supports historical state at the chosen block:

```sh
cast block <block-number> --rpc-url <RPC_URL>
```

---

## Layer 8 — Voucher execution failures

### Symptom: Voucher cannot be executed — epoch not yet accepted

Vouchers require the epoch to be closed and the claim accepted. Check:

```sh
cartesi-rollups-cli read epochs <app-name>
# Look for CLAIM_ACCEPTED status
```

If the epoch is still OPEN or CLAIM_SUBMITTED, wait for the chain to advance
or reduce epoch length in development.

### Symptom: Voucher validation fails on-chain

1. Verify the output proof was generated (epoch must be CLAIM_ACCEPTED).
2. Check the destination contract is deployed and ABI matches.
3. Validate before executing:
   ```sh
   cartesi-rollups-cli validate <app-name> <output-index>
   ```

---

## General debug toolkit

### Enable verbose logging

```sh
export CARTESI_LOG_LEVEL=debug
cartesi-rollups-node
```

### Check all running containers

```sh
docker ps
docker logs <container-id>
```

### Inspect database state directly

```sh
psql "postgres://postgres:password@localhost:5432/postgres"
# List tables
\dt
# Check inputs
SELECT * FROM inputs ORDER BY id DESC LIMIT 10;
```

### Decode hex payloads on the fly

```sh
echo "0x68656c6c6f" | xxd -r -p
# Or with cast
cast --to-ascii 68656c6c6f
```

### Look up unknown error selectors

https://www.4byte.directory/ — paste the 4-byte selector to identify the error.

---

## Common error quick reference

| Error message                        | Cause                                | Fix                                                                                    |
| ------------------------------------ | ------------------------------------ | -------------------------------------------------------------------------------------- |
| `unknown command 'deploy'`           | `cartesi deploy` removed in v2 alpha | Use Docker Compose deployment (`cartesi-deploy` skill)                                 |
| `cartesi send` not found             | May not exist in v2.0-alpha          | Use `cast send` or `cartesi-rollups-cli send` inside container                         |
| Image incompatible with node         | CLI version mismatch                 | Check Dockerfile for `MACHINE_EMULATOR_TOOLS_VERSION` vs `MACHINE_GUEST_TOOLS_VERSION` |
| `application name is already in use` | Old Docker Compose project running   | `docker compose -p <app> down`                                                         |
| `invalid chain id for signer`        | Chain ID mismatch                    | Align `CARTESI_BLOCKCHAIN_ID` with RPC                                                 |
| `failed to connect to postgres`      | DB not running or wrong URL          | Check Postgres + `CARTESI_DATABASE_CONNECTION`                                         |
| `service exceeded max startup time`  | Slow startup or dependency issue     | Increase `CARTESI_MAX_STARTUP_TIME`, check logs                                        |
| `insufficient funds`                 | Wallet has no ETH                    | Fund wallet or use Anvil default mnemonic                                              |
| Inspect returns no reports           | Handler not emitting report          | Always emit a report, even on error                                                    |
| State unchanged after advance        | Input rejected or still processing   | Read reports, check handler return value                                               |
| Voucher not executable               | Epoch not yet accepted               | Wait for `CLAIM_ACCEPTED` epoch status                                                 |
| Unknown 4-byte selector in revert    | Missing custom error ABI             | Add custom errors to ABI, check 4byte.directory                                        |

---

## Agent Output

After completing this skill, report back to the user with:

- Which layer the issue was in (CLI version, build, local run, node startup, deploy, advance, inspect, voucher)
- Root cause identified (e.g. wrong CLI version, stale container, wrong chain ID, InputBox address mismatch)
- Exact fix applied (commands run, config changed, code edited)
- Confirmation the issue is resolved: expected output or behaviour now observed
- Any secondary issues discovered during diagnosis
- Recommended follow-up: what to do next to continue the development workflow

## Routing Guide

| What the user wants to do after fixing the issue | Go to skill            |
| ------------------------------------------------ | ---------------------- |
| Rebuild and redeploy after fixing build or code  | `cartesi-deploy`       |
| Resume local testing (`cartesi run`)             | `cartesi-local-dev`    |
| Fix L1 contract revert or InputBox interaction   | `cartesi-contracts` |
| Re-implement the advance/inspect handler         | `cartesi-backend-core` + `cartesi-backend-py` / `cartesi-backend-js-ts` |
| Query outputs after node is healthy              | `cartesi-jsonrpc`      |

## Resources

> **Conflict rule**: If any resource below contradicts guidance in this skill,
> report the contradiction to the user and follow the skill's instructions.

- [Cartesi Rollups v2 Troubleshooting](https://docs.cartesi.io/cartesi-rollups/2.0/) — official docs; check release notes for known issues
- [4byte.directory](https://www.4byte.directory/) — decode 4-byte Solidity error selectors
- [Cartesi Rollups node GitHub — Issues](https://github.com/cartesi/rollups-node/issues) — known bugs and workarounds
- [Mugen-Builders compose setup](https://github.com/Mugen-Builders/deployment-setup-v2.0) — compose file reference for node service configuration

## Agent checklist

- [ ] Checked CLI version with `cartesi --version` before diagnosing
- [ ] Verified project version from Dockerfile (`MACHINE_EMULATOR_TOOLS_VERSION` vs `MACHINE_GUEST_TOOLS_VERSION`)
- [ ] Confirmed Docker is running: `docker info`
- [ ] Confirmed `cartesi --version` output matches the project's Dockerfile version marker
- [ ] For deploy failures: verified `cartesi deploy` does not exist in v2.0-alpha — used compose instead
- [ ] For node failures: checked Postgres, DB connection string, and migration status
- [ ] For advance not processing: verified InputBox address (from `cartesi address-book`), EVM Reader logs, and on-chain tx
- [ ] For inspect issues: confirmed URL format, port, and that handler emits at least one report
- [ ] For voucher failures: confirmed epoch has `CLAIM_ACCEPTED` status
- [ ] Unknown selectors looked up at https://www.4byte.directory/

## What comes next

| Resolved issue               | Skill to use        |
| ---------------------------- | ------------------- |
| Re-deploy after fixing build | `cartesi-deploy`    |
| Resume local testing         | `cartesi-local-dev` |
