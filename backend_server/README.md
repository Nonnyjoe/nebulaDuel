## MAKING A CALL TO THE BACKEND VIA POSTMAN

- Setup postman then create a new request to to interact with a backend
- Create a POST request to the uri: `http://localhost:6000/transactions`
- This is because the backend is configured to runon port 6000.
- send a JSON body with the below parameters: 
    ```javascript
        {
            "message": "{\"data\":\"test\", \"target\": \"0x1a71aE5dd62D1a5B8cB2cd9669F939F035601c5C\"}",
            "signer": "0xA771E1625DD4FAa2Ff0a41FA119Eb9644c9A46C8",
            "signature": "0x927d2759c9583219fc80ec25fb62a4bdcc68aaa2044136889181195654d5365d01cbb99acdb797cd05b2935220cd48472be58f0628930282eb2cebbe729ff84f1c"
        }
    ```

1. **Create a `.env` file**:
   - Copy the `sample.env` file to a new file named `.env` in the root directory of the project:
     ```sh
     cp sample.env .env
     ```

2. **Fill in the values**:
   - Open the `.env` file and fill in the required values:
     - `ETHEREUM_RPC_URL`: Your Ethereum RPC endpoint URL.
     - `PRIVATE_KEY`: Your Ethereum account private key.
     - `CONTRACT_ADDRESS`: The address of your deployed contract (if applicable).
     - `PORT`: The port number for the local server.

3. **Start the project**:
   - Run the following command to start the project:
     ```sh
     npm start
     ```
