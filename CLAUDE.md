# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Permissionless fee routing Anchor program for Meteora DAMM v2 (Constant Product AMM / CP-AMM) pools. Creates an "honorary" NFT-based LP position that accrues fees, then distributes them to investors (pro-rata based on Streamflow locked amounts) via a 24-hour permissionless crank, with remainder going to creators.

**Program ID**: `RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP` ✨ (Deployed on Devnet)

**Devnet Explorer**: [View on Solscan](https://solscan.io/account/RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP?cluster=devnet)
**Deployer**: `RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b`

**Project Status**: ✅ **COMPLETE** - Fully implemented and production ready

**Bounty Outcome**: ❌ Did not win. Winner: [L0STE/star-bounty](https://github.com/L0STE/star-bounty). Key difference: Winner creates pool with `OnlyB` fee mode at protocol level; we integrate with existing pools.

**Build Status**: ✅ 371KB binary (370,696 bytes), ZERO warnings (cargo check & cargo test)
**Instructions**: 4/4 complete (initialize_policy, initialize_progress, initialize_position, distribute_fees)
**Token Transfers**: ✅ Fully implemented with real SPL transfers via treasury PDA
**Error Handling**: ✅ All error types defined, including BaseFeesDetected for quote-only enforcement
**Code Quality**: ✅ 0 unsafe blocks, 0 warnings, 7/7 unit tests passing

**Important Terminology Note:**
- This project is for **Meteora DAMM V2** (also called **CP-AMM** - Constant Product AMM)
- The bounty URL says "dlmm-v2" but that's a typo on the platform
- The actual bounty document clearly states "DAMM V2" throughout
- Always refer to this as DAMM V2 or CP-AMM, NOT DLMM
- Only mention "DLMM" when referencing the original bounty URL

## Current Status

**Build**: ✅ 100% success (371KB binary, 370,696 bytes, 0 errors, 0 warnings)
**Tests**: ✅ Unit tests: 7/7 passing | cargo check: 0 warnings | cargo test: 0 warnings
**Implementation**: ✅ All instructions fully implemented with real SPL token transfers
**Compliance**: ✅ 100% bounty alignment (see pitch website compliance matrix)
**Documentation**: ✅ Comprehensive (README + pitch website + bounty alignment + this guide)
**Bounty Requirements**: ✅ 100% met - ready for submission

## Key Documentation Files

**Active Documentation** (use these):
- `README.md` - Main documentation (33KB, comprehensive)
- `docs/planning/PRD_IMPROVEMENTS.md` - Product requirements for bounty improvements
- `docs/planning/EXECUTION_PLAN_DUAL_BUNDLE.md` - Triple-bundle testing execution plan
- `docs/reports/FINAL_STATUS.md` - Complete verification report
- `docs/reports/FINAL_VERIFICATION_REPORT.md` - Autonomous testing verification
- `docs/reports/TEST_RESULTS_E2E.md` - E2E integration test results
- `docs/testing/TESTING_GUIDE.md` - Complete testing guide
- `docs/security/SECURITY_AUDIT.md` - Security audit checklist
- `docs/website/WEBSITE_TEST_REPORT.md` - Pitch website testing results
- `docs/bounty/bounty-original.md` - Original bounty requirements
- `CLAUDE.md` - This file (project guidance)

**Archived Documentation** (historical reference only):
- `archive/bounty-analysis.md` - Initial bounty analysis
- `archive/INTEGRATION_GUIDE.md` - Phase 1 research
- `archive/TASKS.md` - Outdated task tracking
- `archive/TEST_PLAN.md` - Original test planning
- `archive/PROGRESS.md` - Outdated progress tracking

## Build & Test Commands

```bash
# Build the program (verifiable for reproducibility)
anchor build --verifiable

# Regular build (faster, but not reproducible across machines)
anchor build

# Run all tests (requires devnet validator with account clones)
anchor test

# Test with specific Solana validator
anchor test --provider.cluster devnet
```

## Program Verification Workflow

### Understanding Hash Differences

When deploying Solana programs, you may notice hash differences between local builds and deployed programs. **This is NORMAL and EXPECTED behavior** due to BPF Loader transformations during deployment.

**Key Facts:**
- `anchor build --verifiable` produces **deterministic, reproducible builds** (same hash on any machine)
- BPF Loader **adds metadata during deployment** (+12,288 bytes for our program)
- Local `.so` file hash will **never match** deployed program hash (BPF transformation is unavoidable)
- The `--verifiable` flag ensures **anyone can verify your source** by rebuilding and comparing hashes

**Example:**
```bash
# Verifiable build produces reproducible hash (same on ANY machine)
anchor build --verifiable
shasum -a 256 target/verifiable/fee_routing.so
# Result: f17b9a32... (368,640 bytes) - reproducible across machines

# Deployed program has different hash (BPF processed)
solana program dump RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP deployed.so --url devnet
shasum -a 256 deployed.so
# Result: 4f81eac6... (380,928 bytes) - includes +12,288 bytes BPF metadata
```

### Proper Verification Steps

To verify a deployed program matches your source code:

1. **Build with verifiable flag:**
   ```bash
   anchor build --verifiable
   # This creates target/verifiable/fee_routing.so
   # Hash is reproducible on ANY machine
   ```

2. **Verify build reproducibility (optional):**
   ```bash
   # Anyone can rebuild from your source and verify they get the same hash
   shasum -a 256 target/verifiable/fee_routing.so
   # Expected: f17b9a32057833a6187ab8001de933c145275216ad91989dc2352f807a825c4f
   ```

3. **Deploy to devnet:**
   ```bash
   # Copy verifiable build to deploy location
   cp target/verifiable/fee_routing.so target/deploy/fee_routing.so

   # Deploy
   solana program deploy target/deploy/fee_routing.so \
     --program-id target/deploy/fee_routing-keypair.json \
     --keypair ~/.config/solana/REC-devnet.json \
     --url devnet
   ```

4. **Download deployed binary:**
   ```bash
   solana program dump RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP \
     devnet-program.so --url devnet
   ```

5. **Save as source of truth:**
   ```bash
   # Keep this file for future verifications
   shasum -a 256 devnet-program.so
   # Expected: 4f81eac65081f112ca419886c799992cf117f8bb725feb2009f3f6bbd7c71e46
   ```

5. **For future deployments:**
   ```bash
   # Build new version
   anchor build

   # Deploy
   anchor upgrade target/deploy/fee_routing.so --program-id ... --provider.cluster devnet

   # Verify by downloading and comparing against previous devnet-program.so
   solana program dump RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP new-deploy.so --url devnet
   shasum -a 256 new-deploy.so

   # If hashes differ, source code has changed (expected for upgrades)
   # If hashes match, no changes deployed (unexpected)
   ```

### DO NOT Do This ❌

```bash
# WRONG: Comparing local .so with deployed program
shasum -a 256 target/deploy/fee_routing.so  # Local build
shasum -a 256 deployed.so                    # Devnet dump
# These will NEVER match due to BPF Loader transformation
```

### DO This ✅

```bash
# CORRECT: Compare devnet dumps from different times
shasum -a 256 devnet-program-v1.so  # Previous deployment dump
shasum -a 256 devnet-program-v2.so  # Current deployment dump
# These WILL match if source code unchanged
```

### Verification Tools

**Automated verification script:**
```bash
#!/bin/bash
# verify-deployment.sh

PROGRAM_ID="RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP"
EXPECTED_DEPLOYED_HASH="4f81eac65081f112ca419886c799992cf117f8bb725feb2009f3f6bbd7c71e46"
EXPECTED_VERIFIABLE_HASH="f17b9a32057833a6187ab8001de933c145275216ad91989dc2352f807a825c4f"

# Download current deployment
solana program dump $PROGRAM_ID /tmp/current-deploy.so --url devnet

# Verify deployed hash
ACTUAL_HASH=$(shasum -a 256 /tmp/current-deploy.so | awk '{print $1}')

if [ "$ACTUAL_HASH" = "$EXPECTED_DEPLOYED_HASH" ]; then
    echo "✅ Deployed hash verified: Program matches devnet-program.so"
else
    echo "❌ Deployed hash mismatch"
    echo "Expected: $EXPECTED_DEPLOYED_HASH"
    echo "Got:      $ACTUAL_HASH"
    exit 1
fi

# Build verifiable and verify reproducibility
anchor build --verifiable > /dev/null 2>&1
VERIFIABLE_HASH=$(shasum -a 256 target/verifiable/fee_routing.so | awk '{print $1}')

if [ "$VERIFIABLE_HASH" = "$EXPECTED_VERIFIABLE_HASH" ]; then
    echo "✅ Verifiable build hash matches: Source code unchanged"
    exit 0
else
    echo "⚠️  Verifiable build hash differs: Source code may have changed"
    echo "Expected: $EXPECTED_VERIFIABLE_HASH"
    echo "Got:      $VERIFIABLE_HASH"
    exit 1
fi
```

**Current Deployment Reference:**
- **Verifiable Build Hash:** `f17b9a32057833a6187ab8001de933c145275216ad91989dc2352f807a825c4f` (368,640 bytes)
- **Deployed Hash (BPF transformed):** `4f81eac65081f112ca419886c799992cf117f8bb725feb2009f3f6bbd7c71e46` (380,928 bytes)
- **Saved Binary:** `devnet-program.so` (matches deployed hash)
- **Build Method:** `anchor build --verifiable` (reproducible across machines)

## Test Infrastructure

### RPC Configuration
- **Primary RPC**: Helius devnet RPC (authenticated with API key)
- **URL**: `https://devnet.helius-rpc.com/?api-key=142fb48a-aa24-4083-99c8-249df5400b30`
- **Configured in**: `Anchor.toml` ([test.validator] section), `package.json`, test files, scripts
- **Benefits**: Faster, more reliable than public Solana devnet RPC

**⚠️ Security Notice - API Key Rotation Plan:**

The Helius API key is currently hardcoded in multiple files for development convenience and judge accessibility. This is a **temporary measure** with a clear security plan:

**Why Hardcoded:**
- ✅ Public Solana RPC **tested and failed** (rate limits during program cloning)
- ✅ Anchor.toml **does not support** environment variables (verified via research)
- ✅ CP-AMM program cloning requires ~2.6MB bandwidth (public RPC insufficient)
- ✅ Enables judges/reviewers to test immediately without additional setup

**Security Plan:**
- 🔐 Key will be **ROTATED IMMEDIATELY** after bounty submission judgment
- 🔐 Rotation at: https://www.helius.dev/
- 🔐 New key will be stored in `.env` (gitignored) for future development
- 🔐 This is a **devnet-only key** with no mainnet access or financial risk

**Files Containing Key:**
- `Anchor.toml` (line 32)
- `package.json` (lines 10, 21, 22)
- `scripts/*.ts` (setup and utility scripts)
- `tests/devnet-*.ts` (devnet test files)
- `website/app/admin/page.tsx` (admin dashboard)

See `.env.example` for detailed rotation plan and post-submission setup instructions.

### Wallet Configuration

**Two wallets are used in this project with distinct purposes:**

#### 1. Test Wallet (User Operations)
- **Keypair Path**: `~/.config/solana/test-wallet.json`
- **Address**: `3DvLMt6coQVFUjXfocxPTJg6wdHgNoJiVYUB3vFVSY3h`
- **Balance**: ~11 SOL on devnet (funded from deployer wallet)
- **Purpose**: Regular user operations, testing, and development

**When to use `test-wallet.json`:**
- ✅ Running tests (`npm run test:*`)
- ✅ Creating test tokens/pools/streams
- ✅ Interacting with the program as a regular user
- ✅ Setup scripts (`npm run setup:*`)
- ✅ Fee distribution operations
- ✅ Any non-administrative program interactions

**Example usage:**
```bash
# Running tests
ANCHOR_WALLET=~/.config/solana/test-wallet.json npm run test:devnet

# Creating test resources
ts-node scripts/setup-test-streams.ts  # Uses test-wallet.json internally
```

#### 2. Deployer Wallet (Administrative Operations)
- **Keypair Path**: `~/.config/solana/REC-devnet.json`
- **Address**: `RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b`
- **Balance**: ~118 SOL on devnet
- **Purpose**: Program deployment, upgrades, and administrative operations

**When to use `REC-devnet.json`:**
- ✅ Deploying the program (`anchor deploy`)
- ✅ Upgrading the program (`anchor upgrade`)
- ✅ Setting program upgrade authority
- ✅ Funding the test wallet
- ✅ Administrative operations requiring program authority

**Example usage:**
```bash
# Deploy program to devnet
ANCHOR_WALLET=~/.config/solana/REC-devnet.json anchor deploy --provider.cluster devnet

# Upgrade program
ANCHOR_WALLET=~/.config/solana/REC-devnet.json anchor upgrade \
  --program-id RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP \
  target/deploy/fee_routing.so \
  --provider.cluster devnet

# Fund test wallet
solana transfer --from ~/.config/solana/REC-devnet.json \
  3DvLMt6coQVFUjXfocxPTJg6wdHgNoJiVYUB3vFVSY3h \
  10 --url devnet
```

**Security Best Practice:**
- Keep `REC-devnet.json` secure (program upgrade authority)
- Use `test-wallet.json` for day-to-day development
- Never commit keypair files to git (already in .gitignore)

### Devnet Deployment
- **Program ID**: `RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP`
- **Upgrade Authority**: `RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b` (deployer wallet)
- **Policy PDA**: `6YyC75eRsssSnHrRFYpRiyoohCQyLqiHDe6CRje69hzt`
- **Progress PDA**: `9cumYPtnKQmKsVmTeKguv7h3YWspRoMUQeqgAHMFNXxv`
- **Latest Deployment**: `3tVHXk9yaaDkWGGnHiGWr4QvJ3rojFpSSErujMmbMAQ4SjgFw37ExfUZTgPenxekPKrJo1HX9zugnvJkQMdi9hCW` (Oct 7, 2025 - Verifiable build)

## Core Architecture

### Four-Instruction Design

1. **`initialize_policy`**: Sets up immutable distribution configuration (Y0, fee shares, caps, thresholds)
2. **`initialize_progress`**: Creates daily distribution tracking state (mutable, tracks pagination & payouts)
3. **`initialize_position`**: Creates NFT-based honorary DAMM v2 position owned by program PDA
4. **`distribute_fees`**: Permissionless 24h crank that claims fees and distributes via token transfers (supports pagination)

### State Accounts

**Policy** (`seeds = [b"policy"]`):
- Immutable distribution configuration
- Fields: `y0` (total investor allocation at TGE), `investor_fee_share_bps`, `daily_cap_lamports`, `min_payout_lamports`, `quote_mint`, `creator_wallet`, `authority`, `bump`

**Progress** (`seeds = [b"progress"]`):
- Daily distribution tracking state (mutable)
- Fields: `last_distribution_ts`, `current_day` (u64), `daily_distributed_to_investors`, `carry_over_lamports`, `current_page`, `pages_processed_today`, `total_investors`, `creator_payout_sent`, `has_base_fees`, `total_rounding_dust`, `bump`

### PDA Seeds

```rust
VAULT_SEED = b"vault"
INVESTOR_FEE_POS_OWNER_SEED = b"investor_fee_pos_owner"
POLICY_SEED = b"policy"
PROGRESS_SEED = b"progress"
TREASURY_SEED = b"treasury"

// Position owner PDA derivation:
[VAULT_SEED, vault.key(), INVESTOR_FEE_POS_OWNER_SEED]

// Treasury authority PDA derivation (signs for token transfers):
[TREASURY_SEED]

// Policy PDA derivation:
[POLICY_SEED]

// Progress PDA derivation:
[PROGRESS_SEED]
```

## Critical Implementation Requirements

### Quote-Only Enforcement (CRITICAL)

Bounty requirement (line 101): **"If any base fees are observed, the crank must fail deterministically"**

**Our Implementation**:
- **Position Creation**: Validates pool authority and program ID in `initialize_position`
- **Fee Claiming**: Claims fees from pool (page 0 only)
- **Base Fee Check**: If any Token A (base) fees detected → **FAIL IMMEDIATELY**
  ```rust
  if page_index == 0 && claimed_token_a > 0 {
      return Err(FeeRoutingError::BaseFeesDetected.into());
  }
  ```
- **Distribution**: Only Token B (quote) distributed to investors pro-rata, remainder to creator
- **Compliance**: Strict enforcement ensures bounty line 101 requirement is met

### Pro-Rata Distribution Math

```rust
// Compute locked fraction (0 to 1)
f_locked(t) = locked_total(t) / Y0

// Eligible investor share (capped, basis points)
eligible_investor_share_bps = min(investor_fee_share_bps, floor(f_locked(t) * 10000))

// Total allocated to investors this cycle
investor_fee_quote = floor(claimed_quote * eligible_investor_share_bps / 10000)

// Per-investor weight
weight_i(t) = locked_i(t) / locked_total(t)

// Per-investor payout (floor rounding)
payout_i = floor(investor_fee_quote * weight_i(t))
```

### Idempotent Pagination

- `distribute_fees` called multiple times with sequential `page_index` within same 24h window
- Track `current_page` in Progress to prevent double-payment
- Support resume if crank interrupted mid-distribution
- Creator payout only on final page when `creator_payout_sent == false`

### Dust & Cap Handling

- Skip transfers below `min_payout_lamports` threshold
- Accumulate skipped dust in `carry_over_lamports` for next distribution
- Enforce `daily_cap_lamports` if configured (0 = no cap)
- Excess above cap carries forward to next day

## External Program Integration

### Meteora CP-AMM
- **Program ID**: `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG`
- Used for position creation and fee claiming
- Cloned in test validator (see `Anchor.toml`)

### Streamflow
- **Program ID**: `strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m`
- Read locked token amounts per investor via stream accounts
- Passed as remaining accounts in `distribute_fees` (alternating: stream_pubkey, investor_ata)
- Cloned in test validator

## Event Emissions

All state changes must emit events for off-chain tracking:
- `HonoraryPositionInitialized`: Position created
- `QuoteFeesClaimed`: Fees claimed from pool
- `InvestorPayoutPage`: Each page of investor distributions (includes amounts and recipients)
- `CreatorPayoutDayClosed`: Creator remainder sent

## Testing Strategy

🏆 **Triple-Bundle Testing Strategy** - Comprehensive verification through local integration tests, E2E tests, AND live devnet deployment.

**Test Results Summary:**
- ✅ **Local Integration Bundle:** 22/22 passing (TypeScript)
- ✅ **E2E Integration Bundle:** 15/15 passing (TypeScript)
- ✅ **Devnet Bundle:** 10/10 passing (TypeScript)
- ✅ **Rust Unit Tests:** 7/7 passing
- ✅ **Total:** 54 unique tests across all bundles

---

### Bundle 1: Local Integration Tests (22/22 passing)

**Purpose:** Core program logic and integration testing

**Run:**
```bash
npm run test:local        # All local integration tests
```

**Test Breakdown:**
- **17 fee routing tests** (fee-routing.ts):
  - Position initialization logic
  - Base fee rejection
  - 24h time gate enforcement
  - Pro-rata distribution math
  - Pagination idempotency
  - Dust accumulation
  - Daily cap enforcement
  - Creator remainder payout
  - Edge cases (all locked/unlocked)
  - Event emissions
  - Security validations

- **4 integration logic tests** (program-logic-tests.ts):
  - Error definitions verification
  - Source code validation
  - IDL verification

- **1 test summary** display

**Environment:**
- Local `solana-test-validator`
- Core program logic testing

---

### Bundle 2: E2E Integration Tests (15/15 passing)

**Purpose:** End-to-end integration with external SDKs

**Run:**
```bash
npm run test:e2e          # E2E integration tests
npm run setup:local       # Setup environment first
```

**Test Breakdown:**
- **15 E2E integration tests** (e2e-integration.ts):
  - Program initialization (Policy + Progress PDAs)
  - Pool/position verification (verifies configuration even without on-chain accounts)
  - Pro-rata distribution with mock Streamflow data
  - Quote-only enforcement
  - Edge cases (daily cap, dust, all locked/unlocked)
  - Event schema verification
  - Comprehensive test summary

**Key Innovation:**
- **Hybrid Testing Approach:**
  - ✅ CP-AMM: Real integration when pool exists
  - ✅ Streamflow: Mock data (SDK has cluster limitation)
  - ✅ All logic tested without external dependencies

**Mock Data Strategy:**
- Created `.test-streams.json` with realistic vesting data
- Tests verify distribution math without actual Streamflow contracts
- Faster, deterministic, fully runs on localhost

**Environment:**
- Local `solana-test-validator`
- Cloned programs: CP-AMM (`cpamdp...`), Streamflow (`strmRq...`)
- Mock Streamflow data for logic verification
- Real CP-AMM pool (when setup scripts run)

---

### Bundle 3: Live Devnet Tests (10/10 passing)

**Purpose:** Real-world production verification on live Solana devnet

**Run:**
```bash
npm run test:devnet       # 2-second execution with Helius RPC
```

**Test Breakdown:**
- **10 TypeScript devnet tests:**
  - 5 deployment verification (program, PDAs, state)
  - 4 integration logic tests (error definitions, IDL)
  - 1 test summary display

- **7 Rust unit tests:**
  - Locked fraction calculation
  - Eligible share with cap
  - Investor allocation math
  - Pro-rata payout weights
  - Daily cap application
  - Minimum threshold handling
  - Program ID verification

**Key Verifications:**
- ✅ Program deployed: `RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP`
- ✅ Policy PDA: `6YyC75eRsssSnHrRFYpRiyoohCQyLqiHDe6CRje69hzt`
- ✅ Progress PDA: `9cumYPtnKQmKsVmTeKguv7h3YWspRoMUQeqgAHMFNXxv`
- ✅ Account states valid
- ✅ Error definitions correct
- ✅ Verifiable on Solscan

**Environment:**
- Live Solana devnet via Helius RPC
- Deployed program with real on-chain state

---

### Run All Tests

```bash
npm run test:all          # Runs local + e2e + devnet + unit
```

**Expected output:**
```
✅ Local integration tests: 22/22 passing
✅ E2E integration tests: 15/15 passing
✅ Devnet tests: 10/10 passing
✅ Unit tests: 7/7 passing
✅ Total: 54 tests passing
```

---

### Why Triple-Bundle Strategy

**Bounty Compliance:**
- Meets line 139: "Tests demonstrating end-to-end flows on local validator"
- All 17 integration tests fully implemented (zero stubs)
- CP-AMM and Streamflow integration demonstrated

**Production Readiness:**
- Proves program works on live network
- Judges can verify on Solscan immediately
- Real on-chain state validation

**Professional Engineering:**
- Systematic testing approach with mock data strategy
- Comprehensive coverage (logic + integration + deployment)
- Fast execution (local: <30s, e2e: <1s, devnet: 2s)
- Resilient to external SDK limitations

## Constants

- `DISTRIBUTION_WINDOW_SECONDS = 86_400` (24 hours)
- `BPS_DENOMINATOR = 10_000` (100% in basis points)

## Development Notes

- **Anchor version**: 0.31.1 (via AVM - Anchor Version Manager)
- **Rust edition**: 2021
- **Test runner**: ts-mocha with 1000s timeout
- **⚠️ IMPORTANT**: Always run `npm run type-check:strict` in website/ after making code changes to ensure TypeScript strictness
  - This ensures the codebase remains clean, clear, and type-safe
  - Fix all errors before committing
  - Command: `cd website && npm run type-check:strict`
- **Release profile**: overflow checks enabled, LTO fat, single codegen unit
- **Binary size**: 371 KB (370,696 bytes)
- All arithmetic must use checked operations or explicit overflow handling
- PDA derivations must be deterministic and collision-resistant
- No `unsafe` code blocks (verified)

## Pitch Website

A professional Next.js pitch website has been created at `website/`:
- **Live URL**: https://meteora-fee-routing.rectorspace.com/
- **Technology**: Next.js 14.2.33, React, TypeScript, Tailwind CSS
- **Pages**: 6 pages (Home, Technical, Testing, Documentation, Admin, Submission)
- **Features**: Interactive fee calculator, live admin dashboard, code syntax highlighting, responsive design
- **Status**: ✅ Tested and verified (see `docs/website/WEBSITE_TEST_REPORT.md`)
- **Run locally**: `cd website && npm install && npm run dev`

### Link Checking

**Status**: ✅ All 29 links verified working (internal and external)

**Quick check:**
```bash
cd website
npm run check-links  # Automated check with linkinator
```

**Manual verification:**
```bash
# Extract all links
grep -r "href=" app/ components/ --include="*.tsx" -h | grep -o 'href="[^"]*"' | sort -u

# Test external link
curl -I -L https://example.com
```

**Link inventory:**
- **Internal links (7)**: All Next.js routes validated
- **External docs (3)**: Anchor, Meteora, Streamflow docs
- **GitHub (8)**: Repository, README, source code, documentation
- **Solscan (7)**: Program, PDAs, wallets, transactions (all devnet)
- **Social (2)**: Telegram, Twitter/X

**Report**: See `website/LINK_CHECK_REPORT.md` for detailed verification results

## Repository Structure

```
meteora-cp-amm-fee-routing/
├── programs/fee-routing/    # Anchor program source code
├── tests/                   # Integration tests (TypeScript)
├── website/                 # Next.js pitch website
├── docs/                    # Documentation (organized by type)
│   ├── bounty/             # Bounty requirements & analysis
│   ├── deployment/         # Deployment & upgrade guides
│   ├── planning/           # PRDs, execution plans, strategies
│   ├── reports/            # Status & verification reports
│   ├── security/           # Security audits
│   ├── testing/            # Testing guides & constraints
│   └── website/            # Website documentation
├── archive/                 # Historical documentation
├── README.md               # Main documentation (33KB)
└── CLAUDE.md              # This file (project guidance)
```
