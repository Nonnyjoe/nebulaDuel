import React from "react";
import { Button } from "../atom/Button";
import { createThirdwebClient } from "thirdweb";
import { darkTheme } from "thirdweb/react";
import { ConnectButton } from "thirdweb/react";
import { useActiveAccount } from "thirdweb/react";

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
  console.log("Connected account is " + activeAccount?.address);

  return(
    <Button className="tg-border-btn text-gray-100 text-[0.7rem] font-bold font-barlow px-4 py-2 flex justify-center items-center">
      <ConnectButton client={client} theme={customTheme} />
    </Button>
  ) 
};

export default ConnectButton2;
