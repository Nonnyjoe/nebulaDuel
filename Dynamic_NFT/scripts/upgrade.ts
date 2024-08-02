import { ethers, upgrades, network, proxy } from "hardhat";
import assert from "assert";

async function main() {
  console.log(`\nUpgrading '${network.name}' proxy...`);

  // Get proxy owner account
  const [account] = await ethers.getSigners();
  if (account.provider === undefined) {
    throw Error("missing provider");
  }

  // Get proxy address
  if (proxy === undefined || proxy === "") {
    throw Error(`missing proxies entry for '${network.name}'`);
  }
  console.log(`Using proxy address '${proxy}'`);

  // Check current implementation
  const impl = await upgrades.erc1967.getImplementationAddress(proxy);
  console.log("Current implementation address:", impl);

  // Upgrade proxy
  const CanvasGame = await ethers.getContractFactory("CanvasGame");
  const canvasGame = await upgrades.upgradeProxy(proxy, CanvasGame, {
    kind: "uups",
  });
  canvasGame.deployed();
  assert(canvasGame.address === proxy, "proxy address changed");

  // Check new implementation
  const impl2 = await upgrades.erc1967.getImplementationAddress(canvasGame.address);
  console.log("New implementation address:", impl2);

  // Warn if implementation did not change, ie, nothing happened.
  if (impl === impl2) {
    console.warn("\nProxy implementation did not change. Is this expected?");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
