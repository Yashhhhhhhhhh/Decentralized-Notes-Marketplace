# 🌐 Network Migration Guide

## Current Setup (Local Development)
- Contract: `0xc62c5750282369c3cb1c9cc9c58a48315104c73f`
- Network: Localhost (Chain ID 1337)

## 🔄 How to Switch Networks Later

### Option 1: Switch to Sepolia Testnet
1. Deploy contract to Sepolia:
   ```bash
   cd contracts
   npx hardhat run scripts/deploy-simple.js --network sepolia
   ```

2. Update `.env` files:
   ```env
   REACT_APP_CONTRACT_ADDRESS=[NEW_SEPOLIA_ADDRESS]
   REACT_APP_NETWORK_ID=11155111
   REACT_APP_NETWORK_NAME=sepolia
   ```

3. Get Sepolia ETH: https://sepoliafaucet.com

### Option 2: Use Existing Deployed Contract
Update environment files with any valid deployed address:
```env
REACT_APP_CONTRACT_ADDRESS=0xe7f125E7734CE288F8367e1Bb143E90b3F0512
REACT_APP_NETWORK_ID=11155111
```

### Option 3: Deploy to Polygon Mumbai
```bash
npx hardhat run scripts/deploy-simple.js --network polygonMumbai
```

## ✅ Migration Checklist
- [ ] Deploy contract to target network
- [ ] Update contract address in both `.env` files
- [ ] Update network ID and name
- [ ] Test MetaMask connection
- [ ] Verify contract functions work
- [ ] Update any documentation

## 🎯 Zero Code Changes Required!
Your React components and smart contract interactions will work identically on any network.
