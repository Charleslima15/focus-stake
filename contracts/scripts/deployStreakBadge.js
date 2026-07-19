const hre = require("hardhat");

const FOCUS_STAKE_ADDRESS = "0x7645d790b9D04e1650eE502173091C1B913438E6";

async function main() {
  const FocusStreakBadge = await hre.ethers.getContractFactory("FocusStreakBadge");
  const contract = await FocusStreakBadge.deploy(FOCUS_STAKE_ADDRESS);
  await contract.waitForDeployment();
  console.log("FocusStreakBadge deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
