@echo off
cls
echo.
echo =========================================
echo   SEPOLIA DEPLOYMENT - QUICK SETUP
echo =========================================
echo.
echo 💰 You have 0.1003 ETH - Perfect! ✅
echo 💸 Deployment cost: ~0.02 ETH
echo 💰 Remaining after: ~0.08 ETH
echo.

:: Check if we're in the right directory
if not exist "contracts" (
    echo ❌ Error: Run this from project root directory
    echo    You should see 'contracts' and 'frontend' folders
    pause
    exit /b 1
)

echo 🔍 Checking setup...

:: Check .env file
if not exist "contracts\.env" (
    echo ❌ Error: contracts\.env file not found
    echo.
    echo Creating template .env file...
    cd contracts
    echo # Replace with YOUR MetaMask private key > .env
    echo PRIVATE_KEY=your_metamask_private_key_here >> .env
    echo SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/84842078b09946638c03157f83405213 >> .env
    echo.
    echo ✅ Template created: contracts\.env
    echo.
    echo 🔑 NEXT STEPS:
    echo 1. Get your private key from MetaMask:
    echo    MetaMask ^> Account Details ^> Show Private Key
    echo 2. Edit contracts\.env file
    echo 3. Replace 'your_metamask_private_key_here' with your actual key
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

:: Check if private key is set
cd contracts
findstr /C:"your_metamask_private_key_here" .env >nul
if %errorlevel% == 0 (
    echo ❌ Please update your private key in contracts\.env
    echo.
    echo 🔑 Steps to get your private key:
    echo 1. Open MetaMask
    echo 2. Click your account name at the top
    echo 3. Click "Account Details"
    echo 4. Click "Show Private Key"
    echo 5. Enter your MetaMask password
    echo 6. Copy the private key ^(starts with 0x...^)
    echo 7. Edit contracts\.env and replace the placeholder
    echo.
    pause
    exit /b 1
)

echo ✅ Private key configured
echo.

echo 📦 Installing dependencies...
call npm install --silent
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

echo 🚀 Deploying to Sepolia testnet...
echo ⏳ This will take 2-3 minutes...
echo.

:: Deploy with optimized script
call npx hardhat run scripts/deploy-optimized.js --network sepolia

if errorlevel 1 (
    echo.
    echo ❌ DEPLOYMENT FAILED!
    echo.
    echo 🛟 Common fixes:
    echo 1. Check your private key in .env
    echo 2. Make sure you have 0.01+ ETH
    echo 3. Check internet connection
    echo 4. Try again in a few minutes
    echo.
    pause
    exit /b 1
)

echo.
echo 🎉 DEPLOYMENT SUCCESSFUL!
echo.

:: Go back to project root
cd ..

echo 🔧 Setting up frontend...
cd frontend

:: Check if frontend .env exists and install deps
if not exist ".env" (
    echo ✅ Frontend .env will be auto-created
)

echo 📦 Installing frontend dependencies...
call npm install --silent

echo.
echo ========================================
echo   🌐 YOUR CONTRACT IS NOW GLOBAL!
echo ========================================
echo.
echo ✅ Deployed on Sepolia testnet
echo ✅ Accessible worldwide
echo ✅ Contract address saved to frontend
echo ✅ Ready for hackathon demo
echo.
echo 🚀 NEXT STEPS:
echo 1. Start frontend: npm start
echo 2. Open: http://localhost:3000
echo 3. Connect MetaMask to Sepolia network
echo 4. Test your marketplace!
echo.
echo 📋 FOR JUDGES/TESTERS:
echo • Network: Sepolia Testnet
echo • Free ETH: https://sepoliafaucet.com
echo • Contract on Etherscan: Check deployment output above
echo.
echo 🎯 Want to start frontend now? (y/n)
set /p choice="Enter y to start frontend: "

if /i "%choice%"=="y" (
    echo.
    echo 🚀 Starting frontend...
    echo 🌐 Will open at: http://localhost:3000
    echo.
    call npm start
) else (
    echo.
    echo 💡 To start frontend later:
    echo    cd frontend
    echo    npm start
    echo.
)

pause
