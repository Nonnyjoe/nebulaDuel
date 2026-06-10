---
name: cartesi-contracts
version: 0.1.0
description: >-
  Wire L1 smart contracts into a Cartesi Rollups v2 application via the
  InputBox contract. Use this when the user needs inputs to originate from
  on-chain contracts (oracles, governance, bridges, feeds), wants to write
  Solidity contracts that call InputBox.addInput, needs to execute vouchers
  on-chain, or wants to validate on-chain outputs. Triggers on: "L1 contract",
  "InputBox", "addInput", "on-chain input", "oracle", "governance", "bridge",
  "voucher execution", "validate output", "Solidity contract", "Foundry",
  "on-chain ingress", "portal", "ERC20 bridge", "Ether bridge".
---

## Skill Version

| Skill               | Version | Cartesi Rollups target | Contract suite         | Last updated |
| ------------------- | ------- | ---------------------- | ---------------------- | ------------ |
| `cartesi-contracts` | `0.1.0` | v2.0-alpha             | cartesi-rollups v2.2.0 | May 2026     |

> Contract addresses in this skill are for **cartesi-rollups v2.2.0**. If the node is running a newer contract suite, the addresses will differ — check `compose.local.yaml` image tags and update accordingly. For local devnet, always resolve addresses from `cartesi address-book`.

# Cartesi Rollups v2 — L1 Contract Integration

## Goal

Wire Solidity smart contracts into a Cartesi dApp so that inputs can
originate from on-chain events, and so that application outputs (vouchers)
can be executed back on-chain. This skill covers: the InputBox ingress
pattern, L1 contract architecture, access control, Foundry deployment, and
on-chain output execution. It does not cover frontend integration (see
`cartesi-frontend`) or node deployment (see `cartesi-deploy`).

## Core mental model

```
External protocol / user
        │
        ▼
┌──────────────────┐      addInput(app, payload)      ┌─────────────────────┐
│  Your L1 Contract│ ──────────────────────────────▶  │  InputBox Contract  │
└──────────────────┘                                   └──────────┬──────────┘
                                                                  │ InputAdded event
                                                                  ▼
                                                       ┌─────────────────────┐
                                                       │  Cartesi Rollups    │
                                                       │  Node (EVM Reader)  │
                                                       └──────────┬──────────┘
                                                                  │ forwards to
                                                                  ▼
                                                       ┌─────────────────────┐
                                                       │  Cartesi Machine    │
                                                       │  (advance handler)  │
                                                       └─────────────────────┘
```

The **InputBox** is the single canonical ingress point from L1 into Cartesi.
Any contract or wallet can call `InputBox.addInput(application, payload)` to
submit an advance input.

## Resolving contract addresses

> **Never hardcode contract addresses.** Cartesi contracts are redeployed with each protocol version and differ by chain. Always resolve addresses at task time using one of the methods below.

### For local devnet (`cartesi run`)

```sh
cartesi address-book
```

This prints every deployed address for the running Anvil network — InputBox, all portals, AuthorityFactory, ApplicationFactory, your app contract, and the auto-deployed test tokens. Use this as the single source of truth when working locally.

### For testnets and production — cartesi-rollups v2.2.0

The contracts below are the canonical **v2.2.0** deployment. All contracts in this version are deployed as a coordinated suite and are designed to work together — every portal takes `InputBox` as a constructor argument, and `SelfHostedApplicationFactory` wraps both `AuthorityFactory` and `ApplicationFactory`. Use these addresses for any EVM testnet or mainnet that has the v2.2.0 suite deployed.

> **Version note**: Future releases of `cartesi-rollups` will produce a new suite at different addresses. Always check the `cartesi-rollups-runtime` image tag in `compose.local.yaml` to confirm which contract version the running node targets, and use the matching address set. If addresses for a newer version are needed, check the Cannon registry: `https://usecannon.com/packages/cartesi-rollups/<version>/84532-main/deployment/contracts` (open in a browser — the page is client-side rendered).

