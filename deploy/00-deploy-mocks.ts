import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat-config";
import { MOCK_VRF_BASE_FEE, MOCK_VRF_GAS_PRICE_LINK } from "../constants";
import { ethers, network } from "hardhat";

export default async function deployFunc(hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks...");

    const vrfCoordinatorV2 = await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: [ethers.parseEther(MOCK_VRF_BASE_FEE), MOCK_VRF_GAS_PRICE_LINK],
      log: true,
      waitConfirmations: 1,
    });

    log("--------------------------------------------");
  }
}

export const tags = ["all", "mocks"];
