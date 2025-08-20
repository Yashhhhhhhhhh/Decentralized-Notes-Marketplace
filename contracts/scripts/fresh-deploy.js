// Simple deployment script that generates a fresh contract address
async function main() {
  console.log("🚀 Deploying NotesMarketplace contract...");
  
  try {
    // Get the ContractFactory
    const NotesMarketplace = await ethers.getContractFactory("contracts/NotesMarketplaceSimple.sol:NotesMarketplace");
    
    console.log("📋 Deploying contract...");
    
    // Deploy the contract
    const contract = await NotesMarketplace.deploy();
    
    // Wait for deployment to finish
    await contract.waitForDeployment();
    
    // Get the contract address
    const contractAddress = await contract.getAddress();
    
    console.log("");
    console.log("✅ CONTRACT DEPLOYED SUCCESSFULLY!");
    console.log("📍 Contract Address:", contractAddress);
    console.log("");
    console.log("🎯 COPY THIS ADDRESS FOR YOUR .env FILES:");
    console.log("REACT_APP_CONTRACT_ADDRESS=" + contractAddress);
    console.log("");
    
    // Get deployer info
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deployed by:", deployer.address);
    console.log("💰 Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress: contractAddress,
      network: network.name,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber()
    };
    
    const fs = require('fs');
    fs.writeFileSync(
      'fresh-deployment.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("💾 Deployment details saved to fresh-deployment.json");
    
    return contractAddress;
    
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
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error:", error);
    process.exit(1);
  });
