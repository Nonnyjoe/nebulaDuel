import { useEffect } from "react";
import { Button } from "../atom/Button";
import { createThirdwebClient } from "thirdweb";
import { darkTheme, ConnectButton, useActiveAccount, useActiveWalletConnectionStatus } from "thirdweb/react";
import { useProfileContext } from "../contexts/ProfileContext";
import fetchNotices from "../../utils/readSubgraph.js";
import { anvil } from "thirdweb/chains";

const clientId = "5555e76cfe72676f69d044a91ce98d30";
const client = createThirdwebClient({ clientId });

const customTheme = darkTheme({
  colors: {
    primaryText: "white",
    secondaryText: "#FFFFFFFF",
    accentText: "#FFFFFFFF",
    primaryButtonBg: "",
    primaryButtonText: "#FFFFFFFF",
    borderColor: "FFFFFF",
    skeletonBg: "green",
    connectedButtonBg: "",
  },
});

const ConnectButton2 = () => {
  const activeAccount = useActiveAccount();
  const { profile, setProfile } = useProfileContext();
  const status = useActiveWalletConnectionStatus();

  useEffect(() => {
    const syncProfile = async () => {
      const walletAddress = activeAccount?.address?.toLowerCase();
      if (status !== "connected" || !walletAddress) return;

      const currentProfileAddress = profile?.wallet_address?.toLowerCase();
      if (currentProfileAddress === walletAddress) return;

      let request_payload = await fetchNotices("all_profiles");
      if (!request_payload || !Array.isArray(request_payload)) {
        return;
      }

      request_payload = request_payload.filter(
        (p: any) => p.wallet_address === walletAddress,
      );

      if (request_payload.length > 0) {
        setProfile(request_payload[0]);
      }
    };

    syncProfile();
  }, [status, activeAccount?.address, profile?.wallet_address, setProfile]);

  return (
    <Button className="tg-border-btn text-gray-100 text-[0.7rem] font-bold font-barlow px-4 py-2 flex justify-center items-center">
      <ConnectButton client={client} theme={customTheme} chain={anvil} />
    </Button>
  );
};

export default ConnectButton2;
