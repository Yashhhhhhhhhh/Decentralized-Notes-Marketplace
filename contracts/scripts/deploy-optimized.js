const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 OPTIMIZED SEPOLIA DEPLOYMENT");
  console.log("================================");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  const balanceETH = ethers.formatEther(balance);
  console.log("💰 Current balance:", balanceETH, "ETH");
  
  if (balance < ethers.parseEther("0.008")) {
    throw new Error("❌ Insufficient balance. Need at least 0.008 ETH for deployment.");
  }
  
  console.log("✅ Balance sufficient for deployment!");

  // Estimate gas before deployment
  console.log("\n⛽ Estimating deployment cost...");
  const NotesMarketplace = await ethers.getContractFactory("NotesMarketplaceSimple");
  
  // Get current gas price
  const gasPrice = await deployer.provider.getFeeData();
  console.log("📊 Current gas price:", ethers.formatUnits(gasPrice.gasPrice, "gwei"), "gwei");
  
  // Deploy with optimized gas settings
  console.log("\n📦 Deploying NotesMarketplaceSimple...");
  console.log("⚡ Using optimized gas settings for minimal cost...");
  
  const contract = await NotesMarketplace.deploy({
    gasPrice: gasPrice.gasPrice, // Use current network gas price
    gasLimit: 2500000, // Optimized gas limit
  });
  
  console.log("⏳ Transaction submitted, waiting for confirmation...");
  console.log("🔗 Transaction hash:", contract.deploymentTransaction().hash);
  
  // Wait for deployment
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();
  
  // Calculate actual cost
  const receipt = await deployTx.wait();
  const actualGasUsed = receipt.gasUsed;
  const actualCost = actualGasUsed * gasPrice.gasPrice;
  const costETH = ethers.formatEther(actualCost);
  
  console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("========================");
  console.log("📍 Contract Address:", contractAddress);
  console.log("⛽ Gas Used:", actualGasUsed.toString());
  console.log("💸 Deployment Cost:", costETH, "ETH");
  console.log("💰 Remaining Balance:", ethers.formatEther(balance - actualCost), "ETH");
  console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    contractAddress: contractAddress,
    deployer: deployer.address,
    transactionHash: deployTx.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: actualGasUsed.toString(),
    gasCost: costETH,
    timestamp: new Date().toISOString(),
    etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`,
    txUrl: `https://sepolia.etherscan.io/tx/${deployTx.hash}`
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  // Save deployment info
  const deploymentPath = path.join(deploymentDir, "sepolia-latest.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentPath);
  
  // Update frontend .env automatically
  const frontendEnvPath = path.join(__dirname, "..", "..", "frontend", ".env");
  const envContent = `# 🌐 SEPOLIA TESTNET CONFIGURATION - AUTO GENERATED
# Contract deployed on: ${new Date().toISOString()}

# CONTRACT CONFIGURATION
REACT_APP_CONTRACT_ADDRESS=${contractAddress}
REACT_APP_NETWORK_NAME=sepolia
REACT_APP_CHAIN_ID=11155111

# NETWORK CONFIGURATION  
REACT_APP_RPC_URL=https://sepolia.infura.io/v3/84842078b09946638c03157f83405213

# PINATA CONFIGURATION (UPDATE WITH YOUR KEYS)
REACT_APP_PINATA_JWT=your_pinata_jwt_token_here
REACT_APP_PINATA_API_KEY=your_pinata_api_key_here
REACT_APP_PINATA_API_SECRET=your_pinata_secret_here
REACT_APP_PINATA_GATEWAY=https://gateway.pinata.cloud

# EXPLORER LINKS
REACT_APP_BLOCK_EXPLORER=https://sepolia.etherscan.io
REACT_APP_CONTRACT_URL=https://sepolia.etherscan.io/address/${contractAddress}
`;

  try {
    fs.writeFileSync(frontendEnvPath, envContent);
    console.log("🔧 Frontend .env updated successfully!");
  } catch (error) {
    console.log("⚠️  Could not update frontend .env:", error.message);
  }
  
  console.log("\n🌍 GLOBAL ACCESS READY!");
  console.log("=====================");
  console.log("✅ Your contract is now deployed globally on Sepolia");
  console.log("✅ Anyone can interact with it using the contract address");
  console.log("✅ All transactions are permanent and verifiable");
  
  console.log("\n🚀 NEXT STEPS:");
  console.log("1. 📝 Update your Pinata API keys in frontend/.env");
  console.log("2. 🖥️  Start frontend: cd frontend && npm start");
  console.log("3. 🦊 Connect MetaMask to Sepolia network");
  console.log("4. 🎮 Test your application!");
  console.log("5. 🌐 Share contract address with others for global testing");
  
  console.log("\n📋 SHARE THESE DETAILS:");
  console.log("Contract Address:", contractAddress);
  console.log("Network: Sepolia Testnet");
  console.log("Explorer:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("Free ETH: https://sepoliafaucet.com");
}

main()
  .then(() => {
    console.log("\n✅ Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    console.log("\n🛟 TROUBLESHOOTING:");
    console.log("1. Check your internet connection");
    console.log("2. Verify your private key in contracts/.env");
    console.log("3. Make sure you have enough ETH (need ~0.01 ETH)");
    console.log("4. Try running the command again");
    process.exit(1);
  });
