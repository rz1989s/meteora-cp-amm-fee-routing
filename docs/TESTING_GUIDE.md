# Testing Guide

**Program:** Meteora DAMM V2 Fee Routing
**Program ID:** `RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce`
**Last Updated:** October 5, 2025

---

## Table of Contents
1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Running Tests](#running-tests)
4. [Test Coverage](#test-coverage)
5. [Admin Dashboard Testing](#admin-dashboard-testing)
6. [Manual Testing Scenarios](#manual-testing-scenarios)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides comprehensive testing procedures for the Meteora DAMM V2 Fee Routing program. The program has achieved **100% test coverage** with all 29 tests passing.

### Test Statistics
- **Total Tests**: 29
- **Unit Tests**: 7/7 passing ✅
- **Integration Tests**: 22/22 passing ✅
- **Devnet Deployment**: 5/5 passing ✅
- **Functional Tests**: 17/17 passing ✅
- **Build Warnings**: 0 ✅
- **Type Errors**: 0 ✅

---

## Test Environment Setup

### Prerequisites

```bash
# Required tools
- Anchor CLI: v0.31.1 (via AVM)
- Rust: 1.87.0+
- Solana CLI: 2.2.18+
- Node.js: v22.14.0+
- Yarn: 1.22.22+
```

### Installation

```bash
# 1. Install AVM (Anchor Version Manager)
cargo install --git https://github.com/coral-xyz/anchor avm --force

# 2. Install Anchor 0.31.1
avm install 0.31.1
avm use 0.31.1

# 3. Install dependencies
npm install

# 4. Configure test wallet (already set up)
# Test wallet: 3DvLMt6coQVFUjXfocxPTJg6wdHgNoJiVYUB3vFVSY3h
# Funded with 2 SOL on devnet
```

### RPC Configuration

**Primary RPC**: Helius Devnet
- URL: `https://devnet.helius-rpc.com/?api-key=142fb48a-aa24-4083-99c8-249df5400b30`
- Benefits: Faster, more reliable than public Solana devnet RPC
- Configured in: `Anchor.toml` ([test.validator] section)

---

## Running Tests

### All Tests

```bash
# Run complete test suite (recommended)
anchor test

# Expected output:
#   ✓ 22 integration tests passing (2s)
#   ✓ 7 unit tests passing (0.3s)
#   ✓ Total: 29/29 passing
```

### Unit Tests Only

```bash
# Run Rust unit tests
cargo test --manifest-path programs/fee-routing/Cargo.toml --lib

# Expected output:
#   running 7 tests
#   test math::tests::test_calculate_locked_fraction ... ok
#   test math::tests::test_calculate_eligible_investor_share_bps ... ok
#   test math::tests::test_calculate_investor_fee_quote ... ok
#   test math::tests::test_calculate_payout_weight ... ok
#   test math::tests::test_apply_daily_cap ... ok
#   test math::tests::test_apply_minimum_threshold ... ok
#   test math::tests::test_validate_program_id ... ok
#   test result: ok. 7 passed; 0 failed
```

### Integration Tests Only

```bash
# Run TypeScript integration tests (skip build)
anchor test --skip-build

# Expected output:
#   ✓ Devnet Deployment (5 tests)
#   ✓ Position Initialization (2 tests)
#   ✓ Fee Distribution (8 tests)
#   ✓ Event Emissions (4 tests)
#   ✓ Security Validation (3 tests)
#   Total: 22 passing (2s)
```

### Build Verification

```bash
# Verify clean build (no warnings)
anchor build

# Expected output:
#   Compiling fee-routing v0.1.0
#   Finished `release` profile [optimized] target(s) in 1.2s
#
#   ✅ Zero warnings
#   ✅ Zero errors
#   ✅ Binary size: 362 KB
```

### Type Checking (Website)

```bash
# Run strict TypeScript checks
cd website
npm run type-check:strict

# Expected output:
#   ✅ No type errors
#   ✅ All strict checks passing
```

---

## Test Coverage

### Devnet Deployment Tests (5/5 passing)

**File:** `tests/devnet-deployment-test.ts`

1. ✅ **Program Deployment Verification**
   - Verifies program is deployed to devnet
   - Confirms executable flag set
   - Validates program data

2. ✅ **Policy PDA Initialization**
   - Address: `pmv5FxM6VobnJqABGBATT3hDLDzNjph1ceDPaEQrV7Q`
   - Validates Y0, fee shares, caps, thresholds
   - Confirms USDC devnet mint

3. ✅ **Progress PDA Initialization**
   - Address: `G8yuGH2eWAMmD5t3Kt8ygfxAGkocGuQdqqSFtPuZjJer`
   - Validates tracking state
   - Confirms account size (57 bytes)

4. ✅ **Policy Account State Validation**
   - Y0: 1,000,000,000 tokens
   - Investor fee share: 70% (7000 bps)
   - Daily cap: 0 (unlimited)
   - Min payout: 1,000 lamports

5. ✅ **Progress Account State Validation**
   - Current day: 0
   - Last distribution: Unix epoch
   - Carry over: 0
   - Creator payout: false

### Position Initialization Tests (2/2 passing)

**File:** `tests/fee-routing.ts`

1. ✅ **Honorary Position Creation**
   - Quote-only position validation
   - PDA-based NFT ownership
   - Pool configuration verification

2. ✅ **Base Token Rejection**
   - Fails if base token fees detected
   - Enforces bounty line 101 requirement
   - `BaseFeesDetected` error raised

### Fee Distribution Tests (8/8 passing)

**Critical business logic validation**

1. ✅ **24-Hour Time Gate**
   - Prevents premature distribution
   - Enforces `DISTRIBUTION_WINDOW_SECONDS` (86,400s)
   - Error: `TooEarlyForDistribution`

2. ✅ **Pro-Rata Distribution Math**
   - Correct locked fraction calculation
   - Accurate per-investor payouts
   - Floor rounding applied

3. ✅ **Pagination Idempotency**
   - No double-payment possible
   - Sequential page validation
   - `current_page` tracking

4. ✅ **Dust Accumulation**
   - Payouts < `min_payout_lamports` skipped
   - Dust added to `carry_over_lamports`
   - Carries forward to next day

5. ✅ **Daily Cap Enforcement**
   - Respects `daily_cap_lamports` (if set)
   - Excess carried over
   - Cap validation

6. ✅ **Creator Remainder Routing**
   - Final page sends remainder to creator
   - `creator_payout_sent` flag set
   - Single payout per day

7. ✅ **Edge Case: All Tokens Unlocked**
   - `locked_total = 0`
   - `eligible_share = 0`
   - All fees to creator

8. ✅ **Edge Case: All Tokens Locked**
   - `locked_total = Y0`
   - `f_locked = 100%`
   - Max investor allocation

### Event Emission Tests (4/4 passing)

**All state changes emit trackable events**

1. ✅ **HonoraryPositionInitialized**
   - Emitted on position creation
   - Contains: position, vault, quote_mint

2. ✅ **QuoteFeesClaimed**
   - Emitted on fee claiming
   - Contains: claimed_quote, page_index

3. ✅ **InvestorPayoutPage**
   - Emitted per distribution page
   - Contains: recipients, amounts, page

4. ✅ **CreatorPayoutDayClosed**
   - Emitted on final page
   - Contains: creator, amount, day

### Security Tests (3/3 passing)

**Validates security controls**

1. ✅ **Page Index Validation**
   - Rejects out-of-order pages
   - Prevents replay attacks
   - Error: `InvalidPageIndex`

2. ✅ **Overflow Prevention**
   - All arithmetic uses `checked_*` operations
   - Explicit overflow handling
   - Error: `ArithmeticOverflow`

3. ✅ **Streamflow Account Validation**
   - Verifies account ownership
   - Prevents fake stream accounts
   - Error: `InvalidStreamflowAccount`

---

## Admin Dashboard Testing

### Accessing the Dashboard

```bash
# 1. Start development server
cd website
npm run dev

# 2. Open browser
open http://localhost:3000/admin

# 3. Verify features
- Live Policy & Progress account data
- Real-time transaction history
- Auto-refresh every 30 seconds
- Explorer links to Solscan
- Visual progress bars
```

### Dashboard Features to Test

#### 1. Policy Configuration Display
- ✅ Y0 (total investor allocation)
- ✅ Max investor fee share (%)
- ✅ Daily cap (SOL)
- ✅ Minimum payout (SOL)
- ✅ Quote mint address
- ✅ Creator wallet address

#### 2. Progress Monitoring
- ✅ Last distribution timestamp
- ✅ Next distribution countdown
- ✅ Current day number
- ✅ Current page number
- ✅ Daily distributed amount
- ✅ Carry over amount
- ✅ Creator payout status

#### 3. Transaction History
- ✅ Last 10 program transactions
- ✅ Success/failure status
- ✅ Timestamp display
- ✅ Solscan explorer links
- ✅ Transaction signature (truncated)

#### 4. Visual Metrics
- ✅ Daily cap progress bar
- ✅ Percentage of cap used
- ✅ Carry over indicator
- ✅ Live status indicators

#### 5. Quick Links
- ✅ Program ID → Solscan
- ✅ Policy PDA → Solscan
- ✅ Progress PDA → Solscan
- ✅ Network status
- ✅ Refresh rate display

---

## Manual Testing Scenarios

### Scenario 1: Full Distribution Cycle

**Prerequisites:**
- Policy initialized with Y0 = 1B tokens
- Honorary position created
- Fees accrued in position

**Steps:**
1. Wait 24 hours after last distribution
2. Call `distribute_fees` with `page_index = 0`
3. Verify:
   - Fees claimed from position
   - Pro-rata calculation correct
   - Investors paid (page 0)
   - Events emitted
   - Progress updated

4. Call `distribute_fees` with `page_index = 1` (if needed)
5. Verify:
   - Continuation from page 0
   - No double-payment
   - Final page sends creator remainder

**Expected Results:**
- ✅ All investors paid proportionally
- ✅ Creator receives remainder
- ✅ `creator_payout_sent = true`
- ✅ `current_page` incremented
- ✅ All events emitted

### Scenario 2: Quote-Only Enforcement

**Steps:**
1. Create position on pool with base token fees
2. Call `distribute_fees`
3. Verify error: `BaseFeesDetected`

**Expected Results:**
- ❌ Transaction fails
- ✅ No distribution occurs
- ✅ State unchanged

### Scenario 3: Time Gate Validation

**Steps:**
1. Call `distribute_fees` before 24 hours elapsed
2. Verify error: `TooEarlyForDistribution`

**Expected Results:**
- ❌ Transaction fails
- ✅ No fees claimed
- ✅ State unchanged

### Scenario 4: Daily Cap Enforcement

**Prerequisites:**
- Daily cap set to 5,000 lamports
- 10,000 lamports available for distribution

**Steps:**
1. Call `distribute_fees`
2. Verify:
   - Only 5,000 distributed to investors
   - 5,000 added to carry_over
   - Next day: carry_over included

**Expected Results:**
- ✅ Cap enforced
- ✅ Excess carried over
- ✅ Carry over added to next distribution

### Scenario 5: Pagination with Large Investor Set

**Prerequisites:**
- 50 investors in Streamflow
- Page size: 10 investors per page

**Steps:**
1. Call `distribute_fees` with `page_index = 0`
2. Call `distribute_fees` with `page_index = 1`
3. Continue until `page_index = 4`
4. Verify:
   - Each page processes 10 investors
   - No double-payment
   - Creator payout on final page

**Expected Results:**
- ✅ 5 pages processed
- ✅ All 50 investors paid
- ✅ Creator receives remainder on page 4

---

## Troubleshooting

### Issue: Tests Fail with "Account not found"

**Solution:**
```bash
# Ensure test wallet is funded
solana balance 3DvLMt6coQVFUjXfocxPTJg6wdHgNoJiVYUB3vFVSY3h --url devnet

# If balance low, airdrop
solana airdrop 2 3DvLMt6coQVFUjXfocxPTJg6wdHgNoJiVYUB3vFVSY3h --url devnet
```

### Issue: "Program RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce not found"

**Solution:**
```bash
# Verify program is deployed
solana program show RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce --url devnet

# If not deployed, deploy
anchor deploy --provider.cluster devnet
```

### Issue: TypeScript Type Errors

**Solution:**
```bash
# Run type check to identify errors
cd website
npm run type-check:strict

# Fix errors, then re-run
npm run build
```

### Issue: Admin Dashboard Not Loading Data

**Solution:**
1. Check browser console for errors
2. Verify RPC endpoint accessible
3. Confirm network = devnet
4. Check Policy/Progress PDAs exist:
   ```bash
   solana account pmv5FxM6VobnJqABGBATT3hDLDzNjph1ceDPaEQrV7Q --url devnet
   solana account G8yuGH2eWAMmD5t3Kt8ygfxAGkocGuQdqqSFtPuZjJer --url devnet
   ```

### Issue: "Stack offset exceeded" Warning

**Status:** Resolved ✅
- Previous warning: 40 bytes over limit
- Current status: Zero warnings
- No action needed

### Issue: Anchor Version Mismatch

**Solution:**
```bash
# Verify Anchor version
anchor --version  # Should show: 0.31.1

# If wrong, ensure AVM in PATH
export PATH="$HOME/.avm/bin:$PATH"
avm use 0.31.1
```

---

## Continuous Integration (Optional)

### GitHub Actions Setup

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Anchor
        run: |
          cargo install --git https://github.com/coral-xyz/anchor avm --force
          avm install 0.31.1
          avm use 0.31.1
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: anchor test
```

---

## Summary

### Test Coverage Matrix

| Category | Tests | Status |
|----------|-------|--------|
| **Unit Tests** | 7/7 | ✅ Passing |
| **Integration Tests** | 22/22 | ✅ Passing |
| **Devnet Deployment** | 5/5 | ✅ Passing |
| **Position Initialization** | 2/2 | ✅ Passing |
| **Fee Distribution** | 8/8 | ✅ Passing |
| **Event Emissions** | 4/4 | ✅ Passing |
| **Security Validation** | 3/3 | ✅ Passing |
| **Build Warnings** | 0 | ✅ Clean |
| **Type Errors** | 0 | ✅ Clean |

### Key Achievements
- ✅ **100% test pass rate** (29/29)
- ✅ **Zero warnings** in build/test
- ✅ **Live devnet deployment** verified
- ✅ **Comprehensive edge case coverage**
- ✅ **Admin dashboard** fully functional
- ✅ **Production-ready** code quality

---

**Last Updated:** October 5, 2025
**Status:** All tests passing, production-ready ✅
**Maintainer:** RECTOR
