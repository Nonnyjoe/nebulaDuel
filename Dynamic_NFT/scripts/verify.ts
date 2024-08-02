import { run, network } from "hardhat";
import { deployments } from "../hardhat.config";

async function main() {
  console.log(`\nVerifying on '${network.name}'...`);

  // Ensure deployments
  if (deployments === undefined || deployments[network.name] === "") {
    throw Error(`no deployments entry for '${network.name}'`);
  }

  // Verify proxy and implementation
  // This will also link the proxy to the implementation in the explorer UI
  await run("verify:verify", {
    address: deployments[network.name],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
