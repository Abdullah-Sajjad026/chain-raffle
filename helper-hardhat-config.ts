import { ethers } from "hardhat";

/**
 * The list of blockchains which are local and we want to use for development
 */
const developmentChains = ["localhost", "hardhat", "ganache"];

/**
 * Configuration for each network
 */
const networksConfig = {
  sepolia: {
    chainId: 11155111,

    // raffle variables
    interval: "3",
    entranceFee: ethers.parseEther("0.01"),
  },

  localhost: {
    chainId: 31337,
  },
};

export { developmentChains, networksConfig };
