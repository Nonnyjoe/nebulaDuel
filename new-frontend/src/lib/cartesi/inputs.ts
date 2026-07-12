/**
 * Write path — submit inputs to the Cartesi app via InputBox.addInput on L1.
 *
 * Ported from the old frontend's relayTransaction.tsx. Uses ethers v5 over the
 * injected wallet (window.ethereum), which thirdweb's connected wallet also
 * populates, so it works alongside the ThirdwebProvider connect flow.
 */
import { ethers } from "ethers";
import {
  APPLICATION_ADDRESS,
  INPUTBOX_ADDRESS,
  CHAIN_ID,
  CHAIN_RPC,
  CHAIN_NAME,
  getProcessedInputCount,
  waitForInputProcessed,
  getInputOutcome,
  clearInspectCache,
} from "./client";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const INPUT_BOX_ABI = [
  {
    inputs: [
      { internalType: "address", name: "appContract", type: "address" },
      { internalType: "bytes", name: "payload", type: "bytes" },
    ],
    name: "addInput",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "appContract", type: "address" },
      { indexed: true, internalType: "uint256", name: "index", type: "uint256" },
      { indexed: false, internalType: "bytes", name: "input", type: "bytes" },
    ],
    name: "InputAdded",
    type: "event",
  },
];

/** Fail fast with a clear message when the chain RPC itself is down —
 * otherwise MetaMask retries for minutes with a cryptic -32002 error. */
async function preflightChainRpc(): Promise<void> {
  if (!CHAIN_RPC) {
    throw new Error(
      "VITE_CHAIN_RPC is not set in new-frontend/.env.local — add it (e.g. http://127.0.0.1:6751/anvil) and restart the dev server.",
    );
  }
  try {
    const res = await fetch(CHAIN_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_chainId",
        params: [],
      }),
    });
    const json = await res.json();
    const chainId = parseInt(json?.result ?? "0x0", 16);
    if (chainId !== CHAIN_ID) {
      throw new Error(
        `Chain RPC at ${CHAIN_RPC} reports chain id ${chainId}, expected ${CHAIN_ID}. Is the right network running?`,
      );
    }
  } catch (e: any) {
    if (e?.message?.includes("expected")) throw e;
    throw new Error(
      `Cannot reach the blockchain RPC at ${CHAIN_RPC} — make sure \`cartesi run\` is up before sending transactions.`,
    );
  }
}

/** Ensure the wallet is on the expected chain, offering to switch/add it. */
async function ensureWalletChain(): Promise<void> {
  const currentHex: string = await window.ethereum.request({
    method: "eth_chainId",
  });
  if (parseInt(currentHex, 16) === CHAIN_ID) return;

  const chainIdHex = "0x" + CHAIN_ID.toString(16);
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (switchError: any) {
    // 4902: chain not added to the wallet yet
    if (switchError?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainIdHex,
            chainName: CHAIN_NAME,
            rpcUrls: [CHAIN_RPC],
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          },
        ],
      });
    } else {
      throw new Error(
        `Please switch your wallet to chain ${CHAIN_ID} (${CHAIN_NAME}) and try again.`,
      );
    }
  }
}

export interface SendInputResult {
  txHash: string;
  /** true when the Cartesi node has fully processed the input — state reads
   * (notices / inspect) made after this point will see the new state. */
  processed: boolean;
  /** true only when the backend ACCEPTED the input (state actually changed).
   * False means the dapp rejected it (e.g. insufficient funds). */
  accepted: boolean;
  /** the backend's rejection message, when accepted === false. */
  error?: string;
  /** the InputBox index of this input (−1 if it couldn't be determined). */
  inputIndex: number;
}

async function sendInputToCartesi(message: any): Promise<SendInputResult> {
  if (!window?.ethereum) {
    throw new Error("No crypto wallet found. Please install it.");
  }
  if (!INPUTBOX_ADDRESS || !APPLICATION_ADDRESS) {
    throw new Error(
      "VITE_INPUTBOX_ADDRESS or VITE_DAPP_ADDRESS is not configured",
    );
  }

  // Fail fast with actionable errors instead of MetaMask's -32002 retry loop.
  await preflightChainRpc();
  await window.ethereum.request({ method: "eth_requestAccounts" });
  await ensureWalletChain();

  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  const signer = provider.getSigner();

  const inputBox = new ethers.Contract(INPUTBOX_ADDRESS, INPUT_BOX_ABI, signer);

  const payload = ethers.utils.toUtf8Bytes(JSON.stringify({ data: message }));

  // Snapshot the processed-input count BEFORE submitting, so we can detect
  // when the node has consumed our input.
  let baseline = -1;
  try {
    baseline = await getProcessedInputCount();
  } catch {
    // node unreachable for reads — still allow the tx, just skip the wait
  }

  const tx = await inputBox.addInput(APPLICATION_ADDRESS, payload);
  const receipt = await tx.wait();
  const txHash = receipt?.transactionHash ?? tx.hash;

  // The exact InputBox index of our input (robust against concurrent inputs).
  let inputIndex = -1;
  for (const log of receipt?.logs ?? []) {
    try {
      const parsed = inputBox.interface.parseLog(log);
      if (parsed.name === "InputAdded") {
        inputIndex = (parsed.args.index as ethers.BigNumber).toNumber();
        break;
      }
    } catch {
      /* not the InputAdded event */
    }
  }
  if (inputIndex < 0 && baseline >= 0) inputIndex = baseline; // fallback

  // Chain: L1 inclusion -> node processes input -> notices/reports exist.
  let processed = false;
  let accepted = true;
  let error: string | undefined;
  if (inputIndex >= 0) {
    processed = await waitForInputProcessed(inputIndex);
    // Only trust the verdict once the input was actually processed.
    if (processed) {
      const outcome = await getInputOutcome(inputIndex);
      accepted = outcome.accepted;
      error = outcome.error;
    }
  }

  return { txHash, processed, accepted, error, inputIndex };
}

/**
 * Send a raw message (already shaped like `{ func, ...fields }`) and wait until
 * the Cartesi backend has processed it. Returns the L1 transaction hash.
 */
export default async function signMessages(message: any): Promise<string> {
  const { txHash } = await sendInputToCartesi(message);
  // The machine state just changed — drop cached reads so the next fetch
  // reflects it.
  clearInspectCache();
  return txHash;
}

/**
 * Ergonomic wrapper: `sendInput("create_player", { monika, avatar_url })`
 * builds the `{ func, ...fields }` envelope the backend router expects.
 * Returns the full result so callers can branch on `processed`.
 */
export async function sendInput(
  func: string,
  fields: Record<string, unknown> = {},
): Promise<SendInputResult> {
  const result = await sendInputToCartesi({ func, ...fields });
  clearInspectCache();
  return result;
}
