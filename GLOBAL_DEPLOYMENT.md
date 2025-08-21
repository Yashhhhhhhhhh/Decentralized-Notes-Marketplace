# 🚀 STEP-BY-STEP TESTNET SETUP GUIDE

## 🎯 **STEP 1: GET FREE ETH ON SEPOLIA**

### **Add Sepolia Network to MetaMask**
1. Open MetaMask
2. Click the network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add Network" or "Custom RPC"
4. Enter these **EXACT** details:

```
Network Name: Sepolia Testnet
New RPC URL: https://sepolia.infura.io/v3/84842078b09946638c03157f83405213
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer URL: https://sepolia.etherscan.io
```

5. Click "Save" and switch to Sepolia network

### **Get Free ETH from Faucets**
1. **Copy your wallet address** from MetaMask (click on your account name)
2. **Visit these faucets** (try them in order):

#### 🥇 **Primary Faucets** (Most Reliable):
- **Alchemy Faucet**: https://sepoliafaucet.com
  - Requires: Email signup
  - Amount: 0.5 ETH per day
  - ⭐ **RECOMMENDED** - Most reliable

- **Infura Faucet**: https://www.infura.io/faucet/sepolia  
  - Requires: Free Infura account
  - Amount: 0.5 ETH per day
  - Very reliable

#### 🥈 **Backup Faucets**:
- **QuickNode**: https://faucet.quicknode.com/ethereum/sepolia
- **Chainlink**: https://faucets.chain.link/sepolia  
- **PoW Faucet**: https://sepolia-faucet.pk910.de (no signup required)

3. **Paste your address** and request ETH
4. **Wait 2-5 minutes** for ETH to arrive
5. **Check your MetaMask** - you should see free ETH!

---

## 🔧 **STEP 2: DEPLOY CONTRACT TO SEPOLIA**

### **Setup Environment Variables**
1. **Go to your contracts folder**: `cd contracts`
2. **Create/update `.env` file**:

```env
# Get your private key from MetaMask:
# MetaMask > Account Details > Export Private Key
PRIVATE_KEY=your_metamask_private_key_here

# Sepolia RPC (you can use this one)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/84842078b09946638c03157f83405213

# Optional: Get free API key from etherscan.io
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### **Deploy Contract**
Run these commands:

```bash
cd contracts
npm install
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

**Expected Output:**
```
🚀 Deploying NotesMarketplaceSimple to Sepolia...
📝 Deploying with account: 0x...
💰 Account balance: 0.5 ETH
✅ Contract deployed to: 0x123...
🔗 Etherscan: https://sepolia.etherscan.io/address/0x123...
```

---

## 🌐 **STEP 3: UPDATE FRONTEND FOR GLOBAL ACCESS**

### **Update Frontend Environment**
1. **Go to frontend folder**: `cd frontend`
2. **Update `.env` file** with your deployed contract address:

```env
# Replace with YOUR contract address from deployment
REACT_APP_CONTRACT_ADDRESS=0x123...your_contract_address_here

# Sepolia configuration  
REACT_APP_NETWORK_NAME=sepolia
REACT_APP_CHAIN_ID=11155111
REACT_APP_RPC_URL=https://sepolia.infura.io/v3/84842078b09946638c03157f83405213

# Your Pinata credentials
REACT_APP_PINATA_JWT=your_pinata_jwt_here
REACT_APP_PINATA_API_KEY=your_pinata_api_key_here
REACT_APP_PINATA_API_SECRET=your_pinata_api_secret_here
REACT_APP_PINATA_GATEWAY=https://gateway.pinata.cloud
```

### **Start Frontend**
```bash
cd frontend
npm install
npm start
```

**Your app will run on**: `http://localhost:3000`

---

## 🎉 **STEP 4: TEST GLOBALLY**

### **Share Your App**
Anyone in the world can now:
1. **Visit your app**: `http://localhost:3000` (if you deploy to Vercel/Netlify)
2. **Connect MetaMask** to Sepolia network
3. **Get free ETH** from faucets
4. **Test your marketplace** with real blockchain transactions!

### **For Hackathon Judges**
1. **Demo URL**: Your deployed frontend
2. **Contract Address**: Your Sepolia contract address
3. **Etherscan**: `https://sepolia.etherscan.io/address/YOUR_CONTRACT`
4. **Free ETH**: Provide faucet links for judges to test

---

## 🛟 **TROUBLESHOOTING**

### **Problem: "Insufficient funds for gas"**
**Solution**: Get more ETH from faucets, you might need 0.1-0.5 ETH

### **Problem: "Network not supported"**
**Solution**: Make sure MetaMask is on Sepolia network (Chain ID: 11155111)

### **Problem: "Contract not found"**
**Solution**: Double-check your contract address in frontend/.env

### **Problem: "Transaction failed"**
**Solution**: Increase gas price in MetaMask or try again

---

## 🌟 **BENEFITS OF SEPOLIA FOR HACKATHONS**

✅ **Free**: No real money needed
✅ **Global**: Works from anywhere
✅ **Professional**: Real blockchain, real transactions  
✅ **Reliable**: Maintained by Ethereum Foundation
✅ **Demo-Ready**: Judges can test without setup
✅ **Persistent**: Your contract stays deployed
✅ **Verifiable**: All transactions visible on Etherscan

---

## 🚀 **QUICK DEPLOYMENT CHECKLIST**

- [ ] Add Sepolia network to MetaMask
- [ ] Get free ETH from faucets (0.5 ETH recommended)
- [ ] Update contracts/.env with private key
- [ ] Deploy contract: `npx hardhat run scripts/deploy-sepolia.js --network sepolia`
- [ ] Update frontend/.env with contract address
- [ ] Start frontend: `npm start`
- [ ] Test wallet connection and contract interaction
- [ ] Share your demo URL with judges!

**🎯 Result**: Your blockchain app is now globally accessible with free testnet ETH!
