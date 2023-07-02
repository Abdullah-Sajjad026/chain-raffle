import { ethers, network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networksConfig } from "../helper-hardhat-config";
import { VRFCoordinatorV2Mock } from "../typechain-types";
import { MOCK_VRF_SUBSCRIPTION_FUND_AMOUNT } from "../constants";
import { EventLog } from "ethers";
import verifyContract from "../utils/verify-contract";

export default async function deployFunc(hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const isOnDevelopmentChain = developmentChains.includes(network.name);

  let vrfCoordinatorV2Address, subscriptionId;

  if (isOnDevelopmentChain) {
    const contract: VRFCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    const vrfCoordinatorV2Mock: VRFCoordinatorV2Mock =
      await contract.waitForDeployment();
    vrfCoordinatorV2Address = await vrfCoordinatorV2Mock.getAddress();

    // creating a subscription
    const subscriptionTx = await vrfCoordinatorV2Mock.createSubscription();
    const subscriptionTxReceipt = await subscriptionTx.wait();
    const subscriptionReceiptEventLogs = subscriptionTxReceipt
      ?.logs[0] as EventLog;

    subscriptionId = subscriptionReceiptEventLogs?.args?.[0];
    log(`Got local VRFCoordinatorMockV2 SubscriptionId ${subscriptionId}`);

    // we also need to fund our subscription
    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      MOCK_VRF_SUBSCRIPTION_FUND_AMOUNT
    );
    log(
      `Funded local VRFCoordinatorV2 Subscription with ${MOCK_VRF_SUBSCRIPTION_FUND_AMOUNT} amount`
    );
  } else {
    vrfCoordinatorV2Address =
      networksConfig[network.name as keyof typeof networksConfig]
        .vrfCoordinatorV2Address;
    subscriptionId =
      networksConfig[network.name as keyof typeof networksConfig]
        .subscriptionId;
  }

  const raffleArgs = [
    `${ethers.parseEther(
      networksConfig[network.name as keyof typeof networksConfig]
        .unparsedEntranceFee
    )}`,
    networksConfig[network.name as keyof typeof networksConfig].interval,
    vrfCoordinatorV2Address,
    networksConfig[network.name as keyof typeof networksConfig].gasLane,
    subscriptionId,
    networksConfig[network.name as keyof typeof networksConfig].gasLimit,
  ];

  const raffle = await deploy("Raffle", {
    from: deployer,
    args: raffleArgs,
    log: true,
    waitConfirmations:
      networksConfig[network.name as keyof typeof networksConfig]
        .blockConfirmations,
  });

  // verifying raffle contract if not on development chains
  if (!isOnDevelopmentChain) {
    await verifyContract(raffle.address, raffleArgs);
  }

  // adding this raffle to mock vrf consumers list on development chains
  if (isOnDevelopmentChain) {
    log("Adding the raffle contract to the mock vrf consumers list...");
    const contract: VRFCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    await contract.addConsumer(subscriptionId, raffle.address);
  }

  log("------------------------------------");
}

export const tags = ["all", "raffle"];
