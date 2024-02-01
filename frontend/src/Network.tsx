import { FC, useState } from "react";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import configFile from "./config.json";
import "../src/Components/header/Header.css";

const config: any = configFile;

interface NetworkProps {
    onConnectWallet: () => void;
    onDisconnectWallet: () => void;
    isConnected: boolean;
  }

export const Network: FC<NetworkProps> = ({ onConnectWallet }) => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  // const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();
  const [isConnected, setIsConnected] = useState(false);

  const handleConnectWallet = async () => {
    try {
      await connect();
      setIsConnected(true);
      onConnectWallet();
      // console.log("wallet connected is:", wallet)
    } catch (error: any) {
      console.error("Error connecting wallet:", error.message);
    }
  };

  const handleDisconnectWallet = () => {
    //@ts-ignore
    disconnect(wallet);
    setIsConnected(false);
    //onDisconnectWallet();
  };


  return (
    <div>
      {!wallet && (
        <button onClick={handleConnectWallet} className="glButtonBorder flex alignCenter" >
          {connecting ? "Connecting" : "Connect"}
        </button>
      )}
      {wallet && (
        <div>
          <button onClick={handleDisconnectWallet} className="glButtonBorder flex alignCenter">Disconnect</button>
        </div>
      )}
    </div>
  );
};