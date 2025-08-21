# 🌐 TESTNET SETUP GUIDE - FREE ETH FOR GLOBAL TESTING

## 🎯 **RECOMMENDED: SEPOLIA TESTNET**

### **📱 MetaMask Network Setup**
1. Open MetaMask
2. Click "Add Network" or "Custom RPC"
3. Enter these details:

```
Network Name: Sepolia Testnet
RPC URL: https://sepolia.infura.io/v3/84842078b09946638c03157f83405213
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer: https://sepolia.etherscan.io
```

### **🚰 FREE ETH FAUCETS (Choose Any)**

#### **Primary Faucets:**
1. **Sepolia Faucet by Alchemy**: https://sepoliafaucet.com
   - Requires: Email or GitHub account
   - Amount: 0.5 ETH per day
   - Most reliable

2. **Infura Sepolia Faucet**: https://www.infura.io/faucet/sepolia
   - Requires: Infura account (free)
   - Amount: 0.5 ETH per day
   - Very reliable

3. **QuickNode Faucet**: https://faucet.quicknode.com/ethereum/sepolia
   - Requires: Twitter account
   - Amount: 0.1 ETH per request
   - Fast processing

#### **Backup Faucets:**
4. **Chainlink Faucet**: https://faucets.chain.link/sepolia
   - Requires: GitHub account
   - Amount: 0.1 ETH per day
   - Trusted source

5. **Sepolia PoW Faucet**: https://sepolia-faucet.pk910.de
   - No registration required
   - Mine ETH by solving captchas
   - Unlimited (based on effort)

### **🔧 Quick Setup Steps:**
1. **Add Sepolia Network to MetaMask** (using details above)
2. **Copy your wallet address** from MetaMask
3. **Visit any faucet** from the list above
4. **Paste your address** and request ETH
5. **Wait 1-5 minutes** for ETH to arrive
6. **Switch to Sepolia network** in MetaMask
7. **Check your balance** - you should see free ETH!

---

## 🟣 **ALTERNATIVE: POLYGON MUMBAI TESTNET**

### **📱 MetaMask Network Setup**
```
Network Name: Polygon Mumbai
RPC URL: https://rpc-mumbai.maticvigil.com
Chain ID: 80001
Currency Symbol: MATIC
Block Explorer: https://mumbai.polygonscan.com
```

### **🚰 FREE MATIC FAUCETS**
1. **Official Polygon Faucet**: https://faucet.polygon.technology
2. **Alchemy Mumbai Faucet**: https://mumbaifaucet.com
3. **QuickNode Mumbai**: https://faucet.quicknode.com/polygon/mumbai

---

## 🚀 **DEPLOYMENT TO SEPOLIA**

### **1. Update Environment Variables**
Create/update `contracts/.env`:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/84842078b09946638c03157f83405213
PRIVATE_KEY=your_metamask_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### **2. Update Hardhat Config**
Update `contracts/hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 20000000000, // 20 gwei
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

### **3. Deploy to Sepolia**
```bash
cd contracts
npx hardhat run scripts/deploy-simple.js --network sepolia
```

### **4. Update Frontend Config**
Update `frontend/.env`:
```env
REACT_APP_CONTRACT_ADDRESS=your_sepolia_contract_address
REACT_APP_NETWORK_NAME=sepolia
REACT_APP_CHAIN_ID=11155111
REACT_APP_RPC_URL=https://sepolia.infura.io/v3/84842078b09946638c03157f83405213
```

---

## 🎯 **STEP-BY-STEP PROCESS**

### **Phase 1: Get Free ETH**
1. ✅ Add Sepolia network to MetaMask
2. ✅ Get free ETH from faucets
3. ✅ Verify ETH balance in MetaMask

### **Phase 2: Deploy Contract**
1. ✅ Update environment variables
2. ✅ Deploy contract to Sepolia
3. ✅ Verify contract on Etherscan
4. ✅ Save contract address

### **Phase 3: Update Frontend**
1. ✅ Update frontend environment
2. ✅ Test wallet connection
3. ✅ Test contract interactions
4. ✅ Verify global accessibility

---

## 🌍 **GLOBAL TESTING BENEFITS**

### **✅ Why Sepolia is Perfect for Hackathons:**
- **Free ETH**: No cost for testing
- **Global Access**: Works from anywhere
- **Reliable**: Maintained by Ethereum Foundation
- **Fast**: Quick transaction confirmations
- **Supported**: All major tools support it
- **Persistent**: Your deployed contracts stay online

### **🚀 For Your Hackathon:**
- **Demo Ready**: Anyone can test your app
- **Judge Friendly**: Judges can interact without setup
- **Professional**: Real blockchain, real transactions
- **Scalable**: Supports multiple users simultaneously
- **Documented**: Easy to verify on Etherscan

---

## 🛟 **TROUBLESHOOTING**

### **Problem: Faucet not working**
**Solution**: Try multiple faucets, some have daily limits

### **Problem: Transaction failing**
**Solution**: Increase gas price in MetaMask settings

### **Problem: Contract not verified**
**Solution**: Use Etherscan API key for automatic verification

### **Problem: Frontend not connecting**
**Solution**: Double-check network settings and contract address

---

## 📞 **NEED HELP?**

If you face any issues:
1. Check MetaMask network settings
2. Verify you have ETH balance
3. Confirm contract address is correct
4. Test with small transactions first

**Remember**: Sepolia ETH has no real value - it's completely free for testing! 🎉
