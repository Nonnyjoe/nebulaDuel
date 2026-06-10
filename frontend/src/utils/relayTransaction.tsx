import { ethers } from "ethers";
import {
  APPLICATION_ADDRESS,
  INPUTBOX_ADDRESS,
  CHAIN_ID,
  CHAIN_RPC,
  CHAIN_NAME,
  getProcessedInputCount,
  waitForInputProcessed,
} from "./cartesi";

declare global {
  interface Window {
    ethereum: any;
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
];

/** Fail fast with a clear message when the chain RPC itself is down —
 * otherwise MetaMask retries for minutes with a cryptic -32002 error. */
async function preflightChainRpc(): Promise<void> {
  if (!CHAIN_RPC) {
    throw new Error(
      "VITE_CHAIN_RPC is not set in frontend/.env.local — add it (e.g. http://127.0.0.1:6751/anvil) and restart the dev server.",
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

  // Chain: L1 inclusion -> node processes input -> notices/reports exist.
  let processed = false;
  if (baseline >= 0) {
    processed = await waitForInputProcessed(baseline);
  }

  return { txHash, processed };
}

/**
 * Send an input and wait until the Cartesi backend has processed it.
 * Returns the L1 transaction hash (kept for compatibility with existing
 * imports). After this resolves, refetching notices/inspect reflects the
 * new state — no arbitrary setTimeout needed.
 */
export default async function signMessages(message: any): Promise<string> {
  try {
    const { txHash, processed } = await sendInputToCartesi(message);
    console.log(
      `Input sent to Cartesi InputBox. Tx: ${txHash}, processed by node: ${processed}`,
    );
    return txHash;
  } catch (err: any) {
    console.log(err.message);
    throw err;
  }
}
