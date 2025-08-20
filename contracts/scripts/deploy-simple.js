// Deployment script for NotesMarketplaceSimple
async function main() {
  console.log("🚀 Starting simplified contract deployment...");
  
  try {
    // Get the contract factory for the simplified version
    const NotesMarketplace = await ethers.getContractFactory("contracts/NotesMarketplaceSimple.sol:NotesMarketplace");
    
    console.log("📋 Deploying NotesMarketplaceSimple contract...");
    
    // Deploy the contract
    const notesMarketplace = await NotesMarketplace.deploy();
    
    // Wait for deployment
    await notesMarketplace.deployed();
    
    console.log("✅ Contract deployed successfully!");
    console.log("📍 Contract address:", notesMarketplace.address);
    console.log("");
    console.log("🎯 COPY THIS ADDRESS FOR YOUR FRONTEND:");
    console.log("REACT_APP_CONTRACT_ADDRESS=" + notesMarketplace.address);
    console.log("");
    console.log("🌐 Add this to your .env file in the frontend folder");
    
    // Save deployment info to file
    const fs = require('fs');
    const deploymentInfo = {
      contractAddress: notesMarketplace.address,
      network: network.name,
      deployer: (await ethers.getSigners())[0].address,
      timestamp: new Date().toISOString(),
    };
    
    fs.writeFileSync(
      'deployment-info.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("💾 Deployment info saved to deployment-info.json");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deployment error:", error);
    process.exit(1);
  });
