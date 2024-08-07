import {ethers} from 'ethers';
import axios from 'axios';
// import https from 'https';

declare global {
    interface Window {
        ethereum: any;
    }
}

    async function signMessages(message: any) {
          try {
            const {address, signature} = await signMessage({data: message});
            const finalPayload = await createMessage(message, "dappAddress", address, signature);
            const realSigner = await ethers.utils.verifyMessage(finalPayload.message, finalPayload.signature);
            console.log(`Realsigner is: ${realSigner}`);
            console.log("final payload", finalPayload);
            const txhash = await sendTransaction(finalPayload);
            return txhash;
          } catch (err: any) {
            console.log(err.message);
          }
    }


    async function signMessage(message: any): Promise<{ address: string, signature: string }> {
        try {
            console.log(JSON.stringify(message));
            if (!window?.ethereum)
                throw new Error("No crypto wallet found. Please install it.");
        
            await window.ethereum.send("eth_requestAccounts");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const signature = await signer.signMessage(JSON.stringify(message));
            const address = await signer.getAddress();
            return {address, signature};
            } catch (err: any) {

            console.log(err.message);
            throw err;
        }
    }

    async function createMessage(new_data: any, target: any, signer: any, signature: any) {
        console.log(target);
        // Stringify the message object
        const messageString = JSON.stringify({data: new_data});
        // Construct the final JSON object
        const finalObject = {
            message: messageString,
            signer: signer,
            signature: signature
        };
        return finalObject;
    }

    async function sendTransaction(data: any) {
        console.log("forwarding transaction to relayer........")
        try {
            // const response = await axios.post('https://nebula-relayer.fly.dev/transactions', data, {
            const response = await axios.post('http://localhost:3000/transactions', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Transaction successful:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error sending transaction:', error.response ? error.response.data : error.message);
        }
    }
    

export default signMessages;