@echo off
echo.
echo ========================================
echo   SEPOLIA TESTNET DEPLOYMENT SCRIPT
echo ========================================
echo.

echo 🚀 Setting up Sepolia deployment...
echo.

:: Check if we're in the right directory
if not exist "contracts" (
    echo ❌ Error: Please run this script from the project root directory
    echo    Make sure you can see the 'contracts' folder
    pause
    exit /b 1
)

:: Navigate to contracts directory
cd contracts

echo 📦 Installing contract dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🔧 Checking environment variables...

:: Check if .env exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found
    echo.
    echo Creating template .env file...
    echo # Sepolia Testnet Configuration > .env
    echo # Get your private key from MetaMask: Account Details ^> Export Private Key >> .env
    echo PRIVATE_KEY=your_metamask_private_key_here >> .env
    echo. >> .env
    echo # Sepolia RPC URL ^(you can use this one^) >> .env
    echo SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/84842078b09946638c03157f83405213 >> .env
    echo. >> .env
    echo # Optional: Get free API key from etherscan.io >> .env
    echo ETHERSCAN_API_KEY=your_etherscan_api_key_here >> .env
    echo.
    echo ✅ Template .env file created
    echo.
    echo 🔑 NEXT STEPS:
    echo 1. Edit contracts/.env file
    echo 2. Add your MetaMask private key
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ Environment file found
echo.

echo 🌐 Deploying to Sepolia testnet...
echo ⏳ This may take 2-3 minutes...
echo.

call npx hardhat run scripts/deploy-sepolia.js --network sepolia

if errorlevel 1 (
    echo.
    echo ❌ Deployment failed!
    echo.
    echo 🛟 Common solutions:
    echo 1. Make sure you have ETH in your wallet
    echo    Get free ETH: https://sepoliafaucet.com
    echo 2. Check your private key in .env file
    echo 3. Make sure MetaMask is on Sepolia network
    echo.
    pause
    exit /b 1
)

echo.
echo 🎉 Deployment completed successfully!
echo.

:: Navigate back to project root
cd ..

echo 🔧 Updating frontend configuration...

:: Update frontend environment
if exist "frontend\.env" (
    echo ✅ Frontend .env already exists
) else (
    echo Creating frontend .env file...
    echo # Sepolia Testnet Configuration > frontend\.env
    echo # Contract address will be updated after deployment >> frontend\.env
    echo REACT_APP_CONTRACT_ADDRESS=check_deployment_output >> frontend\.env
    echo REACT_APP_NETWORK_NAME=sepolia >> frontend\.env
    echo REACT_APP_CHAIN_ID=11155111 >> frontend\.env
    echo REACT_APP_RPC_URL=https://sepolia.infura.io/v3/84842078b09946638c03157f83405213 >> frontend\.env
    echo. >> frontend\.env
    echo # Add your Pinata credentials >> frontend\.env
    echo REACT_APP_PINATA_JWT=your_pinata_jwt_here >> frontend\.env
    echo REACT_APP_PINATA_API_KEY=your_pinata_api_key_here >> frontend\.env
    echo REACT_APP_PINATA_API_SECRET=your_pinata_api_secret_here >> frontend\.env
    echo REACT_APP_PINATA_GATEWAY=https://gateway.pinata.cloud >> frontend\.env
)

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE! 🎉
echo ========================================
echo.
echo 🌐 Your contract is now deployed on Sepolia testnet
echo 🔗 Check the deployment output above for your contract address
echo 📝 Contract address has been saved to frontend/.env
echo.
echo 🚀 NEXT STEPS:
echo 1. Update your Pinata API keys in frontend/.env
echo 2. Start the frontend: cd frontend ^&^& npm start
echo 3. Connect MetaMask to Sepolia network
echo 4. Test your application!
echo.
echo 🚰 Need more ETH? Get free ETH from:
echo    https://sepoliafaucet.com
echo    https://faucets.chain.link/sepolia
echo.
echo 📖 View your contract on Etherscan:
echo    https://sepolia.etherscan.io
echo.
pause
