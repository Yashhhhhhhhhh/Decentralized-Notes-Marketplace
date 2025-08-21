async function main() {
  console.log("🚀 SIMPLE SEPOLIA DEPLOYMENT");
  console.log("============================");
  
  // Get ethers from hardhat
  const { ethers } = require("hardhat");
  
  // Get signer
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.getBalance();
  const balanceETH = ethers.utils.formatEther(balance);
  console.log("💰 Current balance:", balanceETH, "ETH");
  
  // Deploy contract
  console.log("\n📦 Deploying NotesMarketplaceSimple...");
  const NotesMarketplace = await ethers.getContractFactory("NotesMarketplaceSimple");
  
  const contract = await NotesMarketplace.deploy();
  console.log("⏳ Waiting for deployment...");
  
  await contract.deployed();
  
  console.log("\n🎉 SUCCESS!");
  console.log("========================");
  console.log("📍 Contract Address:", contract.address);
  console.log("🔗 Transaction:", contract.deployTransaction.hash);
  console.log("🌐 Etherscan:", `https://sepolia.etherscan.io/address/${contract.address}`);
  
  // Save to file
  const fs = require("fs");
  const deploymentInfo = {
    contractAddress: contract.address,
    transactionHash: contract.deployTransaction.hash,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    etherscanUrl: `https://sepolia.etherscan.io/address/${contract.address}`
  };
  
  fs.writeFileSync("deployment-result.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Results saved to deployment-result.json");
  
  // Update frontend env
  const frontendEnv = `# SEPOLIA DEPLOYMENT
REACT_APP_CONTRACT_ADDRESS=${contract.address}
REACT_APP_NETWORK_NAME=sepolia
REACT_APP_CHAIN_ID=11155111
REACT_APP_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# PINATA CONFIG
REACT_APP_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZDJmYzVmMy05NzY2LTRiODQtODc3NC05YmQ3NjI3YzAzZGIiLCJlbWFpbCI6Inlhc2hqYWRoYXZwcmFjdGljYWxzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmYzI5Njk3MjA2OWI3YmNlMTZiYSIsInNjb3BlZEtleVNlY3JldCI6IjgxZjM2MWQ2ZjUyNGJjNTMyZjgyNjc3ZWU0ZTNmM2Y1MmY5NDkzNmZjYzM0MzczYzkyOTNmMzY0OWVlZmJjMTciLCJleHAiOjE3ODcyNTg3Mzh9.7O09ERXFZBBkQqLK_YgBUWvS1-f5l2Oq_Y9iKnR4eCU
REACT_APP_PINATA_API_KEY=fc296972069b7bce16ba
REACT_APP_PINATA_API_SECRET=81f361d6f524bc532f82677ee4e3f3f52f94936fcc34373c9293f3649eefbc17
REACT_APP_PINATA_GATEWAY=https://gateway.pinata.cloud
`;

  try {
    fs.writeFileSync("../frontend/.env", frontendEnv);
    console.log("🔧 Frontend .env updated!");
  } catch (e) {
    console.log("⚠️  Manual step: Update frontend/.env with contract address");
  }
  
  console.log("\n🌍 YOUR CONTRACT IS NOW GLOBAL!");
  console.log("================================");
  console.log("✅ Contract deployed on Sepolia testnet");
  console.log("✅ Accessible worldwide");
  console.log("✅ Free ETH for testers: https://sepoliafaucet.com");
  console.log("✅ View on Etherscan:", `https://sepolia.etherscan.io/address/${contract.address}`);
  
  console.log("\n🚀 NEXT: Start your frontend!");
  console.log("cd ../frontend && npm start");
  
  return contract.address;
}

main()
  .then((address) => {
    console.log(`\n✅ Contract deployed at: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  });