| Contract                       | Address                                      | Role                                                         |
| ------------------------------ | -------------------------------------------- | ------------------------------------------------------------ |
| `InputBox`                     | `0x1b51e2992A2755Ba4D6F7094032DF91991a0Cfac` | Single ingress point — all inputs enter Cartesi through here |
| `EtherPortal`                  | `0xA632c5c05812c6a6149B7af5C56117d1D2603828` | Bridge native ETH into the Cartesi Machine                   |
| `ERC20Portal`                  | `0xACA6586A0Cf05bD831f2501E7B4aea550dA6562D` | Bridge ERC-20 tokens into the Cartesi Machine                |
| `ERC721Portal`                 | `0x9E8851dadb2b77103928518846c4678d48b5e371` | Bridge ERC-721 NFTs into the Cartesi Machine                 |
| `ERC1155SinglePortal`          | `0x18558398Dd1a8cE20956287a4Da7B76aE7A96662` | Bridge a single ERC-1155 token into the Cartesi Machine      |
| `ERC1155BatchPortal`           | `0xe246Abb974B307490d9C6932F48EbE79de72338A` | Bridge a batch of ERC-1155 tokens into the Cartesi Machine   |
| `AuthorityFactory`             | `0x5E96408CFE423b01dADeD3bc867E6013135990cc` | Deploy new Authority (single-validator) consensus contracts  |
| `QuorumFactory`                | `0x1C91Ba8aa5648cdAC77E97eaC781447c646EF239` | Deploy new Quorum (multi-validator) consensus contracts      |
| `ApplicationFactory`           | `0x26E758238CB6eC5aB70ce0dd52aF2d7b82e1972E` | Deploy new Cartesi Application contracts                     |
| `SelfHostedApplicationFactory` | `0x010D3CbB4223F5bCc7b7B03cEE59f3aAea8eDb8A` | Deploy application + authority together in one transaction   |
| `SafeERC20Transfer`            | `0xb7C2bcAA4437425cfcE9d233bFf15EF461273D63` | Helper for ERC-20 transfers via delegated call vouchers      |

## Step 1 — IInputBox interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IInputBox {
    function addInput(
        address application,
        bytes calldata payload
    ) external returns (bytes32);
}
```

## Step 2 — Minimal L1 contract pattern

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IInputBox.sol";

contract MyCartesiFeeder is Ownable {
    IInputBox public immutable inputBox;
    address public immutable application;

    event InputSent(bytes payload, bytes32 inputHash);

    constructor(address _inputBox, address _application) Ownable(msg.sender) {
        inputBox = IInputBox(_inputBox);
        application = _application;
    }

    /// @notice Send a payload to the Cartesi application via InputBox.
    /// @dev Only privileged callers should invoke this for sensitive feeds.
    function sendInput(bytes calldata payload) external onlyOwner returns (bytes32) {
        bytes32 inputHash = inputBox.addInput(application, payload);
        emit InputSent(payload, inputHash);
        return inputHash;
    }
}
```

Key hardening rules:

- **Access control**: Use `onlyOwner`, roles, or an allowlist on any function
  that sends sensitive data. Document who may call it.
- **Events**: Always emit an event with the payload metadata for off-chain
  indexers and debugging.
- **Immutability**: The `application` address is typically fixed at deploy.
  If the app address changes (e.g. re-deployment), you must redeploy or
  upgrade the L1 contract — plan migrations explicitly.

## Step 3 — Payload encoding

The payload your L1 contract sends must match what the Cartesi backend
decodes. Use consistent encoding across both layers.

### ABI encoding (Solidity → backend)

Solidity side:

```solidity
bytes memory payload = abi.encode(
    msg.sender,      // address
    amount,          // uint256
    tokenAddress     // address
);
inputBox.addInput(application, payload);
```

Backend side (JavaScript with viem):

```js
import { decodeAbiParameters, parseAbiParameters } from "viem";

const [sender, amount, token] = decodeAbiParameters(
  parseAbiParameters("address sender, uint256 amount, address token"),
  payload,
);
```

### UTF-8 / JSON encoding (simpler, less gas-efficient)

