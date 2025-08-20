// Simple deployment script compatible with your setup
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying NotesMarketplace contract...");
  
  try {
    // Get signers
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deploying with account:", deployer.address);
    
    const balance = await deployer.getBalance();
    console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");
    
    // Get contract factory
    const NotesMarketplace = await ethers.getContractFactory("contracts/NotesMarketplaceSimple.sol:NotesMarketplace");
    
    console.log("📋 Deploying contract...");
    
    // Deploy the contract
    const contract = await NotesMarketplace.deploy();
    
    // Wait for deployment
    await contract.deployed();
    
    console.log("");
    console.log("✅ CONTRACT DEPLOYED SUCCESSFULLY!");
    console.log("📍 Contract Address:", contract.address);
    console.log("");
    console.log("🎯 COPY THIS ADDRESS FOR YOUR .env FILES:");
    console.log("REACT_APP_CONTRACT_ADDRESS=" + contract.address);
    console.log("");
    
    // Get transaction receipt
    const receipt = await contract.deployTransaction.wait();
    console.log("🧾 Transaction Hash:", receipt.transactionHash);
    console.log("⛽ Gas Used:", receipt.gasUsed.toString());
    console.log("📦 Block Number:", receipt.blockNumber);
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress: contract.address,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      network: network.name,
      deployer: deployer.address,
      timestamp: new Date().toISOString()
    };
    
    const fs = require('fs');
    fs.writeFileSync(
      'latest-deployment.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("💾 Deployment details saved to latest-deployment.json");
    
    return contract.address;
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  }
}

// Execute deployment
main()
  .then((address) => {
    console.log("");
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("📋 Your new contract address:", address);
    console.log("🔗 Ready to use in your frontend!");
    console.log("");
    console.log("📝 Next steps:");
    console.log("1. Copy the address above");
    console.log("2. Update your .env files with the new address");
    console.log("3. Restart your frontend to use the new contract");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error:", error);
    process.exit(1);
  });
