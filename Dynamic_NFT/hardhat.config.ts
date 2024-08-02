import * as dotenv from "dotenv";

import { HardhatUserConfig, extendEnvironment, task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@tableland/hardhat";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// Used for contract verification & post-deploy moves
export const deployments: { [key: string]: string } = {
  localhost: "0x25d3195984A693886103312eA3FA53D738c951B7", // If it's the first deployed contract, this is deterministic
  "base-sepolia": "0x951fAa8B5E040DdC3f0489D00CF1E66be2355b25", // Update this with your proxy contract deployment
  // And/or, add a different network key
};



// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
      },
      {
        version: "0.8.12",
      },
      {
        version: "0.8.10",
      },
      {
        version: "0.8.2",
      },
      {
        version: "0.8.1",
      },
      {
        version: "0.8.0",
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  localTableland: {
    silent: false,
    verbose: false,
  },
  // etherscan: {
  //   apiKey: {
  //     // ethereum
  //     mainnet: process.env.ETHERSCAN_API_KEY || "",
  //     sepolia: process.env.ETHERSCAN_API_KEY || "",
  //     // optimism
  //     optimisticEthereum: process.env.OPTIMISM_ETHERSCAN_API_KEY || "",
  //     optimisticKovan: process.env.OPTIMISM_ETHERSCAN_API_KEY || "",
  //     // polygon
  //     polygon: process.env.POLYGONSCAN_API_KEY || "",
  //     polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
  //     //base
  //     // base: process.env.BASE_SEPOLIA_API_KEY || "",
  //     "base-sepolia": process.env.BASE_SEPOLIA_API_KEY,
  //   },
  // },
  networks: {
    // mainnets
    ethereum: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${
        process.env.ETHEREUM_API_KEY ?? ""
      }`,
      accounts:
        process.env.ETHEREUM_PRIVATE_KEY !== undefined
          ? [process.env.ETHEREUM_PRIVATE_KEY]
          : [],
    },
    optimism: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${
        process.env.OPTIMISM_API_KEY ?? ""
      }`,
      accounts:
        process.env.OPTIMISM_PRIVATE_KEY !== undefined
          ? [process.env.OPTIMISM_PRIVATE_KEY]
          : [],
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${
        process.env.POLYGON_API_KEY ?? ""
      }`,
      accounts:
        process.env.POLYGON_PRIVATE_KEY !== undefined
          ? [process.env.POLYGON_PRIVATE_KEY]
          : [],
    },
    // testnets
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${
        process.env.ETHEREUM_SEPOLIA_API_KEY ?? ""
      }`,
      accounts:
        process.env.ETHEREUM_SEPOLIA_PRIVATE_KEY !== undefined
          ? [process.env.ETHEREUM_SEPOLIA_PRIVATE_KEY]
          : [],
    },
    "optimism-goerli": {
      url: `https://opt-goerli.g.alchemy.com/v2/${
        process.env.OPTIMISM_GOERLI_API_KEY ?? ""
      }`,
      accounts:
        process.env.OPTIMISM_GOERLI_PRIVATE_KEY !== undefined
          ? [process.env.OPTIMISM_GOERLI_PRIVATE_KEY]
          : [],
    },
    maticmum: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${
        process.env.POLYGON_MUMBAI_API_KEY ?? ""
      }`,
      accounts:
        process.env.POLYGON_MUMBAI_PRIVATE_KEY !== undefined
          ? [process.env.POLYGON_MUMBAI_PRIVATE_KEY]
          : [],
    },
    "base-sepolia": {
      url: `https://base-sepolia.g.alchemy.com/v2/${
        process.env.BASE_SEPOLIA_API_KEY ?? ""
      }`,
      accounts:
        process.env.BASE_SEPOLIA_PRIVATE_KEY !== undefined
          ? [process.env.BASE_SEPOLIA_PRIVATE_KEY]
          : [],
    },

    hardhat: {
      mining: {
        auto: !(process.env.HARDHAT_DISABLE_AUTO_MINING === "true"),
        interval: [100, 3000],
      },
    },
  },

  etherscan: {
    apiKey: {
      "base-sepolia": process.env.BASESCAN_API_KEY,
    },
    customChains: [
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  },




  proxies: {
    localhost: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  },
};

declare module "hardhat/types/config" {
  // eslint-disable-next-line no-unused-vars
  interface HardhatUserConfig {
    proxies: {
      [key: string]: string;
    };
  }
}

declare module "hardhat/types/runtime" {
  // eslint-disable-next-line no-unused-vars
  interface HardhatRuntimeEnvironment {
    proxy: string;
  }
}

extendEnvironment((hre: HardhatRuntimeEnvironment) => {
  // Get proxy address for user-selected network
  const proxies = hre.userConfig.proxies as any;
  hre.proxy = proxies[hre.network.name];
});

export default config;
