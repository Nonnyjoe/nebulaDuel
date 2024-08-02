# Nebula NFT

> Dynamic global game state controlled by user-owned game NFTs.

## Background

Tableland makes it possible for an event-driven architecture that dynamically updates NFT metadata. In this Project, users are able to update their game character details. The `Nebula NFT` contract owns a Tableland table and writes all mutating SQL statements, but the mutating SQL statement first check the caller's token ownership before changing any metadata.

A metadata table holds data for the token ID and these coordinates, allowing for each character metadata to be composed:

```sql
SELECT
  json_object(
    'name', '',
    'image', '',
    'attributes', json_array(
      json_object(
        'display_type', 'text',
        'trait_type', 'owner',
        'value', ''
      ),
      json_object(
        'display_type', 'number',
        'trait_type', 'id',
        'value', 0
      ),
      json_object(
        'display_type', 'number',
        'trait_type', 'price',
        'value', 0
      ),
      json_object(
        'display_type', 'number',
        'trait_type', 'health',
        'value', 0
      ),
      json_object(
        'display_type', 'number',
        'trait_type', 'strength',
        'value', 0
      ),
      json_object(
        'display_type', 'number',
        'trait_type', 'attack',
        'value', 0
      ),
      json_object(
        'display_type', 'number',
        'trait_type', 'speed',
        'value', 0
      ),
      json_object(
        'display_type', 'text',
        'trait_type', 'superPower',
        'value', ''
      ),
      json_object(
        'display_type', 'number',
        'trait_type', 'totalWins',
        'value', 0
      ),
      json_object(
        'display_type', 'number',
        'trait_type', 'totalLoss',
        'value', 0
      )
    )
  )
FROM
  <prefix_chainId_tableId>
WHERE
  id = <tokenId>
```

For a detailed walkthrough, [check out the docs](https://docs.tableland.xyz/tutorials/dynamic-nft-solidity).


## Usage

If you're simply cloning this repo, first, install dependencies with `npm`:

```bash
npm install
```

You'll also want to ensure you `.env` variables set up—copy the `.env.example` into `.env` and update the placeholders if you plan to deploy to a live network, such as Base Sepolia: `BASE_SEPOLIA_PRIVATE_KEY`, `BASE_SEPOLIA_API_KEY`, and `BASESCAN_API_KEY`.

If you are developing locally, you'll first want to start a local Hardhat and Tableland node:

```bash
npx hardhat node --network local-tableland
```

Then, you can run the deploy script—**be sure to update the `deployments`** variable in `hardhat.config.ts` with the value logged in the script:

```bash
npx hardhat run scripts/newdeploy.ts --network localhost
```

That is, update this with your data:

```js
export const deployments: { [key: string]: string } = {
  localhost: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707", // If it's the first deployed contract, this is deterministic
  "base-sepolia": "0xd0071F2343E9Ea8993356DD491588C3B1329d131", // Update this with your proxy contract deployment
  // And/or, add a different network key
};
```

The following scripts are also available:

- `move.ts`: extensive test of all the functions.
- `upgrade.ts`: Upgrade the contract upon code changes.
- `verify.ts`: Verify the contract on live networks.

If you would like to deploy to Base Sepolia, as an example, simply change the `--network` flag:

```bash
npx hardhat run scripts/deploy.ts --network base-sepolia
```


### Example output

The following contract was deployed on Base Sepolia: [`0xd0071F2343E9Ea8993356DD491588C3B1329d131`](https://mumbai.polygonscan.com/address/0xd0071F2343E9Ea8993356DD491588C3B1329d131#writeProxyContract). An ERC721 example query of the `metadata` can be viewed [here](https://testnets.tableland.network/api/v1/query?statement=SELECT%20*%20FROM%20NebulaNFT_84532_52).



///////////-----------------///////////
 npx hardhat run scripts/newdeploy.ts --network base-sepolia --show-stack-traces
No need to generate any newer typings.
Nebula 1.0 deployed to: 0xEe36fAD43D7C3bF5Dc95cE3AfAA257e33531a814
Proxy deployed to: 0xd0071F2343E9Ea8993356DD491588C3B1329d131
/////////////----------------interacting----------------------///////////
Contract name: NebulaNFT
Contract owner: 0x12896191de42EF8388f2892Ab76b9a728189260A
Metadata table ID: 52
metadatauri https://testnets.tableland.network/api/v1/query?statement=SELECT%20*%20FROM%20NebulaNFT_84532_52
totalSupply BigNumber { value: "1" }
And the specific token's URI:
https://testnets.tableland.network/api/v1/query?unwrap=true&extract=true&statement=SELECT%20json_object%28%27name%27%2C%20name%20%7C%7C%20%27%20%23%27%20%7C%7C%20id%2C%20%27image%27%2C%20image%2C%20%27attributes%27%2Cjson_array%28json_object%28%27display_type%27%2C%20%27text%27%2C%20%27trait_type%27%2C%20%27owner%27%2C%20%27value%27%2C%20owner%29%2Cjson_object%28%27display_type%27%2C%20%27number%27%2C%20%27trait_type%27%2C%20%27id%27%2C%20%27value%27%2C%201%29%2Cjson_object%28%27display_type%27%2C%20%27number%27%2C%20%27trait_type%27%2C%20%27price%27%2C%20%27value%27%2C%20price%29%2Cjson_object%28%27display_type%27%2C%20%27number%27%2C%20%27trait_type%27%2C%20%27health%27%2C%20%27value%27%2C%20health%29%2Cjson_object%28%27display_type%27%2C%20%27number%27%2C%20%27trait_type%27%2C%20%27strength%27%2C%20%27value%27%2C%20strength%29%2Cjson_object%28%27display_type%27%2C%20%27number%27%2C%20%27trait_type%27%2C%20%27attack%27%2C%20%27value%27%2C%20attack%29%2Cjson_object%28%27display_type%27%2C%20%27number%27%2C%20%27trait_type%27%2C%20%27speed%27%2C%20%27value%27%2C%20speed%29%2Cjson_object%28%27display_type%27%2C%20%27text%27%2C%20%27trait_type%27%2C%20%27superPower%27%2C%20%27value%27%2C%20superPower%29%2Cjson_object%28%27display_type%27%2C%20%27number%27%2C%20%27trait_type%27%2C%20%27totalWins%27%2C%20%27value%27%2C%20totalWins%29%2Cjson_object%28%27display_type%27%2C%20%27number%27%2C%20%27trait_type%27%2C%20%27totalLoss%27%2C%20%27value%27%2C%20totalLoss%29%29%29%20FROM%20NebulaNFT_84532_52%20WHERE%20id=1
