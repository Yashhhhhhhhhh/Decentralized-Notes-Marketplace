const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 SEPOLIA DEPLOYMENT - SIMPLE & WORKING");
  console.log("=======================================");
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.getBalance();
  const balanceETH = hre.ethers.utils.formatEther(balance);
  console.log("💰 Current balance:", balanceETH, "ETH");
  
  if (balance.lt(hre.ethers.utils.parseEther("0.008"))) {
    throw new Error("❌ Insufficient balance. Need at least 0.008 ETH");
  }
  
  console.log("✅ Balance sufficient for deployment!");

  // Deploy contract
  console.log("\n📦 Deploying NotesMarketplaceSimple...");
  const NotesMarketplace = await hre.ethers.getContractFactory("NotesMarketplaceSimple");
  
  const contract = await NotesMarketplace.deploy();
  await contract.deployed();
  
  console.log("✅ Contract deployed to:", contract.address);
  console.log("🔗 Transaction hash:", contract.deployTransaction.hash);
  
  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await contract.deployTransaction.wait(2);
  
  // Get deployment cost
  const receipt = await hre.ethers.provider.getTransactionReceipt(contract.deployTransaction.hash);
  const gasUsed = receipt.gasUsed;
  const gasPrice = contract.deployTransaction.gasPrice;
  const cost = gasUsed.mul(gasPrice);
  const costETH = hre.ethers.utils.formatEther(cost);
  
  console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("========================");
  console.log("📍 Contract Address:", contract.address);
  console.log("⛽ Gas Used:", gasUsed.toString());
  console.log("💸 Deployment Cost:", costETH, "ETH");
  console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${contract.address}`);
  
  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    contractAddress: contract.address,
    deployer: deployer.address,
    transactionHash: contract.deployTransaction.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: gasUsed.toString(),
    gasCost: costETH,
    timestamp: new Date().toISOString(),
    etherscanUrl: `https://sepolia.etherscan.io/address/${contract.address}`,
    txUrl: `https://sepolia.etherscan.io/tx/${contract.deployTransaction.hash}`
  };
  
  // Create deployments directory
  const deploymentDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  // Save deployment info
  const deploymentPath = path.join(deploymentDir, "sepolia-deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment saved to:", deploymentPath);
  
  // Update frontend .env
  const frontendEnvPath = path.join(__dirname, "..", "..", "frontend", ".env");
  const envContent = `# 🌐 SEPOLIA TESTNET - AUTO GENERATED
# Deployed: ${new Date().toISOString()}

REACT_APP_CONTRACT_ADDRESS=${contract.address}
REACT_APP_NETWORK_NAME=sepolia
REACT_APP_CHAIN_ID=11155111
REACT_APP_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# PINATA CONFIG (UPDATE YOUR KEYS)
REACT_APP_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZDJmYzVmMy05NzY2LTRiODQtODc3NC05YmQ3NjI3YzAzZGIiLCJlbWFpbCI6Inlhc2hqYWRoYXZwcmFjdGljYWxzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmYzI5Njk3MjA2OWI3YmNlMTZiYSIsInNjb3BlZEtleVNlY3JldCI6IjgxZjM2MWQ2ZjUyNGJjNTMyZjgyNjc3ZWU0ZTNmM2Y1MmY5NDkzNmZjYzM0MzczYzkyOTNmMzY0OWVlZmJjMTciLCJleHAiOjE3ODcyNTg3Mzh9.7O09ERXFZBBkQqLK_YgBUWvS1-f5l2Oq_Y9iKnR4eCU
REACT_APP_PINATA_API_KEY=fc296972069b7bce16ba
REACT_APP_PINATA_API_SECRET=81f361d6f524bc532f82677ee4e3f3f52f94936fcc34373c9293f3649eefbc17
REACT_APP_PINATA_GATEWAY=https://gateway.pinata.cloud

# EXPLORER
REACT_APP_BLOCK_EXPLORER=https://sepolia.etherscan.io
`;

  try {
    fs.writeFileSync(frontendEnvPath, envContent);
    console.log("🔧 Frontend .env updated!");
  } catch (error) {
    console.log("⚠️  Could not update frontend .env");
  }
  
  console.log("\n🌍 CONTRACT IS NOW GLOBAL!");
  console.log("=========================");
  console.log("✅ Deployed on Sepolia testnet");
  console.log("✅ Accessible worldwide");
  console.log("✅ Contract address:", contract.address);
  console.log("✅ Etherscan URL:", `https://sepolia.etherscan.io/address/${contract.address}`);
  
  console.log("\n🚀 NEXT STEPS:");
  console.log("1. Start frontend: cd ../frontend && npm start");
  console.log("2. Open: http://localhost:3000");
  console.log("3. Connect MetaMask to Sepolia");
  console.log("4. Test your marketplace!");
  
  console.log("\n📋 SHARE WITH JUDGES:");
  console.log("Contract:", contract.address);
  console.log("Network: Sepolia Testnet");
  console.log("Explorer:", `https://sepolia.etherscan.io/address/${contract.address}`);
  console.log("Get free ETH: https://sepoliafaucet.com");
}

main()
  .then(() => {
    console.log("\n✅ Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    process.exit(1);
  });
