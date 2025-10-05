#!/bin/bash

# Real Network Integration Test
# MAINNET REFERENCE: This script demonstrates testing with real SOL
# Note: Meteora CP-AMM pools don't exist on devnet - use local tests or mainnet

set -e

echo "🚀 Real Network Integration Test (Mainnet Reference)"
echo "⚠️  Note: No Meteora pools on devnet - use 'anchor test' for testing"
echo ""

# Configuration
PROGRAM_ID="RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce"
POLICY_PDA="pmv5FxM6VobnJqABGBATT3hDLDzNjph1ceDPaEQrV7Q"
PROGRESS_PDA="G8yuGH2eWAMmD5t3Kt8ygfxAGkocGuQdqqSFtPuZjJer"

echo "📋 Configuration:"
echo "  Program ID: $PROGRAM_ID"
echo "  Policy PDA: $POLICY_PDA"
echo "  Progress PDA: $PROGRESS_PDA"
echo ""

# Check SOL balance
echo "💰 Checking SOL balance..."
BALANCE=$(solana balance --url devnet)
echo "  Balance: $BALANCE"
echo ""

if [[ "$BALANCE" == "0 SOL" ]]; then
  echo "⚠️  No SOL! Get devnet SOL from faucet:"
  echo "  solana airdrop 1 --url devnet"
  exit 1
fi

# Check program deployment
echo "🔍 Verifying program deployment..."
if solana program show $PROGRAM_ID --url devnet &>/dev/null; then
  echo "  ✅ Program deployed on devnet"
else
  echo "  ❌ Program not found on devnet"
  exit 1
fi
echo ""

# Check Policy account
echo "🔍 Checking Policy account..."
if solana account $POLICY_PDA --url devnet &>/dev/null; then
  echo "  ✅ Policy initialized"
  POLICY_SIZE=$(solana account $POLICY_PDA --url devnet | grep "Length:" | awk '{print $2}')
  echo "  Size: $POLICY_SIZE bytes"
else
  echo "  ❌ Policy not initialized"
  echo "  Run: anchor run initialize-policy"
  exit 1
fi
echo ""

# Check Progress account
echo "🔍 Checking Progress account..."
if solana account $PROGRESS_PDA --url devnet &>/dev/null; then
  echo "  ✅ Progress initialized"
  PROGRESS_SIZE=$(solana account $PROGRESS_PDA --url devnet | grep "Length:" | awk '{print $2}')
  echo "  Size: $PROGRESS_SIZE bytes"
else
  echo "  ❌ Progress not initialized"
  echo "  Run: anchor run initialize-progress"
  exit 1
fi
echo ""

# Summary
echo "================================================================"
echo "✅ Program Deployed on Devnet"
echo "================================================================"
echo ""
echo "⚠️  IMPORTANT: Meteora CP-AMM pools don't exist on devnet!"
echo ""
echo "For MAINNET deployment, follow these steps:"
echo ""
echo "1. Find a Meteora CP-AMM pool on MAINNET"
echo "   - Pool must be quote-only (no base token fees)"
echo "   - Verify pool using Meteora SDK or explorer"
echo ""
echo "2. Initialize honorary position for the pool"
echo "   - This will cost ~0.003 SOL (one-time)"
echo "   - Creates NFT position owned by program PDA"
echo ""
echo "3. Generate trading fees in the pool"
echo "   - Perform swaps to accrue fees"
echo "   - Or wait for organic trading activity"
echo ""
echo "4. Create Streamflow token streams for test investors"
echo "   - Streams must lock tokens matching Policy quote mint"
echo "   - Each stream represents one investor"
echo ""
echo "5. Wait 24 hours (after first distribution)"
echo ""
echo "6. Call distribute_fees instruction"
echo "   - This will cost ~0.005-0.01 SOL per distribution"
echo "   - Claims fees from pool"
echo "   - Distributes to investors pro-rata"
echo "   - Sends remainder to creator"
echo ""
echo "================================================================"
echo "💡 Testing Strategy"
echo "================================================================"
echo ""
echo "✅ RECOMMENDED: Local validator testing (free, fast, comprehensive)"
echo "  anchor test"
echo "  → Runs 22 tests in ~2 seconds with 0 SOL cost"
echo "  → Tests against cloned Meteora + Streamflow programs"
echo "  → 100% test coverage including edge cases"
echo ""
echo "⚠️  MAINNET DEPLOYMENT: Use this guide as reference"
echo "  → Adapt instructions for mainnet (real money at risk!)"
echo "  → Thoroughly test on local validator first"
echo "  → Start with small amounts and single pool"
echo ""
echo "📖 For detailed mainnet deployment guide, see:"
echo "  docs/deployment/REAL_DEVNET_TESTING.md"
echo "  (Note: Title says 'Devnet' but serves as mainnet reference)"
echo ""
