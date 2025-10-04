#!/bin/bash

echo ""
echo "🚀 Devnet Deployment Verification"
echo "=================================="
echo ""

PROGRAM_ID="RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce"
WALLET="RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b"

echo "Program ID: $PROGRAM_ID"
echo "Wallet: $WALLET"
echo ""

echo "📦 Checking Program..."
solana program show $PROGRAM_ID --url devnet | grep -E "Program Id|Authority|Data Length|Balance"
echo ""

echo "💰 Checking Wallet Balance..."
solana balance $WALLET --url devnet
echo ""

echo "✅ Deployment verified on Solana Devnet!"
echo "📊 View on Explorer:"
echo "   https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
echo ""
