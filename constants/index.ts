import "dotenv/config";
// import { ethers } from "hardhat";

export const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
export const SEPOLIA_ACCOUNT_PRIVATE_KEY =
  process.env.SEPOLIA_ACCOUNT_PRIVATE_KEY || "0x";

export const LOCALHOST_RPC_URL = "http://127.0.0.1:8545/";

export const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
export const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

export const LOCAL_ACCOUNT_PRIVATE_KEY =
  process.env.LOCAL_ACCOUNT_PRIVATE_KEY || "0x";

export const MOCK_VRF_BASE_FEE = "0.25";
export const MOCK_VRF_GAS_PRICE_LINK = 1e9;
export const MOCK_VRF_SUBSCRIPTION_FUND_AMOUNT = "1000000000000000000000";
