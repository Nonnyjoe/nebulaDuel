/**
 * On-chain contract addresses — all sourced from frontend/.env.local, never
 * hardcoded, so local devnet / testnet only differ by env values.
 *
 *   VITE_ERC20_PORTAL     ERC-20 portal address (from `cartesi run` output)
 *   VITE_CTSI_ADDRESS     CTSI token address
 *   VITE_DAPP_ADDRESS     application contract address (shared with cartesi.ts)
 */
import { APPLICATION_ADDRESS } from "./cartesi";

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    console.error(
      `Missing ${name} in frontend/.env.local — set it and restart the dev server.`,
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
export const DAPP: string = APPLICATION_ADDRESS;
