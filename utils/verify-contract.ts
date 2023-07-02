import { run } from "hardhat";

async function verifyContract(contractAddress: string, args: any[]) {
  console.log("Verifying contract at address: ", contractAddress);

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Contract already verified");
    } else {
      console.error("Failed to verify contract", error);
    }
  }
}

export default verifyContract;
