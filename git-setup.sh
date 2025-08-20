#!/bin/bash

# Git Setup and Push Script for HackBuild Codewarriors
echo "🚀 Setting up Git repository for HackBuild Codewarriors..."

# Initialize git repository
echo "📦 Initializing Git repository..."
git init

# Add remote repository
echo "🔗 Adding remote repository..."
git remote add origin https://github.com/GDGVITM/hackbuild-Codewarriors.git

# Check if remote was added successfully
echo "✅ Remote repository added:"
git remote -v

# Stage all files
echo "📁 Adding all files to staging..."
git add .

# Check git status
echo "📊 Current git status:"
git status

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "🎉 Initial commit: Decentralized Notes Marketplace

✨ Features implemented:
- Smart contract with ERC721 NFT functionality
- React TypeScript frontend with Web3 integration
- IPFS file storage via Pinata
- Comprehensive marketplace UI
- Advanced search and filtering
- Rating and review system
- User profiles and analytics
- Admin dashboard
- Security features and testing

🛠 Tech Stack:
- Frontend: React 18 + TypeScript + Custom CSS
- Blockchain: Solidity + Hardhat + OpenZeppelin
- Storage: IPFS + Pinata + Express proxy
- Web3: Wagmi + ethers.js + MetaMask integration

🏆 HackBuild 2025 Submission by Team Codewarriors"

# Push to main branch
echo "🚀 Pushing to GitHub repository..."
git branch -M main
git push -u origin main

echo "✅ Repository successfully pushed to GitHub!"
echo "🔗 Repository URL: https://github.com/GDGVITM/hackbuild-Codewarriors"

# Display next steps
echo ""
echo "🎯 Next Steps:"
echo "1. Visit: https://github.com/GDGVITM/hackbuild-Codewarriors"
echo "2. Verify all files are uploaded"
echo "3. Update repository description and tags"
echo "4. Add collaborators if needed"
echo "5. Create releases for major milestones"
echo ""
echo "📋 Repository is ready for hackathon submission!"
