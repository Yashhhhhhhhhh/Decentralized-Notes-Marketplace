const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log("Deploying NotesMarketplace contract...");

  // Get the ContractFactory and Signers here
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  const NotesMarketplace = await ethers.getContractFactory("NotesMarketplace");
  const notesMarketplace = await NotesMarketplace.deploy();

  await notesMarketplace.waitForDeployment();

  const contractAddress = await notesMarketplace.getAddress();
  console.log("NotesMarketplace deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
  };

  console.log("Deployment completed successfully!");
  console.log("Deployment info:", deploymentInfo);

  // Verify contract if on testnet or mainnet
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await notesMarketplace.deploymentTransaction().wait(5);
    
    console.log("Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Error verifying contract:", error.message);
    }
  }

  return deploymentInfo;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
