import { ethers, upgrades, network } from "hardhat";
import {
  proxies,
  baseURIs,
  TablelandNetworkConfig,
} from "@tableland/evm/network";

async function main() {
  const accounts = await ethers.getSigners();


  //Get the Tableland registry address for the current network
  const registryAddress =
    network.name === "localhost"
      ? proxies["local-tableland" as keyof TablelandNetworkConfig]
      : proxies[network.name as keyof TablelandNetworkConfig];

  // Get the baseURI with only the endpoint `/api/v1/` instead of an appended `/tables`
  let baseURI =
    network.name === "localhost"
      ? baseURIs["local-tableland" as keyof TablelandNetworkConfig]
      : baseURIs[network.name as keyof TablelandNetworkConfig];
  baseURI = baseURI.match(/^https?:\/\/[^\/]+\/[^\/]+\/[^\/]+\/?/)![0];


  if (!registryAddress)
    throw new Error("cannot get registry address for " + network.name);
  if (!baseURI) throw new Error("cannot get base URI for " + network.name);


  // Deploy the Canvas contract.
  const NebulaNFT = await ethers.getContractFactory("NebulaNFT");
  const nebulaNFT = await upgrades.deployProxy(
    NebulaNFT,
    [baseURI, "https://gateway.pinata.cloud/ipfs/QmNQ7dBaUjKTpJtF72fEoFNMDJWPyBWmyctwGPWoonwPop"],
    {
      kind: "uups",
    }
  );
  await nebulaNFT.deployed();

  // Check upgradeability.
  console.log("Proxy deployed to:", nebulaNFT.address, "on", network.name);
  const impl = await upgrades.erc1967.getImplementationAddress(
    nebulaNFT.address
  );
  console.log("^Add this to your 'hardhat.config.ts' file's 'deployments'");
  console.log("New implementation address:", impl);

  // Run post deploy table creation.
  console.log("\nRunning post deploy...");

  //get the metadata uri
  const metadatauri = await nebulaNFT.metadataURI()
  console.log("metadatauri", metadatauri)

  //get the owner
  let owner = await nebulaNFT.owner()
  console.log("owner", owner)

  //mimmicking the dapp address ownership transfered
  let transferOwnership = await nebulaNFT.connect(accounts[0]).transferOwnership(accounts[1].address)
  await transferOwnership.wait();


  //get the owner again
  let newowner = await nebulaNFT.owner()
  console.log("new owner", newowner)


  // Create our metadata table
  let tx = await nebulaNFT.connect(accounts[1]).createMetadataTable();
  let receipt = await tx.wait();

  const tableId = receipt.events[0].args[2];
  console.log("Metadata table ID:", tableId.toString());

  // For fun—test minting and making a move.
  // await nebulaNFT.connect(accounts[1]).safeMint(accounts[1].address);
  // receipt = await tx.wait();
  // const [, transferEvent] = (await receipt.events) ?? [];
  // const tokenId = await transferEvent.args!.tokenId;
  // console.log("Token ID:", ethers.BigNumber.from(tokenId).toNumber());
  let tokenId = 1;

  //first time. the nft is minted here
  await nebulaNFT.connect(accounts[1]).entrypoint(accounts[1].address, tokenId, 80, 4,9,12, "Thunderbolt", 0, 1);
  await tx.wait();


  const totalSupply = await nebulaNFT.totalSupply()
  console.log("totalSupply", totalSupply)

  
  // Get the specific token's URI.
  const tokenURI = await nebulaNFT.tokenURI(tokenId);
  console.log(`And the specific token's URI:`);
  console.log(tokenURI);

  //the nft is updated cos the tokenid has been minted already
  await nebulaNFT.connect(accounts[1]).entrypoint(accounts[1].address, tokenId, 60, 2,12,10, "Thunderbolt", 3, 1); // (tokenId, x, y)
   await tx.wait();


// Query all table values after mutating.
const result = await nebulaNFT.metadataURI();
console.log(`\nCheck out the mutated table data:`);
console.log(result);

// Get the specific token's URI.
const tokenURI_res = await nebulaNFT.tokenURI(tokenId);
console.log(`And the specific token's URI:`);
console.log(tokenURI_res);

  // // Query all table values after mutating.
  // Query all table values after mutating.
  const gateway = await nebulaNFT.metadataURI();
  console.log(`\nCheck out the mutated table data:`);
  console.log(gateway);

  // Query all table values after mutating.
const transfer = await nebulaNFT.connect(accounts[1]).transferFrom(accounts[1].address, accounts[3].address, tokenId);
console.log(`\nTransferinnggggg`);
await transfer.wait()


// Query all table values after mutating.
const uri = await nebulaNFT.metadataURI();
console.log(`\nCheck out the mutated table data:`);
console.log(uri);


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
