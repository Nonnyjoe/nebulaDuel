const ERC1967Proxy = require('@openzeppelin/contracts/build/contracts/ERC1967Proxy.json');
const Web3EthAbi = require('web3-eth-abi');
import fs from 'fs';
import { ethers, upgrades, network } from "hardhat";
const hre = require("hardhat")
import {
  proxies,
  baseURIs,
  TablelandNetworkConfig,
} from "@tableland/evm/network";


async function main() {
  const accounts = await ethers.getSigners();

  // Get the Tableland registry address for the current network
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

  if (!registryAddress) throw new Error("Cannot get registry address for " + network.name);
  if (!baseURI) throw new Error("Cannot get base URI for " + network.name);

  // Deploy the Nebula implementation contract
  const Nebula = await ethers.getContractFactory("NebulaNFT");
  const nebula = await Nebula.deploy();
  await nebula.deployed();
  console.log("Nebula 1.0 deployed to:", nebula.address);


  const externaluri = "https://gateway.pinata.cloud/ipfs/QmNQ7dBaUjKTpJtF72fEoFNMDJWPyBWmyctwGPWoonwPop"

  // Calculate the initialize() call during deployment
  const { abi } = await hre.artifacts.readArtifact("NebulaNFT");
  const callInitialize = Web3EthAbi.encodeFunctionCall(
    abi.find(({ name }) => name === 'initialize'), [accounts[0].address, baseURI]
  );

  // Deploy the proxy
  const Proxy = await ethers.getContractFactory(ERC1967Proxy.abi, ERC1967Proxy.bytecode);
  const proxy = await Proxy.deploy(nebula.address, callInitialize);
  await proxy.deployed();
  console.log("Proxy deployed to:", proxy.address);

  // Save deployment addresses to a file
  fs.writeFileSync('./status.json', JSON.stringify({ proxyAddress: proxy.address, Nebula_v1Address: nebula.address }, null, 2));

  // Interact with the deployed proxy contract
  const neb = await ethers.getContractAt("NebulaNFT", proxy.address);

  console.log("/////////////----------------interacting----------------------///////////")

    // Get the contract's name
    const name = await neb.name();
    console.log("Contract name:", name);
  
    // Get the owner of the contract
    const owner = await neb.owner();
    console.log("Contract owner:", owner);


  let tx = await neb.createMetadataTable();
  let receipt = await tx.wait();


  const tableId = await receipt.events[0].args[2];
  console.log("Metadata table ID:", tableId.toString());


    //first time. the nft is minted here
    let tokenId = 1;
    //entrypoint(address to, uint256 _tokenid, string memory _name, string memory _image, uint256 health, uint256 strength, uint256 attack, uint256 speed, string memory superPower, uint256 totalWins, uint256 totalLoss) external onlyOwner {
    await neb.entrypoint(accounts[0].address, tokenId, "Mystic Seer", "ipfs://QmfTCGcXYskWDfrPhEm9WShDqJiJrLFHXZviCZWoeHS4cB/mystic.gif", 80, 10,10,10, "Thunderbolt" , 0, 0);
    await tx.wait();

    //get the metadata uri
    const metadatauri = await neb.metadataURI()
    console.log("metadatauri", metadatauri)

  //get total suppply
    const totalSupply = await neb.totalSupply()
    console.log("totalSupply", totalSupply)

  
  // Get the specific token's URI.
  const tokenURI = await neb.tokenURI(tokenId);
  console.log(`And the specific token's URI:`);
  console.log(tokenURI);


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
