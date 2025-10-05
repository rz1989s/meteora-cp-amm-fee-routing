# Real Network Testing Guide

> **📌 MAINNET REFERENCE GUIDE**
>
> This document serves as a **reference for mainnet deployment**. Meteora CP-AMM pools are not currently available on devnet, making real devnet testing impractical without deploying your own pool infrastructure.
>
> **For development and testing**: Use `anchor test` (local validator with cloned programs)
> **For production deployment**: Follow this guide adapted for mainnet

Complete guide to testing the fee routing program with **real SOL** on live networks (devnet/mainnet).

## Overview

Unlike local validator tests (which are free and fast), real network testing:
- ✅ Uses **real SOL** (devnet or mainnet)
- ✅ Tests against **live Meteora CP-AMM** pools
- ✅ Requires **real Streamflow streams**
- ✅ Validates **end-to-end integration**
- ⚠️ Takes **24+ hours** to complete full cycle
- ⚠️ Requires **manual setup** and coordination
- ⚠️ **Devnet**: No existing Meteora pools (requires deploying your own)
- ⚠️ **Mainnet**: Use with caution, real money at risk

## Prerequisites

### 1. Devnet SOL (~0.5 SOL)

Get devnet SOL from faucet:

```bash
# Using Solana CLI
solana airdrop 1 --url devnet

# Or use web faucet
# https://faucet.solana.com/
```

Check balance:

```bash
solana balance --url devnet
```

### 2. Meteora CP-AMM Pool on Devnet

You need a Meteora Constant Product AMM pool on devnet with:
- **Quote-only fee configuration** (no base token fees)
- Active trading to generate fees
- Sufficient liquidity

**Option A: Find Existing Pool**
- Check Meteora devnet UI (if available)
- Use Meteora SDK to query pools

**Option B: Create Your Own Pool**
- Use Meteora SDK to create a CP-AMM pool
- Configure as quote-only (important!)
- Add initial liquidity

### 3. Streamflow Token Streams

Create locked token streams for test investors:

```bash
# Using Streamflow CLI or SDK
# Stream must lock tokens matching the quote mint from Policy
```

Required for each test investor:
- Token mint matching `policy.quote_mint`
- Locked amount > 0
- Valid timelock period

## Step-by-Step Testing Process

### Step 1: Verify Program Deployment

```bash
# Check program exists on devnet
solana program show RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce --url devnet
```

Expected output: Program account information

### Step 2: Verify Policy & Progress

```bash
# Run devnet deployment tests
anchor test --skip-build

# Or manually query accounts
solana account pmv5FxM6VobnJqABGBATT3hDLDzNjph1ceDPaEQrV7Q --url devnet  # Policy
solana account G8yuGH2eWAMmD5t3Kt8ygfxAGkocGuQdqqSFtPuZjJer --url devnet  # Progress
```

Policy and Progress are **already initialized** on devnet:
- Policy PDA: `pmv5FxM6VobnJqABGBATT3hDLDzNjph1ceDPaEQrV7Q`
- Progress PDA: `G8yuGH2eWAMmD5t3Kt8ygfxAGkocGuQdqqSFtPuZjJer`

### Step 3: Initialize Honorary Position

Run the test script:

```bash
npx ts-node scripts/test-real-devnet.ts
```

Or manually call `initialize_position`:

```typescript
// Get pool vault and position info from Meteora pool account
const poolAccount = await connection.getAccountInfo(poolPubkey);
// Deserialize to get vault, position_mint, etc.

const tx = await program.methods
  .initializePosition()
  .accounts({
    policy: policyPda,
    pool: poolPubkey,
    vault: vaultPubkey,
    positionOwner: positionOwnerPda,
    position: positionPubkey,
    positionMint: positionMintPubkey,
    positionMetadata: positionMetadataPubkey,
    meteoraProgram: METEORA_CP_AMM_PROGRAM_ID,
    // ... other accounts
  })
  .rpc();

console.log("Position initialized:", tx);
```

**Cost**: ~0.003 SOL (rent + transaction fees)

### Step 4: Generate Trading Fees

The pool needs trading activity to generate fees:

**Option A: Manual Trading**
- Use Meteora UI (if available on devnet)
- Perform swaps to generate trading fees

**Option B: Automated Trading Bot**
- Create a simple bot to perform small swaps
- Run for several hours to accumulate fees

**Option C: Wait for Organic Activity**
- If pool has real users, wait for natural trading

### Step 5: Wait 24 Hours

The `distribute_fees` instruction enforces a 24-hour time gate:

```rust
// From distribute_fees.rs
let time_since_last = current_time - progress.last_distribution_ts;
if time_since_last < DISTRIBUTION_WINDOW_SECONDS {
    return Err(FeeRoutingError::TooSoonToDistribute.into());
}
```

First distribution can happen immediately. Subsequent distributions require 24h wait.

### Step 6: Distribute Fees

Call `distribute_fees` to claim fees and distribute to investors:

