const {ethers} = require('ethers');
require('dotenv').config();

async function httpAddnewTransaction(req, res) {
    console.log(`process running on: ${process.pid}`);
    let payload = req.body;

    if (!payload.message || !payload.signature || !payload.signer) {
        return res.status(400).json({
            message: 'Invalid payload structure'
        });
    }

    console.log(`New Payload is ${JSON.stringify(req.body)}`)

    try {
        let realSigner = await verifySignature(payload);
        console.log(realSigner);
        console.log("Main data is: ", JSON.parse(payload.message).data);
    
        if (realSigner!== payload.signer) {
            return res.status(400).json({
                message: 'Invalid payload signer/ signature'
            });
        }
    
        let newTx = await buildNewTx(payload);
        let status = await submitTransaction(newTx);
        console.log(`Transaction status is equal to: ${status}`);

    } catch (err) {
        return res.status(500).json({
            message: err
        });
    }


    res.status(200).json({
        message: 'Transaction added successfully',
        data: req.body,
    });
}

async function buildNewTx(payload) {
    let newPayload = JSON.stringify({payload: payload.message, caller: payload.signer});
    console.log(`payload is: ${JSON.stringify(payload)}`);

    let data = await JSON.parse(payload.message).data;

    let newTx = {
        data: JSON.stringify(JSON.parse(payload.message).data),
        signer: payload.signer,
    };
    return newTx;
}

async function verifySignature(payload) {
    console.log(`payload is: ${JSON.stringify(payload.message)}`);
    try {
        let realSigner = await ethers.utils.verifyMessage(payload.message, payload.signature);
        return realSigner;
    } catch (err) {
        console.log(err);
    }
}


async function submitTransaction(newTx) {

    let fee = ethers.BigNumber.from("1000000000000000000");
    let provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const inputbox = process.env.INPUTBOX_ADDRESS;
    const privateKey = process.env.PRIVATE_KEY;
    const dappAddress = process.env.DAPP_ADDRESS;
    if (!privateKey) {
        throw new Error('Private key not found in .env file');
    }

    try {
        const signer = new ethers.Wallet(privateKey, provider);
        const abi = [
            "function addInput( address appContract, bytes calldata payload) external returns (bytes32)"
        ];
        let txHex = await objectToHex(newTx);
        // console.log(txHex);
        console.log(`Hex representation is: ${txHex}`);
        console.log(`new Tx is: ${JSON.stringify(newTx)}`);
        const contract = new ethers.Contract(inputbox, abi, signer);
        let tx = await contract.addInput(dappAddress, txHex);
        const receipt = await tx.wait();
        console.log(receipt);
        return receipt.status;
    } catch(err) {
        console.log(err);
        return false;
    }

}

async function objectToHex(obj) {
    const jsonString = JSON.stringify(obj);
    const buffer = Buffer.from(jsonString, 'utf8');
    const hexString = '0x' + buffer.toString('hex');
    return hexString;
}

module.exports = {
    httpAddnewTransaction
};