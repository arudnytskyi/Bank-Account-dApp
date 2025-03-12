const { ethers } = require("hardhat");
const fs = require("fs/promises");

async function main() {
  const BankAccount = await ethers.getContractFactory("BankAccount");
  const bankAccount = await BankAccount.deploy();

  await bankAccount.waitForDeployment();
  await writeDeploymentInfo(bankAccount);
}

async function writeDeploymentInfo(contract) {
  const address = await contract.getAddress();
  const signerAddress = await contract.runner.getAddress();
  const abi = contract.interface.format();

  const data = {
    contract: {
      address,
      signerAddress,
      abi,
    },
  };

  const content = JSON.stringify(data, null, 2);
  await fs.writeFile("deployment.json", content, { encoding: "utf-8" });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
