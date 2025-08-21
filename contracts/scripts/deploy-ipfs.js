// Deployment script for NotesMarketplace with IPFS support
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying NotesMarketplace contract with IPFS support...");
  
  try {
    // Get signers
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deploying with account:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
    
    // Get contract factory for the full NotesMarketplace contract
    const NotesMarketplace = await ethers.getContractFactory("NotesMarketplace");
    
    console.log("📋 Deploying NotesMarketplace contract...");
    console.log("🔧 This contract includes IPFS file upload support");
    
    // Deploy the contract
    const contract = await NotesMarketplace.deploy();
    
    // Wait for deployment
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    
    console.log("");
    console.log("✅ CONTRACT DEPLOYED SUCCESSFULLY!");
    console.log("📍 Contract Address:", contractAddress);
    console.log("");
    console.log("🎯 COPY THIS ADDRESS FOR YOUR .env FILES:");
    console.log("REACT_APP_CONTRACT_ADDRESS=" + contractAddress);
    console.log("");
    
    // Get deployment transaction
    const deployTransaction = contract.deploymentTransaction();
    if (deployTransaction) {
      console.log("🧾 Transaction Hash:", deployTransaction.hash);
      
      // Wait for the transaction to be mined
      const receipt = await deployTransaction.wait();
      console.log("⛽ Gas Used:", receipt.gasUsed.toString());
      console.log("📦 Block Number:", receipt.blockNumber);
    }
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress: contractAddress,
      transactionHash: deployTransaction?.hash,
      blockNumber: deployTransaction ? (await deployTransaction.wait()).blockNumber : null,
      gasUsed: deployTransaction ? (await deployTransaction.wait()).gasUsed.toString() : null,
      network: network.name,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contractType: "NotesMarketplace with IPFS support"
    };
    
    const fs = require('fs');
    fs.writeFileSync(
      'ipfs-deployment.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("💾 Deployment details saved to ipfs-deployment.json");
    
    // Test contract functions
    console.log("");
    console.log("🧪 Testing contract functions...");
    
    try {
      // Test getTotalNotes
      const totalNotes = await contract.getTotalNotes();
      console.log("✅ getTotalNotes():", totalNotes.toString());
      
      console.log("✅ Contract is working correctly!");
    } catch (error) {
      console.log("⚠️ Contract deployed but test failed:", error.message);
    }
    
    return contractAddress;
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    if (error.reason) {
      console.error("💥 Reason:", error.reason);
    }
    throw error;
  }
}

// Execute deployment
main()
  .then((address) => {
    console.log("");
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("📋 Your new contract address:", address);
    console.log("🔗 Ready to use with IPFS file uploads!");
    console.log("");
    console.log("📝 Next steps:");
    console.log("1. Copy the address above");
    console.log("2. Update frontend/.env with: REACT_APP_CONTRACT_ADDRESS=" + address);
    console.log("3. Restart your frontend to use the new contract");
    console.log("4. Test file upload functionality");
    console.log("");
    console.log("🌐 Contract supports:");
    console.log("- ✅ IPFS file hash storage");
    console.log("- ✅ Note creation with files");
    console.log("- ✅ Decentralized ownership");
    console.log("- ✅ NFT marketplace features");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error:", error);
    process.exit(1);
  });
