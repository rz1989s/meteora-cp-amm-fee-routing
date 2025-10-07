# Localhost Setup Guide

Complete guide for setting up the fee-routing test environment on localhost.

## Overview

The setup process creates a complete testing environment on your local Solana validator:
- ✅ Test tokens (Token A base + Token B quote)
- ✅ CP-AMM pool with liquidity
- ✅ Mock vesting data (simulated Streamflow contracts)
- ✅ Funded test wallets

## Prerequisites

### 1. Start Local Validator

```bash
solana-test-validator \
  --clone cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG \
  --url devnet
```

This clones the Meteora CP-AMM program from devnet to localhost.

**Important:** Leave this running in a separate terminal.

### 2. Verify Test Wallet

Ensure you have a test wallet with SOL:

```bash
solana balance ~/.config/solana/test-wallet.json --url localhost
```

If balance is low, request airdrop:

```bash
solana airdrop 100 ~/.config/solana/test-wallet.json --url localhost
```

## Quick Start (All-in-One)

Run the master setup script that executes all steps automatically:

```bash
npm run setup:local
```

This will:
1. ✅ Create test tokens and fund wallets
2. ✅ Create CP-AMM pool with 100k:100k liquidity
3. ✅ Generate mock vesting data for 5 investors

**Expected output:**
```
═══════════════════════════════════════
Step 1/3: Token Setup
═══════════════════════════════════════
✅ Token Setup complete

═══════════════════════════════════════
Step 2/3: Pool Setup
═══════════════════════════════════════
✅ Pool Setup complete

═══════════════════════════════════════
Step 3/3: Streams Setup
═══════════════════════════════════════
✅ Streams Setup complete

📊 Setup Summary
✅ Token Setup          SUCCESS (required)
✅ Pool Setup           SUCCESS (optional)
✅ Streams Setup        SUCCESS (optional)

🎉 All required setup steps completed!
```

## Step-by-Step Setup

### Step 1: Token Setup (Required)

Creates test tokens and funds wallets.

```bash
npm run setup:tokens
```

**Creates:**
- Token A (base): 1,000,000 supply, 9 decimals
- Token B (quote): 3,000,000 supply, 6 decimals
- 5 funded test wallets (10 SOL each + 500k Token B)

**Output file:** `.test-tokens.json`

### Step 2: Pool Setup (Optional but Recommended)

Creates CP-AMM pool with liquidity.

```bash
npm run setup:pool
```

**Creates:**
- CP-AMM pool with 100k Token A + 100k Token B liquidity
- 1:1 price ratio
- Honorary position NFT keypair (for initialize_position)

**Output files:**
- `.test-pool.json` - Pool configuration
- `.test-position-nft.json` - NFT keypair for position creation

**Note:** The honorary position must be created via the fee-routing program's `initialize_position` instruction (PDA must sign via CPI).

### Step 3: Streams Setup (Optional)

Creates mock vesting data for localhost testing.

```bash
npm run setup:streams
```

**Creates:**
- 5 investor wallets with realistic vesting schedules
- Mock Streamflow metadata (no actual contracts - localhost compatible)
- Variable locked percentages for testing pro-rata logic

**Investor Configuration:**
| Investor | Total Tokens | Locked % | Locked Amount |
|----------|-------------|----------|---------------|
| Investor 1 | 1,000,000 | 80% | 800,000 |
| Investor 2 | 800,000 | 60% | 480,000 |
| Investor 3 | 1,200,000 | 90% | 1,080,000 |
| Investor 4 | 600,000 | 50% | 300,000 |
| Investor 5 | 400,000 | 40% | 160,000 |

**Vesting Schedule:**
- 40% unlocked at cliff (TGE - 30 days ago)
- 60% vesting linearly over 1 year
- Currently ~30 days into vesting period

**Output file:** `.test-streams.json`

## Generated Configuration Files

After running setup, you'll have these files:

```
meteora-cp-amm-fee-routing/
├── .test-tokens.json          # Token mints and wallets
├── .test-pool.json            # Pool address and configuration
├── .test-position-nft.json    # NFT keypair for position creation
└── .test-streams.json         # Mock vesting data
```

### Example .test-tokens.json

```json
{
  "network": "localhost",
  "tokens": {
    "tokenA": {
      "mint": "5PEMm8zYomdRCoNyGdvE8uWkKpzgEcQ3NFmFNCvCbxqS",
      "decimals": 9
    },
    "tokenB": {
      "mint": "Gh7vFX4bSyxwAEYrZVLjwaGqCEfgQmPVAooAq4G7Z7km",
      "decimals": 6
    }
  }
}
```

### Example .test-pool.json

