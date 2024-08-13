Here is the raw code for the README file. You can copy and paste it into your own file.

````markdown
# Project Setup and Running Guide

This guide provides instructions for setting up and running the backend, relayer, frontend, and Nebula contract of the project.

## Table of Contents

- [Running the Backend](#running-the-backend)
- [Running the Relayer](#running-the-relayer)
- [Running the Frontend](#running-the-frontend)
- [Running the Nebula Contract](#running-the-nebula-contract)

## Running the Backend

1. **Navigate to the App Folder**

   - Open your terminal and `cd` into the `app` folder.

2. **Build and Run the Application**

   - Run the following commands:
     ```bash
     cartesi build
     cartesi run
     ```

3. **Configure the Storage Implementation**
   - Navigate to `src/storage/mod/`.
   - In the new function of the Storage Implementation, change the `relayer_addr` variable to the wallet address your relayer will use to send transactions to the backend.
   - Copy the private key for this address for use in the next section.

## Running the Relayer

1. **Navigate to the Relayer Folder**

   - `cd` into the `relayer` folder.

2. **Install Dependencies**

   - Run the following command:
     ```bash
     npm install
     ```

3. **Set Up Environment Variables**

   - Create a `.env` file with the following details:
     ```
     PRIVATE_KEY=<your_private_key>
     INPUTBOX_ADDRESS=<input_box_address>
     RPC_URL=<rpc_url>
     DAPP_ADDRESS=<dapp_address>
     ```
   - **Note:** The `PRIVATE_KEY` should be the private key copied from the backend setup.

4. **Start the Relayer Backend**
   - Run the following command:
     ```bash
     npm run watch
     ```

## Running the Frontend

1. **Navigate to the Frontend Folder**

   - Exit the `relayer` folder and `cd` into the `frontend` folder.

2. **Install Dependencies**

   - Run the following command:
     ```bash
     npm install
     ```

3. **Set Up Environment Variables**

   - Create a `.env.local` file with the following details:
     ```
     VITE_PINATA_API_KEY=98c7260dbce5e3062dee
     VITE_PINATA_SECRET_API_KEY=06effff539f4f5c2be1780bdbc57d97b72306ba931ec29cd8a9468ce2b1e6386
     ```

4. **Update Configuration Files**

   - Navigate to `src/utils` and open `relayTransaction.tsx`.
     - Change the URL link in the `sendTransaction` function (line 61) to `http://localhost:3000/transactions`.
   - Open `readState.tsx` in the same folder.
     - Replace the `const response` in lines 7-8 with:
       ```javascript
       const response = await axios.get(
         `http://localhost:8080/inspect/${data}`,
         {
           headers: { "Content-Type": "application/json" },
         }
       );
       ```
   - Open `readSubgraph.tsx` in the same folder.
     - Replace the `const url` of the `fetchNotice` function with:
       ```javascript
       const url = "http://localhost:8080/graphql";
       ```

5. **Start the Frontend**
   - Run the following command:
     ```bash
     npm run dev
     ```

## Running the Nebula Contract

1. **Navigate to the Dynamic_NFT Folder**

   - `cd` into the `Dynamic_NFT` folder.

2. **Install Dependencies**

   - Run the following command:
     ```bash
     npm install
     ```

3. **Set Up Environment Variables**

   - Create a `.env` file with the following details:
     ```
     BASE_SEPOLIA_PRIVATE_KEY=<your_base_sepolia_private_key>
     BASE_SEPOLIA_API_KEY=<your_base_sepolia_api_key>
     BASESCAN_API_KEY=<your_basescan_api_key>
     ```

4. **Deploy Locally**

   - Start a local node by running:
     ```bash
     npx hardhat node --network local-tableland
     ```
   - Deploy the contract locally and run the scripts:
     ```bash
     npx hardhat run scripts/newdeploy.ts --network localhost
     ```
   - You should get an output similar to:
     ```
     https://testnets.tableland.network/api/v1/query?statement=SELECT%20*%20FROM%20NebulaNFT_84532_52
     ```
     Copy and paste this URL into your browser.

5. **Deploy to a Live Network**
   - Ensure the necessary `.env` requirements are provided for the specific network.
   - Deploy the contract to a live network (e.g., base-sepolia) by running:
     ```bash
     npx hardhat run scripts/newdeploy.ts --network base-sepolia
     ```
````
