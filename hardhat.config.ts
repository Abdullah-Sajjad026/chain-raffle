import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "hardhat-deploy";
import "hardhat-deploy-ethers";

import {
  ETHERSCAN_API_KEY,
  LOCALHOST_RPC_URL,
  SEPOLIA_ACCOUNT_PRIVATE_KEY,
  SEPOLIA_RPC_URL,
} from "./constants";

const config: HardhatUserConfig = {
  solidity: "0.8.8",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [SEPOLIA_ACCOUNT_PRIVATE_KEY],
      chainId: 11155111,
    },
    localhost: {
      url: LOCALHOST_RPC_URL,
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};

export default config;