Solidity side:

```solidity
bytes memory payload = bytes('{"action":"oracle_update","value":42}');
inputBox.addInput(application, payload);
```

Backend side:

```js
const input = JSON.parse(hexToString(data.payload));
```

Choose ABI encoding for structured data from contracts; JSON encoding for
human-readable or prototype payloads.

## Step 4 — On-chain oracle / feed pattern

For contracts that push external data into Cartesi on a schedule or trigger:

```solidity
contract PriceFeedFeeder is Ownable {
    IInputBox public immutable inputBox;
    address public immutable application;
    AggregatorV3Interface public immutable priceFeed;

    constructor(
        address _inputBox,
        address _application,
        address _priceFeed
    ) Ownable(msg.sender) {
        inputBox = IInputBox(_inputBox);
        application = _application;
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    /// @notice Push latest price into the Cartesi app. Only owner may call.
    function pushLatestPrice() external onlyOwner {
        (, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();
        bytes memory payload = abi.encode(price, updatedAt);
        inputBox.addInput(application, payload);
    }
}
```

## Step 5 — Asset portals (ERC-20, Ether, ERC-721, ERC-1155)

Cartesi provides official portal contracts for bridging assets into the
Cartesi Machine. Use these instead of writing custom deposit logic.

| Asset    | Portal Contract       | Function                                                         |
| -------- | --------------------- | ---------------------------------------------------------------- |
| Ether    | `EtherPortal`         | `depositEther(address app, bytes execLayerData)`                 |
| ERC-20   | `ERC20Portal`         | Approve first, then `depositERC20Tokens(...)`                    |
| ERC-721  | `ERC721Portal`        | `setApprovalForAll` first, then `depositERC721Token(...)`        |
| ERC-1155 | `ERC1155SinglePortal` | `setApprovalForAll` first, then `depositSingleERC1155Token(...)` |

### Local devnet portal addresses

When using `cartesi run`, all portal addresses are auto-deployed on Anvil. Resolve them with:

```sh
cartesi address-book
```

This lists `ERC20Portal`, `ERC721Portal`, `ERC1155SinglePortal`, `EtherPortal`, and all other deployed contracts. Do not use hardcoded addresses — they can change between CLI versions.

### Depositing ERC-20 via portal (cast commands)

```sh
# 1. Approve the portal to spend tokens
cast send <ERC20_TOKEN_ADDRESS> \
  "approve(address,uint256)" \
  <ERC20_PORTAL_ADDRESS> <AMOUNT_WEI> \
  --rpc-url <RPC_URL> --private-key <PRIVATE_KEY>

# 2. Deposit tokens into the Cartesi application
cast send <ERC20_PORTAL_ADDRESS> \
  "depositERC20Tokens(address,address,uint256,bytes)" \
  <ERC20_TOKEN_ADDRESS> <APP_ADDRESS> <AMOUNT_WEI> 0x \
  --rpc-url <RPC_URL> --private-key <PRIVATE_KEY>
```

### Depositing ERC-721 via portal (cast commands)

```sh
# 1. Grant approval to portal
cast send <NFT_ADDRESS> \
  "setApprovalForAll(address,bool)" \
  <ERC721_PORTAL_ADDRESS> true \
  --rpc-url <RPC_URL> --private-key <PRIVATE_KEY>

# 2. Deposit the NFT (token ID, baseLayerData, execLayerData)
cast send <ERC721_PORTAL_ADDRESS> \
  "depositERC721Token(address,address,uint256,bytes,bytes)" \
  <NFT_ADDRESS> <APP_ADDRESS> <TOKEN_ID> 0x 0x \
  --rpc-url <RPC_URL> --private-key <PRIVATE_KEY>
```

### Depositing ERC-1155 via portal (cast commands)

