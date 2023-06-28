import "dotenv/config";

export const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
export const SEPOLIA_ACCOUNT_PRIVATE_KEY =
  process.env.SEPOLIA_ACCOUNT_PRIVATE_KEY || "0x";

export const LOCALHOST_RPC_URL = "http://127.0.0.1:8545/";

export const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
export const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

export const LOCAL_ACCOUNT_PRIVATE_KEY =
  process.env.LOCAL_ACCOUNT_PRIVATE_KEY || "0x";
