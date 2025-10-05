#!/bin/bash
#
# Start Local Test Validator with CP-AMM and Streamflow Programs
#
# This script starts solana-test-validator and clones the Meteora CP-AMM
# and Streamflow programs from devnet. This allows integration tests to
# run against real program implementations.
#
# Prerequisites:
# - Solana CLI installed (solana-test-validator command available)
# - Internet connection (to clone programs from devnet)
#
# Usage:
#   ./scripts/start-test-validator.sh
#
# Or make it executable first:
#   chmod +x scripts/start-test-validator.sh
#   ./scripts/start-test-validator.sh

set -e  # Exit on error

# ANSI colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Configuration
HELIUS_RPC="https://devnet.helius-rpc.com/?api-key=142fb48a-aa24-4083-99c8-249df5400b30"
CP_AMM_PROGRAM="cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG"
STREAMFLOW_PROGRAM="strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m"

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║       Starting Local Test Validator with Program Cloning      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${RESET}"

# Check if solana-test-validator is available
if ! command -v solana-test-validator &> /dev/null; then
    echo -e "${RED}❌ Error: solana-test-validator not found${RESET}"
    echo ""
    echo "Please install Solana CLI tools:"
    echo "  sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ solana-test-validator found${RESET}"

# Check if validator is already running
if lsof -Pi :8899 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Local validator already running on port 8899${RESET}"
    echo ""
    read -p "Kill existing validator and restart? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Killing existing validator...${RESET}"
        lsof -ti:8899 | xargs kill -9 2>/dev/null || true
        sleep 2
    else
        echo -e "${BLUE}Using existing validator${RESET}"
        exit 0
    fi
fi

echo ""
echo -e "${BLUE}Cloning programs from devnet:${RESET}"
echo -e "  • CP-AMM:    ${CP_AMM_PROGRAM}"
echo -e "  • Streamflow: ${STREAMFLOW_PROGRAM}"
echo ""
echo -e "${YELLOW}This may take 1-2 minutes to download program data...${RESET}"
echo ""

# Start the validator with cloned programs
solana-test-validator \
  --clone ${CP_AMM_PROGRAM} \
  --clone ${STREAMFLOW_PROGRAM} \
  --url ${HELIUS_RPC} \
  --reset \
  --quiet &

VALIDATOR_PID=$!

echo -e "${GREEN}✅ Validator started (PID: ${VALIDATOR_PID})${RESET}"
echo ""

# Wait for validator to be ready
echo -e "${YELLOW}⏳ Waiting for validator to be ready...${RESET}"
sleep 5

# Check if validator is running
if ! lsof -Pi :8899 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${RED}❌ Validator failed to start${RESET}"
    exit 1
fi

# Verify programs were cloned
echo ""
echo -e "${BLUE}Verifying cloned programs...${RESET}"

CP_AMM_CHECK=$(solana account ${CP_AMM_PROGRAM} --url http://127.0.0.1:8899 --output json 2>/dev/null | grep -c "owner" || true)
STREAMFLOW_CHECK=$(solana account ${STREAMFLOW_PROGRAM} --url http://127.0.0.1:8899 --output json 2>/dev/null | grep -c "owner" || true)

if [ "$CP_AMM_CHECK" -gt 0 ]; then
    echo -e "${GREEN}  ✅ CP-AMM program cloned${RESET}"
else
    echo -e "${RED}  ❌ CP-AMM program NOT found${RESET}"
fi

if [ "$STREAMFLOW_CHECK" -gt 0 ]; then
    echo -e "${GREEN}  ✅ Streamflow program cloned${RESET}"
else
    echo -e "${RED}  ❌ Streamflow program NOT found${RESET}"
fi

echo ""
echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                 Validator Ready!                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${RESET}"

echo -e "${GREEN}Local Validator Running:${RESET}"
echo -e "  • RPC URL: http://127.0.0.1:8899"
echo -e "  • WebSocket: ws://127.0.0.1:8900"
echo -e "  • PID: ${VALIDATOR_PID}"
echo ""

echo -e "${BLUE}Next Steps:${RESET}"
echo -e "  1. Run token setup:  ${CYAN}npm run setup:local${RESET}"
echo -e "  2. Run local tests:  ${CYAN}npm run test:local${RESET}"
echo ""

echo -e "${YELLOW}To stop the validator:${RESET}"
echo -e "  • Press Ctrl+C"
echo -e "  • Or run: ${CYAN}kill ${VALIDATOR_PID}${RESET}"
echo ""

# Keep script running and forward logs
echo -e "${BLUE}Validator logs (press Ctrl+C to stop):${RESET}"
echo ""

wait $VALIDATOR_PID
