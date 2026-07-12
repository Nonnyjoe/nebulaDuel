import { createThirdwebClient, defineChain } from "thirdweb";
import { CHAIN_ID, CHAIN_NAME, CHAIN_RPC } from "@/lib/cartesi/client";

// thirdweb client id — set VITE_THIRDWEB_CLIENT_ID in .env.local. A dev id is
// baked in as a fallback so local runs work out of the box.
const clientId =
  import.meta.env.VITE_THIRDWEB_CLIENT_ID ?? "5555e76cfe72676f69d044a91ce98d30";

export const client = createThirdwebClient({ clientId });

/**
 * Local chain config. Cartesi CLI v2 proxies the anvil chain at <node-url>/anvil
 * — do NOT use thirdweb's built-in `anvil` chain, which points at localhost:8545.
 */
export const chain = defineChain({
  id: CHAIN_ID,
  name: CHAIN_NAME,
  rpc: CHAIN_RPC,
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
});
