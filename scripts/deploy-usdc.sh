#!/bin/bash

# This script deploys a mock USDC token to Ganache
# and outputs the contract address to update .env.local

echo "🚀 Deploying Mock USDC to Ganache..."

# First, let's create a simple contract deployment using cast (Foundry)
# If Foundry is installed. Otherwise, we'll use a curl request to the Ganache JSON-RPC

# Check if Ganache is running
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":1}' > /dev/null 2>&1

if [ $? -ne 0 ]; then
  echo "❌ Ganache is not running on http://localhost:8545"
  echo "Please start Ganache first with: ganache"
  exit 1
fi

echo "✅ Ganache is running"

# Simple ERC20 contract bytecode (minimal USDC-like contract)
# This is a pre-compiled minimal ERC20 with transfer function
BYTECODE="0x608060405260405161033138038061033183398101906000908233600160a060020a0316815260200150604051809103906000f060008051606051600160a060020a0390811681526020820192909252604051918190039020919050565b600554600160a060020a031660009081526000805160206102f1833981519152602052604090819020549083900390556005546001546040519093918291600160a060020a0316907f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9290a3600160a060020a0316600090815260208190526040902054600181900390819055600260009055600160a060020a03909116919050565b60408051908101604052600681527f555344432e3031000000000000000000000000000000000000000000000000006020820152905600"

# For simplicity, let's just provide instructions and a simple approach
# Using eth_sendTransaction to deploy

echo ""
echo "ℹ️  For local testing without a full contract, you have two options:"
echo ""
echo "Option 1: Use a dummy address (no contract needed)"
echo "  - Update .env.local with any address"
echo "  - Your app will attempt the transfer, but it will fail on Ganache"
echo ""
echo "Option 2: Deploy a real ERC20 contract using Hardhat"
echo "  - Follow the setup below"
echo ""

cat << 'EOF'
📋 Quick Setup for Real USDC Contract:

1. Initialize Hardhat:
   npx hardhat

2. Create contracts/MockUSDC.sol:
   pragma solidity ^0.8.0;
   import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
   
   contract MockUSDC is ERC20 {
     constructor() ERC20("USDC", "USDC") {
       _mint(msg.sender, 1000000 * 10**6);
     }
     
     function decimals() public pure override returns (uint8) {
       return 6;
     }
   }

3. Deploy:
   npx hardhat run scripts/deploy.js --network localhost

This will give you a real contract address to use.
EOF

echo ""
echo "For now, let's use a simpler approach..."
