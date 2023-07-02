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
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    player: {
      default: 1,
    },
  },
};

export default config;
