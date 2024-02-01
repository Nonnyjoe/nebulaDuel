// // Copyright 2022 Cartesi Pte. Ltd.

// // Licensed under the Apache License, Version 2.0 (the "License"); you may not
// // use this file except in compliance with the License. You may obtain a copy
// // of the license at http://www.apache.org/licenses/LICENSE-2.0

// // Unless required by applicable law or agreed to in writing, software
// // distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// // WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// // License for the specific language governing permissions and limitations
// // under the License.

// import { FC } from "react";
// import { useConnectWallet, useSetChain } from "@web3-onboard/react";
// import configFile from "./config.json";

// const config: any = configFile;

// export const Network: FC = () => {
//     const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
//     const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();

//     return (
//         <div>
//             {!wallet && <button
//                 onClick={() =>
//                     connect()
//                 }
//             >
//                 {connecting ? "connecting" : "connect"}
//             </button>}
//             {wallet && (
//                 <div>
//                     <label>Switch Chain</label>
//                     {settingChain ? (
//                         <span>Switching chain...</span>
//                     ) : (
//                         <select
//                             onChange={({ target: { value } }) => {
//                                 if (config[value] !== undefined) {
//                                     setChain({ chainId: value })
//                                 } else {
//                                     alert("No deploy on this chain")
//                                 }
//                                 }
//                             }
//                             value={connectedChain?.id}
//                         >
//                             {chains.map(({ id, label }) => {
//                                 return (
//                                     <option key={id} value={id}>
//                                         {label}
//                                     </option>
//                                 );
//                             })}
//                         </select>
//                     )}
//                     <button onClick={() => disconnect(wallet)}>
//                         Disconnect Wallet
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

import { FC, useEffect, useState } from "react";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import configFile from "./config.json";
import "../src/Components/header/Header.css";
import { useConnectedAddress } from "./ConnectedAddressContext";

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
  const { connectedAddress, setConnectedAddress } = useConnectedAddress();

  const handleConnectWallet = async () => {
    try {
      await connect();
      setIsConnected(true);
      onConnectWallet();
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

  //get connected address after handleDisconnectWallet is clicked

  useEffect(() => {
    if (wallet) {
      setIsConnected(true);
      setConnectedAddress(wallet?.accounts[0].address);
      console.log("connected address", connectedAddress); 
      console.log("wallet", wallet);
      console.log("address", wallet?.accounts[0].address);
    }
  }
  , [wallet]);





  return (
    <div>
      {!wallet && (
        <button onClick={handleConnectWallet} className="glButtonBorder flex alignCenter" >
          {connecting ? "Connecting" : "Connect"}
        </button>
      )}
      {wallet && (
        <div>
          {/* <label>Switch Chain</label>
                              {settingChain ? (
                        <span>Switching chain...</span>
                    ) : (
                        <select
                            onChange={({ target: { value } }) => {
                                if (config[value] !== undefined) {
                                    setChain({ chainId: value })
                                } else {
                                    alert("No deploy on this chain")
                                }
                                }
                            }
                            value={connectedChain?.id}
                        >
                            {chains.map(({ id, label }) => {
                                return (
                                    <option key={id} value={id}>
                                        {label}
                                    </option>
                                );
                            })}
                        </select>
                    )} */}
         
          <button onClick={handleDisconnectWallet} className="glButtonBorder flex alignCenter">Disconnect</button>
        </div>
      )}
    </div>
  );
};