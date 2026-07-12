/**
 * On-chain portal addresses + deposit helpers — all sourced from
 * new-frontend/.env.local, never hardcoded.
 *
 *   VITE_ERC20_PORTAL     ERC-20 portal address (from `cartesi run` output)
 *   VITE_CTSI_ADDRESS     CTSI token address
 *   VITE_ERC721_PORTAL    ERC-721 portal address (NFT character bridge)
 *   VITE_NEBULA_NFT_ADDRESS  Nebula character NFT collection
 *   VITE_DAPP_ADDRESS     application contract address (shared with client.ts)
 */
import { ethers } from "ethers";
import { APPLICATION_ADDRESS } from "./client";

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    console.error(
      `Missing ${name} in new-frontend/.env.local — set it and restart the dev server.`,
    );
    return "";
  }
  return value;
}

export const ERC20Portal: string = requireEnv(
  "VITE_ERC20_PORTAL",
  import.meta.env.VITE_ERC20_PORTAL,
);
export const CTSI: string = requireEnv(
  "VITE_CTSI_ADDRESS",
  import.meta.env.VITE_CTSI_ADDRESS,
);
export const ERC721Portal: string = requireEnv(
  "VITE_ERC721_PORTAL",
  import.meta.env.VITE_ERC721_PORTAL,
);
export const NebulaNFT: string = requireEnv(
  "VITE_NEBULA_NFT_ADDRESS",
  import.meta.env.VITE_NEBULA_NFT_ADDRESS,
);
export const DAPP: string = APPLICATION_ADDRESS;

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const ERC20_PORTAL_ABI = [
  "function depositERC20Tokens(address token, address app, uint256 amount, bytes execLayerData)",
];

const ERC721_ABI = [
  "function approve(address to, uint256 tokenId)",
  "function ownerOf(uint256 tokenId) view returns (address)",
];

const ERC721_PORTAL_ABI = [
  "function depositERC721Token(address token, address app, uint256 tokenId, bytes baseLayerData, bytes execLayerData)",
];

/** Read the connected wallet's CTSI balance (as a bigint of base units). */
export async function ctsiBalanceOf(
  owner: string,
  provider: ethers.providers.Provider,
): Promise<ethers.BigNumber> {
  const token = new ethers.Contract(CTSI, ERC20_ABI, provider);
  return token.balanceOf(owner);
}

/**
 * Deposit CTSI into the app via the ERC-20 portal: approve if needed, then
 * depositERC20Tokens. `amount` is in base units (wei). The backend credits the
 * depositing wallet's in-app balance (see handle_deposit).
 */
export async function depositCtsi(
  amount: ethers.BigNumberish,
  signer: ethers.Signer,
): Promise<ethers.ContractReceipt> {
  const owner = await signer.getAddress();
  const token = new ethers.Contract(CTSI, ERC20_ABI, signer);
  const current: ethers.BigNumber = await token.allowance(owner, ERC20Portal);
  if (current.lt(amount)) {
    const approveTx = await token.approve(ERC20Portal, amount);
    await approveTx.wait();
  }
  const portal = new ethers.Contract(ERC20Portal, ERC20_PORTAL_ABI, signer);
  const tx = await portal.depositERC20Tokens(CTSI, DAPP, amount, "0x");
  return tx.wait();
}

/**
 * Re-import a character NFT into the app via the ERC-721 portal: approve the
 * portal for the token, then depositERC721Token (see handle_deposit_character_as_nft).
 */
export async function depositCharacterNft(
  tokenId: ethers.BigNumberish,
  signer: ethers.Signer,
): Promise<ethers.ContractReceipt> {
  const nft = new ethers.Contract(NebulaNFT, ERC721_ABI, signer);
  const approveTx = await nft.approve(ERC721Portal, tokenId);
  await approveTx.wait();
  const portal = new ethers.Contract(ERC721Portal, ERC721_PORTAL_ABI, signer);
  const tx = await portal.depositERC721Token(NebulaNFT, DAPP, tokenId, "0x", "0x");
  return tx.wait();
}
