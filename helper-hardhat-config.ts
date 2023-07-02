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
    blockConfirmations: 5,
    // raffle variables
    interval: "259200", // ~ 3 days
    unparsedEntranceFee: "0.1",

    // vrfcoordinatorv2 variables
    vrfCoordinatorV2Address: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    gasLimit: 2500000,
    gasLane:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    subscriptionId: 3320,
  },

  localhost: {
    chainId: 31337,
    blockConfirmations: 1,
    // raffle variables
    interval: "3",
    unparsedEntranceFee: "0.1",
    // vrfcoordinatorv2 variables
    vrfCoordinatorV2Address: "",
    subscriptionId: "",
    gasLane:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    gasLimit: 2500000,
  },
  hardhat: {
    chainId: 31337,
    blockConfirmations: 1,
    // raffle variables
    interval: "3",
    unparsedEntranceFee: "0.1",
    // vrfcoordinatorv2 variables
    vrfCoordinatorV2Address: "",
    subscriptionId: "",
    gasLane:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    gasLimit: 2500000,
  },
};

export { developmentChains, networksConfig };
