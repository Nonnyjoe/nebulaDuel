import { ethers } from "ethers";

/** ethers v5 signer over the injected browser wallet (window.ethereum). */
export function getBrowserSigner(): ethers.Signer {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No crypto wallet found. Connect a wallet first.");
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  return provider.getSigner();
}
