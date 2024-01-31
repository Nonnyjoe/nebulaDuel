import { ethers } from "ethers";
// import { useRollups } from "./useRollups";
import { useRollups } from "../useRollups";
import { useWallets } from "@web3-onboard/react";

// interface IInputProps {
//     dappAddress: string;
//     input: string; // New prop for input value
//     hexInput: boolean; // New prop for hexInput value
// }

export const Input2 = ( dappAddress: string, input: string, hexInput: boolean ) => {
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
        } else {
            console.log("Rollups not found");
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

    addInput();
};

export const Input = async (rollups: any,  dappAddress: string, input: string, hexInput: boolean ) => {
    // const [connectedWallet] = useWallets();
    // const provider = new ethers.providers.Web3Provider(
        //     connectedWallet.provider
        // );
        
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