```json
{
  "network": "localhost",
  "pool": {
    "address": "jfH41pfDiqJ3GGa4GRuYgPmbt48u9c4FvDvMFsW3exk",
    "tokenAVault": "9y5CxQH6eBK1dQVJHofNPguz2Yz1xUKZ4Xnc6HZcVYoE",
    "tokenBVault": "HKjpSTzAxfzssMpAFG2acxPYa6gBv8R746r7Auyp6Vpr"
  },
  "position": {
    "owner": "AvRPMKVLzhZ6UmZVsEC7FGSjwq1NC56Cw5RBSM9pU4fh",
    "nftMint": "552J2S6NNnVUHfsHqRq8Q7XMHGX594smKLAdUHSaeVD6",
    "nftKeypairFile": ".test-position-nft.json"
  }
}
```

### Example .test-streams.json

```json
{
  "network": "localhost",
  "tokenMint": "Gh7vFX4bSyxwAEYrZVLjwaGqCEfgQmPVAooAq4G7Z7km",
  "streams": [
    {
      "investor": "Investor 1",
      "recipient": "8xK2vQ...",
      "recipientATA": "AwYZ3r...",
      "currentStatus": {
        "lockedAmount": 800000,
        "lockedPercent": 80
      }
    }
  ]
}
```

## Running Tests

After setup completes:

### Integration Tests (Localhost)

```bash
npm run test:local
```

Runs 22 integration tests including:
- Position initialization
- Fee distribution logic
- Pro-rata calculations
- Pagination and idempotency

### E2E Tests (Localhost)

```bash
npm run test:e2e
```

Runs 13 end-to-end tests with mock Streamflow data.

### All Tests

```bash
npm run test:all
```

Runs local + E2E + devnet + unit tests (52 total tests).

## Troubleshooting

### Validator Not Running

**Error:** `Cannot connect to localhost validator`

**Solution:**
```bash
solana-test-validator --clone cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG --url devnet
```

### Low Balance

**Error:** `Insufficient balance`

**Solution:**
```bash
solana airdrop 100 ~/.config/solana/test-wallet.json --url localhost
```

### CP-AMM Program Not Found

**Error:** `Meteora CP-AMM program not found`

**Solution:** Restart validator with `--clone` flag:
```bash
solana-test-validator \
  --clone cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG \
  --url devnet
```

### Pool Already Exists

**Warning:** `Pool already exists at [address]`

This is fine! The script will skip pool creation and use the existing pool.

To reset:
```bash
# Stop validator (Ctrl+C)
# Clear ledger
rm -rf test-ledger/
# Restart validator
solana-test-validator --clone cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG --url devnet
# Re-run setup
npm run setup:local
```

## Advanced Usage

### Individual Scripts

Run specific setup steps:

```bash
# Only tokens
npm run setup:tokens

# Only pool
npm run setup:pool

# Only streams
npm run setup:streams
```

### Devnet Streams (Real Streamflow Contracts)

To create real Streamflow contracts on devnet:

```bash
npm run setup:streams:devnet
```

**Note:** Requires devnet wallet with ~2 SOL balance. This creates actual Streamflow vesting contracts on devnet, not mocked data.

## Next Steps

1. ✅ Run `npm run setup:local` to create test environment
2. ✅ Run `npm run test:local` to verify integration tests pass
3. ✅ Run `npm run test:e2e` for end-to-end verification
4. ✅ Deploy program with `anchor deploy` (if needed)
5. ✅ Create position via `initialize_position` instruction

## Architecture Notes

### Why Mock Streams on Localhost?

Streamflow SDK requires cluster-specific runtime accounts that don't exist on localhost. Real Streamflow contracts can only be created on devnet/mainnet.

**Our Solution:**
- Generate realistic mock vesting data on localhost
- Mirrors actual Streamflow structure (metadata PDAs, schedules, amounts)
- Provides variable locked percentages for testing pro-rata logic
- Faster, deterministic, fully offline testing

**For Production:**
- Use `npm run setup:streams:devnet` to create real contracts
- Or deploy on mainnet with actual investor vesting contracts

### Why Not Create PDA-Owned Position?

The honorary position is owned by a PDA from the fee-routing program. Only the program can sign for this PDA via CPI (Cross-Program Invocation).

**The Setup Script:**
1. Creates the pool ✅
2. Generates NFT keypair ✅
3. Saves keypair for later use ✅
4. Derives position address ✅

**The Fee-Routing Program:**
1. Uses saved NFT keypair
2. Signs with PDA via CPI
3. Creates position owned by PDA
4. Position can claim fees from pool

This separation ensures proper PDA ownership and security.

## Summary

| Script | Purpose | Required | Network | Output File |
|--------|---------|----------|---------|-------------|
| setup:tokens | Create test tokens | ✅ Yes | Localhost | .test-tokens.json |
| setup:pool | Create CP-AMM pool | ⚠️ Recommended | Localhost | .test-pool.json, .test-position-nft.json |
| setup:streams | Mock vesting data | ⚠️ Recommended | Localhost | .test-streams.json |
| setup:streams:devnet | Real Streamflow contracts | ❌ Optional | Devnet | .test-streams.json |
| setup:local | All-in-one (tokens + pool + streams) | ✅ Recommended | Localhost | All files |

---

**Questions?** Check the main README or create an issue on GitHub.

**Next:** Run `npm run setup:local` to get started! 🚀
