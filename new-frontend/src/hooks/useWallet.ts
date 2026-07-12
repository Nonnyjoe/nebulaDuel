import { useCallback } from "react";
import {
  useActiveAccount,
  useActiveWallet,
  useConnectModal,
  useDisconnect,
} from "thirdweb/react";
import { client, chain } from "@/lib/thirdweb";

/**
 * Thin wrapper around thirdweb's wallet hooks so the rest of the app talks to a
 * stable, design-agnostic surface (we open thirdweb's modal from our own
 * styled buttons rather than embedding thirdweb's ConnectButton UI).
 */
export function useWallet() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { connect, isConnecting } = useConnectModal();
  const { disconnect } = useDisconnect();

  const address = account?.address?.toLowerCase() ?? null;

  const openConnect = useCallback(() => {
    void connect({ client, chain });
  }, [connect]);

  const disconnectWallet = useCallback(() => {
    if (wallet) disconnect(wallet);
  }, [disconnect, wallet]);

  return {
    address,
    account,
    isConnected: !!address,
    isConnecting,
    connect: openConnect,
    disconnect: disconnectWallet,
  };
}
