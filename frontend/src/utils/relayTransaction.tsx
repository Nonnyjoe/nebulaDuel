import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum: any;
  }
}

const INPUTBOX_ADDRESS = import.meta.env.VITE_INPUTBOX_ADDRESS as string;
const DAPP_ADDRESS = import.meta.env.VITE_DAPP_ADDRESS as string;

const INPUT_BOX_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_dapp", type: "address" },
      { internalType: "bytes", name: "_input", type: "bytes" },
    ],
    name: "addInput",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

async function sendInputToCartesi(message: any) {
  if (!window?.ethereum) {
    throw new Error("No crypto wallet found. Please install it.");
  }
  if (!INPUTBOX_ADDRESS || !DAPP_ADDRESS) {
    throw new Error(
      "VITE_INPUTBOX_ADDRESS or VITE_DAPP_ADDRESS is not configured",
    );
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const inputBox = new ethers.Contract(
    INPUTBOX_ADDRESS,
    INPUT_BOX_ABI,
    signer,
  );

  const payload = ethers.utils.toUtf8Bytes(JSON.stringify({ data: message }));

  const tx = await inputBox.addInput(DAPP_ADDRESS, payload);
  const receipt = await tx.wait();

  return receipt?.transactionHash ?? tx.hash;
}

// Kept name for compatibility with existing imports
export default async function signMessages(message: any) {
  try {
    const hash = await sendInputToCartesi(message);
    console.log("Input sent to Cartesi InputBox. Tx hash:", hash);
    return hash;
  } catch (err: any) {
    console.log(err.message);
    throw err;
  }
}