```sh
# 1. Grant approval
cast send <ERC1155_ADDRESS> \
  "setApprovalForAll(address,bool)" \
  <ERC1155_SINGLE_PORTAL_ADDRESS> true \
  --rpc-url <RPC_URL> --private-key <PRIVATE_KEY>

# 2. Deposit single token (tokenId, amount, baseLayerData, execLayerData)
cast send <ERC1155_SINGLE_PORTAL_ADDRESS> \
  "depositSingleERC1155Token(address,address,uint256,uint256,bytes,bytes)" \
  <ERC1155_ADDRESS> <APP_ADDRESS> <TOKEN_ID> <AMOUNT> 0x 0x \
  --rpc-url <RPC_URL> --private-key <PRIVATE_KEY>
```

### Handling portal deposits in your backend

Portal interactions arrive as advance inputs where `metadata.msg_sender` equals
the portal contract address. Your backend **must** check the sender to determine
how to decode the payload.

**ERC-20 deposit payload format (bytes layout):**

```
bytes  0–19:  token address (20 bytes)
bytes 20–39:  depositor address (20 bytes)
bytes 40–71:  amount (uint256, 32 bytes, big-endian)
```

JavaScript decode example:

```js
import { ethers } from "ethers";
import { getAddress } from "viem";

// Resolve portal address from environment — never hardcode.
// Set CARTESI_PORTAL_ERC20 from `cartesi address-book` output before starting the app.
const ERC20_PORTAL = (process.env.CARTESI_PORTAL_ERC20 || "").toLowerCase();

function parseERC20Deposit(payload) {
  const token = getAddress(ethers.dataSlice(payload, 0, 20));
  const depositor = getAddress(ethers.dataSlice(payload, 20, 40));
  const amount = BigInt(ethers.dataSlice(payload, 40, 72));
  return { token, depositor, amount };
}

async function handle_advance(data) {
  const sender = data.metadata.msg_sender.toLowerCase();

  if (ERC20_PORTAL && sender === ERC20_PORTAL) {
    const { token, depositor, amount } = parseERC20Deposit(data.payload);
    // credit balance, emit notice, etc.
    return "accept";
  }
  // ... handle other input types
}
```

**ERC-721 deposit payload format:**

```
bytes  0–19:  token address (20 bytes)
bytes 20–39:  depositor address (20 bytes)
bytes 40–71:  token ID (uint256, 32 bytes)
```

**ERC-1155 single deposit payload format:**

```
bytes  0–19:  token address (20 bytes)
bytes 20–39:  depositor address (20 bytes)
bytes 40–71:  token ID (uint256, 32 bytes)
bytes 72–103: amount (uint256, 32 bytes)
```

> **Rule**: Always isolate portal decode logic from your core application logic.
> Keep portal detection in a dedicated dispatcher. Always keep portal code in a
> **separate component** from your core input logic.

## Step 6 — Voucher execution on-chain

After an epoch closes and a claim is accepted, vouchers can be executed
on-chain. Use the Cartesi CLI:

```sh
# Validate output proof (check it is on-chain verifiable)
cartesi-rollups-cli validate <app-name> <output-index>

# Execute a voucher on-chain (requires funded wallet)
cartesi-rollups-cli execute <app-name> <output-index>
# Skip confirmation
cartesi-rollups-cli execute <app-name> <output-index> --yes
```

Required env vars for execution:

```sh
export CARTESI_DATABASE_CONNECTION=...
export CARTESI_BLOCKCHAIN_HTTP_ENDPOINT=...
export CARTESI_AUTH_MNEMONIC="..."
```

Vouchers encode a full contract call (`destination` + ABI-encoded payload).
Only Vouchers and Delegated Call Vouchers are executable. Notices are
attestation-only.

## Step 7 — Foundry deployment

### Deploy script

```solidity
// script/Deploy.s.sol
pragma solidity ^0.8.20;
import "forge-std/Script.sol";
import "../src/MyCartesiFeeder.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        // Resolve InputBox address from `cartesi address-book` (local)
        // or from https://usecannon.com/packages/cartesi-rollups/2.2.0/84532-main/deployment/contracts
        address inputBox   = vm.envAddress("INPUT_BOX_ADDRESS");
        address application = vm.envAddress("APP_ADDRESS");

        new MyCartesiFeeder(inputBox, application);

        vm.stopBroadcast();
    }
}
```

