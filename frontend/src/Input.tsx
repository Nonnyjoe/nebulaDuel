import React from "react";
import { ethers } from "ethers";
import { useRollups } from "./useRollups";
import { useWallets } from "@web3-onboard/react";

interface IInputProps {
    dappAddress: string;
    input: string; // New prop for input value
    hexInput: boolean; // New prop for hexInput value
}

export const Input: React.FC<IInputProps> = ({ dappAddress, input, hexInput }) => {
    const rollups = useRollups(dappAddress);
    const [connectedWallet] = useWallets();
    const provider = new ethers.providers.Web3Provider(
        connectedWallet.provider
    );

    const sendAddress = async () => {
        if (rollups) {
            try {
                await rollups.relayContract.relayDAppAddress(dappAddress);
            } catch (e) {
                console.log(`${e}`);
            }
        }
    };

    const addInput = async () => {
        if (rollups) {
            try {
                let payload = ethers.utils.toUtf8Bytes(input);
                if (hexInput) {
                    payload = ethers.utils.arrayify(input);
                }
                await rollups.inputContract.addInput(dappAddress, payload);
            } catch (e) {
                console.log(`${e}`);
            }
        }
    };

    return (
        <div>
            <div>
                Send Address (send relay dapp address) <br />
                <button onClick={sendAddress} disabled={!rollups}>
                    Send
                </button>
                <br /><br />
            </div>
            <div>
                Send Input <br />
                Input: {input} {/* Display input value for verification */}
                <button onClick={addInput} disabled={!rollups}>
                    Send
                </button>
                <br /><br />
            </div>
        </div>
    );
};
