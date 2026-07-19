const hre = require("hardhat");

async function main() {
  const FocusStake = await hre.ethers.getContractFactory("FocusStake");
  const contract = await FocusStake.deploy();
  await contract.waitForDeployment();
  console.log("FocusStake deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});