```typescript
const tx = await program.methods
  .distributeFees(0) // page_index = 0
  .accounts({
    policy: policyPda,
    progress: progressPda,
    pool: poolPubkey,
    vault: vaultPubkey,
    position: positionPubkey,
    treasuryAuthority: treasuryAuthorityPda,
    quoteVault: quoteVaultPubkey,
    treasuryQuoteAta: treasuryQuoteAtaPubkey,
    creatorQuoteAta: creatorQuoteAtaPubkey,
    meteoraProgram: METEORA_CP_AMM_PROGRAM_ID,
    tokenProgram: TOKEN_PROGRAM_ID,
    // ... other accounts
  })
  .remainingAccounts([
    // For each investor:
    { pubkey: streamflow_stream_pubkey, isSigner: false, isWritable: false },
    { pubkey: investor_quote_ata, isSigner: false, isWritable: true },
  ])
  .rpc();

console.log("Fees distributed:", tx);
```

**Cost**: ~0.005-0.01 SOL (depends on number of investors)

### Step 7: Verify Distribution

Check transaction on Solscan:

```
https://solscan.io/tx/YOUR_TX_SIGNATURE?cluster=devnet
```

Verify:
- ✅ Quote fees claimed from pool
- ✅ Investor ATAs received tokens
- ✅ Creator ATA received remainder
- ✅ Events emitted correctly

## Expected Costs (Devnet SOL)

| Operation | Estimated Cost | Notes |
|-----------|---------------|-------|
| Initialize Position | 0.003 SOL | One-time per pool |
| Distribute Fees | 0.005-0.01 SOL | Per distribution cycle |
| Create Streamflow Streams | 0.01-0.05 SOL | Per stream (optional) |
| Pool Creation | 0.5-1 SOL | Only if creating your own pool |
| **Total (minimal)** | **~0.02 SOL** | Assuming pool already exists |

## Monitoring & Debugging

### Check Transaction Status

```bash
# Get recent transactions
solana transaction-history RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce --url devnet

# Get specific transaction
solana confirm TX_SIGNATURE --url devnet
```

### View Program Logs

```typescript
// In your test script
const tx = await program.methods
  .distributeFees(0)
  .accounts({ ... })
  .rpc({ commitment: "confirmed", skipPreflight: false });

// Fetch transaction details with logs
const txDetails = await connection.getTransaction(tx, {
  commitment: "confirmed",
  maxSupportedTransactionVersion: 0,
});

console.log("Logs:", txDetails?.meta?.logMessages);
```

### Query Account State

```typescript
// Check Policy
const policy = await program.account.policy.fetch(policyPda);
console.log("Policy:", {
  y0: policy.y0.toString(),
  investorFeeShareBps: policy.investorFeeShareBps,
  quoteMint: policy.quoteMint.toBase58(),
});

// Check Progress
const progress = await program.account.progress.fetch(progressPda);
console.log("Progress:", {
  lastDistribution: new Date(progress.lastDistributionTs.toNumber() * 1000),
  currentDay: progress.currentDay.toString(),
  dailyDistributed: progress.dailyDistributedToInvestors.toString(),
});
```

## Common Issues & Solutions

### Issue: "Too soon to distribute"

**Error**: `FeeRoutingError::TooSoonToDistribute`

**Solution**: Wait 24 hours since last distribution
```bash
# Check last distribution time
anchor run check-progress
```

### Issue: "Base fees detected"

**Error**: `FeeRoutingError::BaseFeesDetected`

**Solution**: Pool has base token fees. Only quote-only pools supported.
- Verify pool configuration
- Ensure trading generates only quote fees

### Issue: "Insufficient fees"

**Symptom**: Distribution succeeds but no tokens transferred

**Solution**: Pool hasn't generated enough fees
- Generate more trading activity
- Check pool fee tier
- Verify fees are accumulating

### Issue: "Stream not found"

**Error**: Account not found for Streamflow stream

**Solution**: Ensure Streamflow streams are created and funded
```bash
# Verify stream exists
solana account STREAM_PUBKEY --url devnet
```

## Quick Test Script

For a quick end-to-end test:

```bash
# 1. Run the test script
npx ts-node scripts/test-real-devnet.ts

# 2. Follow the instructions to:
#    - Find or create a Meteora pool
#    - Create Streamflow streams
#    - Generate trading fees

# 3. Wait 24 hours

# 4. Run distribution
npx ts-node scripts/distribute-real-fees.ts
```

## Alternative: Local Validator Testing

For faster iteration without waiting or spending SOL:

```bash
# Run full test suite on local validator (FREE, FAST)
anchor test

# Results:
# - 22/22 tests pass in ~2 seconds
# - No SOL cost
# - Tests against cloned Meteora & Streamflow programs
```

**Recommendation**: Use local validator for development, devnet for final validation.

## Checklist

Before running real devnet tests:

- [ ] Devnet SOL balance > 0.5 SOL
- [ ] Meteora CP-AMM pool identified or created
- [ ] Pool configured as quote-only (no base fees)
- [ ] Streamflow streams created for test investors
- [ ] Pool has trading activity generating fees
- [ ] Policy and Progress accounts initialized
- [ ] Test script configured with correct addresses
- [ ] 24 hours elapsed since last distribution (if not first)

## Support

If you encounter issues:

1. **Check Solscan**: View transaction details and logs
   - https://solscan.io/account/RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce?cluster=devnet

2. **View Program Logs**: Use `solana logs` to monitor in real-time
   ```bash
   solana logs RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce --url devnet
   ```

3. **Test Locally First**: Validate logic with `anchor test` before devnet

4. **Check Documentation**: Review `README.md` and `CLAUDE.md`

---

**Note**: Real devnet testing is valuable for final validation but not necessary for development. The local validator tests provide 99% confidence with 0% cost and 100x faster iteration.
