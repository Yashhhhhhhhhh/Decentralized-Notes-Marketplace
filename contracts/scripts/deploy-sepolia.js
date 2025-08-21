const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying NotesMarketplaceSimple to Sepolia...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  Warning: Low balance. You might need more ETH from faucet.");
    console.log("🚰 Get free ETH: https://sepoliafaucet.com");
  }

  // Deploy the contract
  console.log("📦 Deploying NotesMarketplaceSimple...");
  const NotesMarketplace = await ethers.getContractFactory("NotesMarketplaceSimple");
  
  // Deploy with constructor parameters
  const contract = await NotesMarketplace.deploy();
  
  console.log("⏳ Waiting for deployment...");
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log("✅ Contract deployed to:", contractAddress);
  
  // Get deployment transaction
  const deployTx = contract.deploymentTransaction();
  console.log("🔗 Deployment transaction:", deployTx.hash);
  console.log("⛽ Gas used:", deployTx.gasLimit.toString());
  
  // Wait for a few confirmations before verification
  console.log("⏳ Waiting for confirmations...");
  await contract.deploymentTransaction().wait(2);
  
  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    contractAddress: contractAddress,
    deployer: deployer.address,
    transactionHash: deployTx.hash,
    blockNumber: deployTx.blockNumber,
    gasUsed: deployTx.gasLimit.toString(),
    timestamp: new Date().toISOString(),
    contractName: "NotesMarketplaceSimple",
    etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`,
    verificationCommand: `npx hardhat verify --network sepolia ${contractAddress}`
  };
  
  // Save to JSON file
  const deploymentPath = path.join(__dirname, "..", "deployments", "sepolia.json");
  const deploymentDir = path.dirname(deploymentPath);
  
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentPath);
  
  // Update frontend .env
  const frontendEnvPath = path.join(__dirname, "..", "..", "frontend", ".env");
  const envContent = `# Sepolia Testnet Configuration
REACT_APP_CONTRACT_ADDRESS=${contractAddress}
REACT_APP_NETWORK_NAME=sepolia
REACT_APP_CHAIN_ID=11155111
REACT_APP_RPC_URL=https://sepolia.infura.io/v3/84842078b09946638c03157f83405213

# Pinata Configuration (Add your keys)
REACT_APP_PINATA_JWT=your_pinata_jwt_here
REACT_APP_PINATA_API_KEY=your_pinata_api_key_here
REACT_APP_PINATA_API_SECRET=your_pinata_api_secret_here
REACT_APP_PINATA_GATEWAY=https://gateway.pinata.cloud

# Optional: Analytics and Monitoring
REACT_APP_ETHERSCAN_API_KEY=your_etherscan_api_key_here
`;

  fs.writeFileSync(frontendEnvPath, envContent);
  console.log("🔧 Frontend .env updated with Sepolia config");
  
  // Try to verify the contract
  try {
    console.log("🔍 Attempting to verify contract...");
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    console.log("⚠️  Verification failed (this is normal for new deployments):");
    console.log("   Error:", error.message);
    console.log("🔧 You can verify manually later with:");
    console.log(`   npx hardhat verify --network sepolia ${contractAddress}`);
  }
  
  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("========================");
  console.log("🌐 Network:", "Sepolia Testnet");
  console.log("📝 Contract:", contractAddress);
  console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("🚰 Free ETH:", "https://sepoliafaucet.com");
  console.log("📖 Explorer:", `https://sepolia.etherscan.io/tx/${deployTx.hash}`);
  console.log("\n🚀 Next Steps:");
  console.log("1. Add Sepolia network to MetaMask");
  console.log("2. Get free ETH from faucet");
  console.log("3. Update your Pinata API keys in frontend/.env");
  console.log("4. Start frontend: cd frontend && npm start");
  console.log("5. Test the application globally!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