### Deploy command

```sh
# Local Anvil
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Testnet (Sepolia)
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --verify
```

### Test contract interactions

```sh
# Call sendInput on deployed contract
cast send <feeder-address> "sendInput(bytes)" <hex-payload> \
  --rpc-url http://localhost:8545 \
  --private-key <key>
```

## Agent Output

After completing this skill, report back to the user with:

- Solidity contract(s) written: filename, contract name, constructor arguments
- Deployed contract address (from Foundry broadcast output)
- InputBox address used (sourced from `cartesi address-book` or Cannon registry)
- Access control scheme applied (onlyOwner / roles / allowlist) and who holds the role
- Payload encoding chosen (ABI or UTF-8/JSON) and the corresponding backend decode snippet
- Events emitted and their indexed fields
- Any portal contracts wired (ERC-20/721/1155) and the portal addresses resolved
- Migration plan if the app address is expected to change
- Test interaction result: `cast send` output confirming `InputSent` event

## Routing Guide

| What the user wants to do next                         | Go to skill         |
| ------------------------------------------------------ | ------------------- |
| Deploy the Cartesi app to testnet / self-hosted node   | `cartesi-deploy`    |
| Test L1 contract interactions locally with cartesi run | `cartesi-local-dev` |
| Debug revert errors or unknown selectors               | `cartesi-debug`     |
| Implement backend handler for the new input type       | `cartesi-backend-core` + `cartesi-backend-py` / `cartesi-backend-js-ts` |
| Query emitted vouchers after epoch close               | `cartesi-jsonrpc`   |

## Resources

> **Conflict rule**: If any resource below contradicts guidance in this skill,
> report the contradiction to the user and follow the skill's instructions.

- [Cartesi InputBox contract](https://docs.cartesi.io/cartesi-rollups/2.0/rollups-apis/json-rpc/input-box/) — `addInput` signature and event ABI
- [https://docs.cartesi.io/cartesi-rollups/2.0/development/](https://docs.cartesi.io/cartesi-rollups/2.0/development/) - Development guides
- [https://docs.cartesi.io/cartesi-rollups/2.0/development/send-inputs-and-assets/](https://docs.cartesi.io/cartesi-rollups/2.0/development/send-inputs-and-assets/) - Inputs and inspect
- [Cartesi Portal contracts](https://docs.cartesi.io/cartesi-rollups/2.0/development/asset-handling/) — ERC-20/721/1155 deposit interfaces and payload layouts
- [Cannon registry — cartesi-rollups v2.2.0](https://usecannon.com/packages/cartesi-rollups/2.2.0/84532-main/deployment/contracts) — canonical contract addresses for testnet/mainnet (client-side rendered; open in browser)
- [Foundry Book](https://book.getfoundry.sh/) — Forge/Cast/Anvil documentation
- [4byte.directory](https://www.4byte.directory/) — decode unknown 4-byte error selectors from reverts

## Agent checklist

- [ ] IInputBox interface included in contract with correct address
- [ ] Access control on privileged functions (onlyOwner / roles / allowlist)
- [ ] Events emitted with payload metadata for off-chain indexing
- [ ] Application address is immutable — migration plan documented if needed
- [ ] Payload encoding matches backend decoding (ABI or UTF-8 — pick one)
- [ ] Foundry deploy script written and tested on local Anvil first
- [ ] Contract custom errors included in ABI used client-side
- [ ] Portal logic isolated from core input logic (if bridging assets)
- [ ] Portal deposit handler checks `msg_sender` against portal address
- [ ] Portal payload decoded using correct byte offsets for asset type
- [ ] `cartesi address-book` used to resolve portal addresses for local devnet
- [ ] Voucher execution tested with `cartesi-rollups-cli execute` after epoch close

## What comes next

| Next task                        | Skill to use     |
| -------------------------------- | ---------------- |
| Deploy to self-hosted node       | `cartesi-deploy` |
| Debug contract or backend errors | `cartesi-debug`  |
