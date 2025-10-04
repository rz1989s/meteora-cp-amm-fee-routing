# Meteora DAMM V2 Fee Routing

**Permissionless fee routing Anchor program for Meteora DAMM V2 (Constant Product AMM) pools.**

This module creates an "honorary" quote-only LP position owned by a program PDA that accrues fees, then distributes them via a permissionless 24-hour crank with pagination support.

**Program ID:** `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS`

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Instructions](#instructions)
5. [Account Tables](#account-tables)
6. [State Accounts](#state-accounts)
7. [Policy Configuration](#policy-configuration)
8. [Day & Pagination Semantics](#day--pagination-semantics)
9. [Error Codes](#error-codes)
10. [Events](#events)
11. [Integration Guide](#integration-guide)
12. [Testing](#testing)
13. [Failure Modes](#failure-modes)

---

## Overview

This program implements permissionless fee routing for Meteora DAMM V2 pools with two core instructions:

### Work Package A: `initialize_position`
Creates an honorary DAMM V2 LP position that:
- Accrues fees **exclusively in the quote mint** (token B)
- Is owned by a program PDA via NFT-based ownership
- Validates pool configuration to reject base fee accrual

### Work Package B: `distribute_fees`
Permissionless 24-hour crank that:
- Claims quote fees from the honorary position
- Distributes fees to investors pro-rata based on still-locked tokens (via Streamflow)
- Routes remainder to creator wallet after final page
- Supports pagination for large investor sets
- Enforces 24h time gate, daily caps, and dust handling

---

## Quick Start

### Prerequisites

- **Rust:** 1.75+
- **Solana CLI:** 1.18+
- **Anchor CLI:** 0.31.1
- **Node.js:** 18+ (for tests)

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/meteora-dlmm-fee-routing
cd meteora-dlmm-fee-routing

# Install dependencies
npm install

# Build program
anchor build

# Run unit tests
cargo test --manifest-path programs/fee-routing/Cargo.toml --lib

# Run integration tests (requires local validator with cloned programs)
anchor test
```

### Build Output

```bash
anchor build
# Output: target/deploy/fee_routing.so
# Program ID: Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

---

## Architecture

### Program Structure

```
programs/fee-routing/
├── src/
│   ├── lib.rs                      # Program entrypoint
│   ├── constants.rs                # PDA seeds and constants
│   ├── errors.rs                   # Error definitions
│   ├── events.rs                   # Event emissions
│   ├── meteora.rs                  # Meteora CP-AMM CPI wrappers
│   ├── instructions/
│   │   ├── mod.rs
│   │   ├── initialize_position.rs  # Create honorary position
│   │   └── distribute_fees.rs      # 24h distribution crank
│   ├── state/
│   │   ├── mod.rs
│   │   ├── policy.rs               # Fee distribution policy
│   │   └── progress.rs             # Daily tracking state
│   └── math.rs                     # Pro-rata distribution math
```

### PDA Derivations

```rust
// Position owner PDA (owns honorary position NFT)
seeds = [b"vault", vault.key(), b"investor_fee_pos_owner"]

// Policy account (immutable config)
seeds = [b"policy"]

// Progress tracking (mutable daily state)
seeds = [b"progress"]

// Treasury (stores vault address)
seeds = [b"treasury"]
```

### External Program Integration

| Program | ID | Purpose |
|---------|----|----|
| **Meteora CP-AMM** | `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG` | Position creation & fee claiming |
| **Streamflow** | `strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m` | Read locked token amounts |

---

## Instructions

### 1. `initialize_position`

Creates the honorary fee position (quote-only) owned by program PDA.

**Parameters:** None

**Validation:**
- Pool authority matches `HLnpSz9h2S4hiLQ43rnSD9XkcUThA7B8hQMKmDaiTLcC`
- Quote mint is valid (non-default pubkey)
- CP-AMM program ID matches expected value
- Position creation succeeds via CPI

**Example:**

```typescript
await program.methods
  .initializePosition()
  .accounts({
    authority: creator.publicKey,
    positionOwnerPda: positionOwnerPda,
    vault: vault.publicKey,
    positionNftMint: positionNftMint.publicKey,
    positionNftAccount: positionNftAccount,
    position: position,
    pool: pool.publicKey,
    poolAuthority: POOL_AUTHORITY,
    quoteMint: quoteMint.publicKey,
    rent: SYSVAR_RENT_PUBKEY,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    eventAuthority: eventAuthority,
    cpAmmProgram: CP_AMM_PROGRAM_ID,
  })
  .signers([creator, positionNftMint])
  .rpc();
```

### 2. `distribute_fees`

Permissionless 24h crank to claim and distribute quote fees.

**Parameters:**
- `page_index: u16` - Current page for pagination (0-indexed)

**Validation:**
- 24h elapsed since last distribution (for page 0)
- Page index matches expected sequence
- Streamflow accounts are valid
- Daily cap not exceeded

**Example:**

```typescript
// Page 0: First page (triggers fee claim)
await program.methods
  .distributeFees(0)
  .accounts({
    caller: anyone.publicKey,
    policy: policyPda,
    progress: progressPda,
    positionOwnerPda: positionOwnerPda,
    vault: vault.publicKey,
    poolAuthority: POOL_AUTHORITY,
    pool: pool.publicKey,
    position: position,
    positionNftAccount: positionNftAccount,
    treasuryTokenA: treasuryTokenA,
    treasuryTokenB: treasuryTokenB,
    poolTokenAVault: poolTokenAVault,
    poolTokenBVault: poolTokenBVault,
    tokenAMint: tokenAMint,
    tokenBMint: tokenBMint,
    tokenAProgram: TOKEN_PROGRAM_ID,
    tokenBProgram: TOKEN_PROGRAM_ID,
    eventAuthority: eventAuthority,
    cpAmmProgram: CP_AMM_PROGRAM_ID,
    creatorAta: creatorAta,
    streamflowProgram: STREAMFLOW_PROGRAM_ID,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .remainingAccounts([
    // Alternating: stream_pubkey, investor_ata
    { pubkey: stream1, isSigner: false, isWritable: false },
    { pubkey: investor1Ata, isSigner: false, isWritable: true },
    { pubkey: stream2, isSigner: false, isWritable: false },
    { pubkey: investor2Ata, isSigner: false, isWritable: true },
    // ... more investors
  ])
  .signers([anyone])
  .rpc();

// Page 1: Next page (same day, continues distribution)
await program.methods
  .distributeFees(1)
  .accounts({ /* same accounts */ })
  .remainingAccounts([
    // Next batch of investors
  ])
  .rpc();
```

---

## Account Tables

### `initialize_position` Accounts

| Account | Type | Mutable | Signer | Description |
|---------|------|---------|--------|-------------|
| `authority` | Signer | ✅ | ✅ | Creator authority |
| `position_owner_pda` | AccountInfo | ❌ | ❌ | PDA that owns position NFT |
| `vault` | AccountInfo | ❌ | ❌ | Vault reference for PDA |
| `position_nft_mint` | Signer | ❌ | ✅ | Position NFT mint (new keypair) |
| `position_nft_account` | AccountInfo | ✅ | ❌ | Position NFT token account |
| `position` | AccountInfo | ✅ | ❌ | Position data account |
| `pool` | AccountInfo | ✅ | ❌ | CP-AMM pool |
| `pool_authority` | AccountInfo | ❌ | ❌ | Pool authority (constant) |
| `quote_mint` | AccountInfo | ❌ | ❌ | Quote token mint |
| `rent` | Sysvar | ❌ | ❌ | Rent sysvar |
| `token_program` | Program | ❌ | ❌ | SPL Token program |
| `system_program` | Program | ❌ | ❌ | System program |
| `event_authority` | AccountInfo | ❌ | ❌ | Meteora event authority |
| `cp_amm_program` | AccountInfo | ❌ | ❌ | Meteora CP-AMM program |

### `distribute_fees` Accounts

| Account | Type | Mutable | Signer | Description |
|---------|------|---------|--------|-------------|
| `caller` | Signer | ❌ | ✅ | Permissionless caller |
| `policy` | Account\<Policy\> | ❌ | ❌ | Fee distribution policy |
| `progress` | Account\<Progress\> | ✅ | ❌ | Daily progress tracking |
| `position_owner_pda` | AccountInfo | ❌ | ❌ | Position owner PDA |
| `vault` | AccountInfo | ❌ | ❌ | Vault reference |
| `pool_authority` | AccountInfo | ❌ | ❌ | Pool authority (constant) |
| `pool` | AccountInfo | ❌ | ❌ | CP-AMM pool |
| `position` | AccountInfo | ✅ | ❌ | Position data account |
| `position_nft_account` | AccountInfo | ❌ | ❌ | Position NFT account |
| `treasury_token_a` | AccountInfo | ✅ | ❌ | Program treasury for token A |
| `treasury_token_b` | AccountInfo | ✅ | ❌ | Program treasury for token B |
| `pool_token_a_vault` | AccountInfo | ✅ | ❌ | Pool token A vault |
| `pool_token_b_vault` | AccountInfo | ✅ | ❌ | Pool token B vault |
| `token_a_mint` | AccountInfo | ❌ | ❌ | Token A mint |
| `token_b_mint` | AccountInfo | ❌ | ❌ | Token B mint (quote) |
| `token_a_program` | AccountInfo | ❌ | ❌ | Token A program |
| `token_b_program` | AccountInfo | ❌ | ❌ | Token B program |
| `event_authority` | AccountInfo | ❌ | ❌ | Meteora event authority |
| `cp_amm_program` | AccountInfo | ❌ | ❌ | Meteora CP-AMM program |
| `creator_ata` | AccountInfo | ✅ | ❌ | Creator quote ATA |
| `streamflow_program` | AccountInfo | ❌ | ❌ | Streamflow program |
| `token_program` | Program | ❌ | ❌ | SPL Token program |

**Remaining Accounts (paged):**
- Alternating pattern: `[stream_pubkey, investor_ata, stream_pubkey, investor_ata, ...]`
- `stream_pubkey`: Streamflow Contract account (read-only)
- `investor_ata`: Investor's quote token account (mutable)

---

## State Accounts

### Policy Account

**Seeds:** `[b"policy"]`

Immutable configuration for fee distribution (set at initialization):

```rust
pub struct Policy {
    pub bump: u8,                       // PDA bump seed
    pub y0: u64,                        // Total investor allocation at TGE
    pub investor_fee_share_bps: u16,   // Max investor share (basis points, 0-10000)
    pub daily_cap_lamports: u64,       // Daily distribution cap (0 = no cap)
    pub min_payout_lamports: u64,      // Minimum payout threshold (dust handling)
    pub quote_mint: Pubkey,            // Quote token mint address
    pub creator_wallet: Pubkey,        // Creator payout destination
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `y0` | u64 | Total tokens streamed to investors at TGE. Used to calculate locked fraction. |
| `investor_fee_share_bps` | u16 | Maximum investor share in basis points (7000 = 70%). Capped by locked fraction. |
| `daily_cap_lamports` | u64 | Maximum tokens distributable per day (0 = unlimited). Excess carries over. |
| `min_payout_lamports` | u64 | Minimum payout threshold. Amounts below this accumulate as dust. |
| `quote_mint` | Pubkey | Quote token mint (token B). Only this token is distributed. |
| `creator_wallet` | Pubkey | Destination for remainder after investor distributions. |

### Progress Account

**Seeds:** `[b"progress"]`

Mutable state tracking daily distribution progress:

```rust
pub struct Progress {
    pub bump: u8,                          // PDA bump seed
    pub last_distribution_ts: i64,         // Last distribution timestamp
    pub current_day: u32,                  // Distribution day counter
    pub daily_distributed_to_investors: u64, // Total distributed today
    pub carry_over_lamports: u64,          // Dust carried from previous distributions
    pub current_page: u16,                 // Current page index
    pub pages_processed_today: u16,        // Pages processed today
    pub creator_payout_sent: bool,         // Creator payout flag
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `last_distribution_ts` | i64 | Unix timestamp of last distribution. Used for 24h gate. |
| `current_day` | u32 | Monotonic day counter. Increments on each new distribution day. |
| `daily_distributed_to_investors` | u64 | Cumulative amount distributed to investors today. |
| `carry_over_lamports` | u64 | Dust from previous distributions (below min threshold or above cap). |
| `current_page` | u16 | Expected next page index. Enforces sequential pagination. |
| `pages_processed_today` | u16 | Total pages processed today. |
| `creator_payout_sent` | bool | True after creator receives remainder. Prevents double-payment. |

---

## Policy Configuration

### Recommended Settings

```rust
// Example: 70% to investors (capped by locked fraction), 30% to creator minimum
Policy {
    y0: 1_000_000_000,              // 1 billion tokens streamed at TGE
    investor_fee_share_bps: 7000,   // 70% max to investors
    daily_cap_lamports: 0,          // No daily cap
    min_payout_lamports: 1_000,     // 1,000 lamports minimum (dust threshold)
    quote_mint: quote_mint_pubkey,
    creator_wallet: creator_pubkey,
}
```

### Parameter Guidelines

**`y0` (Total Investor Allocation):**
- Set to total tokens minted and streamed to investors at TGE
- Used as denominator for locked fraction calculation
- Must match actual Streamflow stream configurations

**`investor_fee_share_bps` (Max Investor Share):**
- Range: 0-10,000 basis points (0% - 100%)
- Typical values: 5,000-8,000 (50%-80%)
- Actual share is `min(investor_fee_share_bps, locked_fraction * 10000)`
- Example: If 50% locked and share is 70%, investors get 50% (locked fraction caps it)

**`daily_cap_lamports` (Daily Cap):**
- Set to 0 for unlimited distribution
- Non-zero enforces daily maximum (excess carries to next day)
- Useful for smoothing distributions over time

**`min_payout_lamports` (Dust Threshold):**
- Payouts below this threshold are skipped and accumulated
- Prevents expensive small transfers
- Dust carries forward to next distribution
- Recommended: 1,000-10,000 lamports depending on token value

---

## Day & Pagination Semantics

### 24-Hour Distribution Window

**Time Gate Rules:**
- First page (`page_index = 0`) requires **24 hours elapsed** since `last_distribution_ts`
- Calling page 0 before 24h elapsed fails with `DistributionWindowNotElapsed`
- Subsequent pages (1, 2, 3, ...) must occur **within same 24h window**
- New day resets: `current_page = 0`, `daily_distributed_to_investors = 0`, `creator_payout_sent = false`

### Pagination Flow

**Single-Page Distribution:**
```
Day 1, T=0:
  distribute_fees(page_index=0)
    → Claims fees
    → Distributes to all investors (fits in one page)
    → Sends remainder to creator
    → Marks creator_payout_sent = true

Day 2, T=24h:
  distribute_fees(page_index=0)
    → Starts new day
    → ...
```

**Multi-Page Distribution:**
```
Day 1, T=0:
  distribute_fees(page_index=0)
    → Claims fees (10,000 tokens)
    → Distributes to investors 0-99 (2,500 tokens)
    → Updates current_page = 1

Day 1, T=0+5min:
  distribute_fees(page_index=1)
    → Distributes to investors 100-199 (2,500 tokens)
    → Updates current_page = 2

Day 1, T=0+10min:
  distribute_fees(page_index=2)
    → Distributes to investors 200-299 (2,500 tokens)
    → Sends remainder to creator (2,500 tokens)
    → Marks creator_payout_sent = true

Day 2, T=24h:
  distribute_fees(page_index=0)
    → Must wait 24h since Day 1 T=0
    → Starts new day
```

### Idempotency & Safety

**Sequential Page Enforcement:**
- Progress tracks `current_page` (expected next page)
- Calling wrong page fails with `InvalidPageIndex`
- Prevents: Skipping pages, replaying pages, out-of-order execution

**Resume After Failure:**
```
Day 1, T=0:
  distribute_fees(0) → Success (current_page = 1)
  distribute_fees(1) → Failure (network error)

Day 1, T=0+5min (retry):
  distribute_fees(1) → Success (resumes from page 1)
```

**No Double-Payment:**
- Each investor appears in exactly one page
- `creator_payout_sent` flag prevents duplicate creator payouts
- Cumulative tracking in `daily_distributed_to_investors`

### Creator Payout

**Final Page Indicator:**
- If no more remaining accounts (all investors processed), send remainder to creator
- Only occurs once per day (guarded by `creator_payout_sent`)
- Remainder = `claimed_fees - daily_distributed_to_investors - carry_over_adjustments`

---

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 6000 | `BaseFeesNotAllowed` | Position must accrue fees in quote mint only. Triggered if base fees detected. |
| 6001 | `DistributionWindowNotElapsed` | Distribution can only be called once per 24 hour window (for page 0). |
| 6002 | `InvalidPageIndex` | Invalid page index for current distribution day. Must match `current_page`. |
| 6003 | `PayoutBelowMinimum` | Investor payout below minimum threshold (internal, informational). |
| 6004 | `DailyCapExceeded` | Daily distribution cap exceeded. Remaining amount carries to next day. |
| 6005 | `ArithmeticOverflow` | Arithmetic overflow in fee calculation. All math uses checked operations. |
| 6006 | `InvalidQuoteMint` | Invalid quote mint provided. Must match pool configuration. |
| 6007 | `LockedExceedsTotal` | Total locked amount exceeds Y0. Data integrity issue with Streamflow. |
| 6008 | `AllPagesProcessed` | All pages for current day already processed. Wait for next 24h window. |
| 6009 | `CreatorPayoutAlreadySent` | Creator payout already sent for this day. Prevents double-payment. |
| 6010 | `InvalidStreamflowAccount` | Invalid Streamflow account provided. Must be owned by Streamflow program. |

---

## Events

All state changes emit events for off-chain tracking and indexing.

### 1. `HonoraryPositionInitialized`

Emitted when honorary position is created.

```rust
pub struct HonoraryPositionInitialized {
    pub position: Pubkey,       // Position account address
    pub owner_pda: Pubkey,       // Position owner PDA
    pub quote_mint: Pubkey,      // Quote token mint
    pub timestamp: i64,          // Unix timestamp
}
```

### 2. `QuoteFeesClaimed`

Emitted when fees are claimed from the honorary position (page 0 only).

```rust
pub struct QuoteFeesClaimed {
    pub position: Pubkey,        // Position account
    pub amount_claimed: u64,     // Claimed quote tokens
    pub day: u32,                // Distribution day
    pub timestamp: i64,          // Unix timestamp
}
```

### 3. `InvestorPayoutPage`

Emitted for each page of investor distributions.

```rust
pub struct InvestorPayoutPage {
    pub day: u32,                  // Distribution day
    pub page_index: u16,           // Page number
    pub investors_paid: u16,       // Count of investors in page
    pub total_paid_this_page: u64, // Total distributed in this page
    pub timestamp: i64,            // Unix timestamp
}
```

### 4. `CreatorPayoutDayClosed`

Emitted when creator receives remainder and day closes.

```rust
pub struct CreatorPayoutDayClosed {
    pub day: u32,                    // Distribution day
    pub creator_amount: u64,         // Amount sent to creator
    pub total_distributed_to_investors: u64, // Total to investors today
    pub timestamp: i64,              // Unix timestamp
}
```

---

## Integration Guide

### Step 1: Deploy Program

```bash
# Build program
anchor build

# Deploy to devnet
solana program deploy target/deploy/fee_routing.so \
  --program-id target/deploy/fee_routing-keypair.json \
  --url devnet

# Verify deployment
solana program show <PROGRAM_ID> --url devnet
```

### Step 2: Initialize Policy Account

Create the Policy PDA with your configuration:

```typescript
const [policyPda] = await PublicKey.findProgramAddress(
  [Buffer.from("policy")],
  program.programId
);

await program.methods
  .initializePolicy({
    y0: new BN(1_000_000_000),           // 1B tokens
    investorFeeShareBps: 7000,           // 70% max
    dailyCapLamports: new BN(0),         // No cap
    minPayoutLamports: new BN(1_000),    // 1K dust threshold
    quoteMint: quoteMint.publicKey,
    creatorWallet: creator.publicKey,
  })
  .accounts({
    authority: creator.publicKey,
    policy: policyPda,
    systemProgram: SystemProgram.programId,
  })
  .signers([creator])
  .rpc();
```

### Step 3: Initialize Progress Account

Create the Progress PDA to track daily state:

```typescript
const [progressPda] = await PublicKey.findProgramAddress(
  [Buffer.from("progress")],
  program.programId
);

await program.methods
  .initializeProgress()
  .accounts({
    authority: creator.publicKey,
    progress: progressPda,
    systemProgram: SystemProgram.programId,
  })
  .signers([creator])
  .rpc();
```

### Step 4: Create Honorary Position

Initialize the quote-only fee position:

```typescript
const positionNftMint = Keypair.generate();
const [positionOwnerPda] = await PublicKey.findProgramAddress(
  [
    Buffer.from("vault"),
    vault.publicKey.toBuffer(),
    Buffer.from("investor_fee_pos_owner"),
  ],
  program.programId
);

// Derive Meteora PDAs
const [position] = await PublicKey.findProgramAddress(
  [Buffer.from("position"), positionNftMint.publicKey.toBuffer()],
  CP_AMM_PROGRAM_ID
);

const [positionNftAccount] = await PublicKey.findProgramAddress(
  [Buffer.from("position_nft_account"), positionNftMint.publicKey.toBuffer()],
  CP_AMM_PROGRAM_ID
);

await program.methods
  .initializePosition()
  .accounts({
    authority: creator.publicKey,
    positionOwnerPda: positionOwnerPda,
    vault: vault.publicKey,
    positionNftMint: positionNftMint.publicKey,
    positionNftAccount: positionNftAccount,
    position: position,
    pool: pool.publicKey,
    poolAuthority: POOL_AUTHORITY,
    quoteMint: quoteMint.publicKey,
    rent: SYSVAR_RENT_PUBKEY,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    eventAuthority: eventAuthority,
    cpAmmProgram: CP_AMM_PROGRAM_ID,
  })
  .signers([creator, positionNftMint])
  .rpc();
```

### Step 5: Setup Distribution Crank

Configure a cron job or keeper bot to call `distribute_fees` every 24 hours:

```typescript
// Pseudo-code for crank bot
async function distributionCrank() {
  const progress = await program.account.progress.fetch(progressPda);
  const now = Date.now() / 1000;

  // Check if 24h elapsed
  if (now < progress.lastDistributionTs + 86400) {
    console.log("24h not elapsed yet");
    return;
  }

  // Fetch all investor streams
  const investors = await fetchInvestorStreams();

  // Paginate (e.g., 50 investors per page)
  const PAGE_SIZE = 50;
  const totalPages = Math.ceil(investors.length / PAGE_SIZE);

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const start = pageIndex * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, investors.length);
    const pageInvestors = investors.slice(start, end);

    // Build remaining accounts
    const remainingAccounts = [];
    for (const inv of pageInvestors) {
      remainingAccounts.push(
        { pubkey: inv.streamPubkey, isSigner: false, isWritable: false },
        { pubkey: inv.ata, isSigner: false, isWritable: true }
      );
    }

    // Execute distribution for this page
    await program.methods
      .distributeFees(pageIndex)
      .accounts({ /* ... all accounts ... */ })
      .remainingAccounts(remainingAccounts)
      .signers([cranker])
      .rpc();

    console.log(`Page ${pageIndex} distributed`);
  }
}

// Run every hour (will only execute if 24h elapsed)
setInterval(distributionCrank, 3600 * 1000);
```

### Step 6: Monitor Events

Listen for events to track distributions:

```typescript
// Subscribe to program events
const listener = program.addEventListener("QuoteFeesClaimed", (event) => {
  console.log(`Fees claimed: ${event.amountClaimed} tokens on day ${event.day}`);
});

const investorListener = program.addEventListener("InvestorPayoutPage", (event) => {
  console.log(`Page ${event.pageIndex}: ${event.investorsPaid} investors paid, total: ${event.totalPaidThisPage}`);
});

const creatorListener = program.addEventListener("CreatorPayoutDayClosed", (event) => {
  console.log(`Day ${event.day} closed: Creator received ${event.creatorAmount} tokens`);
});
```

---

## Testing

### Unit Tests (Rust)

Test the core math module:

```bash
cargo test --manifest-path programs/fee-routing/Cargo.toml --lib
```

**Test Coverage:**
- ✅ `test_locked_fraction_calculation` - Pro-rata locked fraction
- ✅ `test_eligible_share_with_cap` - Investor share capping
- ✅ `test_investor_allocation` - Fee allocation calculation
- ✅ `test_investor_payout` - Individual payouts
- ✅ `test_daily_cap_application` - Daily cap enforcement
- ✅ `test_minimum_threshold` - Dust handling
- ✅ `test_id` - Program ID verification

### Integration Tests (TypeScript)

Test end-to-end flows with Meteora and Streamflow:

```bash
anchor test
```

**Prerequisites:**
- Local validator with cloned programs (configured in `Anchor.toml`)
- Meteora CP-AMM: `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG`
- Streamflow: `strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m`

**Test Scenarios:**
- Position initialization with NFT-based ownership
- Fee claiming via CPI to Meteora DAMM V2
- Pro-rata distribution calculation
- Streamflow locked amount reading
- Pagination and idempotency
- 24-hour time gate enforcement
- Edge cases (all locked, all unlocked, dust, caps)
- Base fee rejection (deterministic failure)

See `TEST_PLAN.md` for detailed test documentation.

---

## Failure Modes

### 1. 24h Time Gate Violation

**Scenario:** Calling `distribute_fees(0)` before 24 hours elapsed.

**Error:** `DistributionWindowNotElapsed`

**Resolution:** Wait until `now >= last_distribution_ts + 86400` seconds.

**Example:**
```
Last distribution: Day 1 at 12:00 PM
Next distribution: Day 2 at 12:00 PM or later
Attempting at Day 2, 11:00 AM → FAILS
```

### 2. Invalid Page Index

**Scenario:** Calling wrong page number or out-of-order pages.

**Error:** `InvalidPageIndex`

**Resolution:** Call pages sequentially starting from 0, within same 24h window.

**Example:**
```
✅ distribute_fees(0) → Success (current_page = 1)
❌ distribute_fees(2) → FAILS (expected page 1)
✅ distribute_fees(1) → Success (current_page = 2)
```

### 3. Base Fees Detected

**Scenario:** Honorary position accrues fees in base token (token A).

**Error:** `BaseFeesNotAllowed`

**Resolution:** Position configuration must guarantee quote-only accrual. This should be caught during `initialize_position` validation.

**Prevention:** Validate pool tick range and token order before initialization.

### 4. Daily Cap Exceeded

**Scenario:** Distribution amount exceeds `daily_cap_lamports`.

**Error:** `DailyCapExceeded`

**Resolution:** Excess amount automatically carries to next day in `carry_over_lamports`. Not a fatal error.

**Example:**
```
Daily cap: 5,000 tokens
Claimed fees: 10,000 tokens
Distributed today: 5,000 tokens
Carry over: 5,000 tokens → Added to next day's distribution
```

### 5. Streamflow Account Ownership Mismatch

**Scenario:** Remaining accounts include non-Streamflow accounts.

**Error:** `InvalidStreamflowAccount`

**Resolution:** Ensure all stream accounts in remaining_accounts are owned by Streamflow program.

**Validation:**
```rust
require!(
    stream_account.owner == &streamflow_sdk::id(),
    FeeRoutingError::InvalidStreamflowAccount
);
```

### 6. Locked Amount Exceeds Y0

**Scenario:** Sum of locked amounts > `y0` (data integrity issue).

**Error:** `LockedExceedsTotal`

**Resolution:** Verify Streamflow configuration matches policy `y0`. This indicates misconfiguration.

### 7. Arithmetic Overflow

**Scenario:** Calculation exceeds u64 maximum.

**Error:** `ArithmeticOverflow`

**Resolution:** All arithmetic uses checked operations. Should never occur with realistic token amounts.

**Protected Operations:**
```rust
amount.checked_mul(bps)
    .and_then(|x| x.checked_div(BPS_DENOMINATOR))
    .ok_or(FeeRoutingError::ArithmeticOverflow)?
```

### 8. Creator Payout Double-Send

**Scenario:** Attempting to send creator payout twice in same day.

**Error:** `CreatorPayoutAlreadySent`

**Resolution:** Flag `creator_payout_sent` prevents duplicate payouts. This is a safety check.

### 9. Transaction Size Limits

**Scenario:** Too many investors in single page, transaction too large.

**Error:** Transaction exceeds size limit (not a program error).

**Resolution:** Reduce page size. Recommended: 30-50 investors per page depending on account sizes.

### 10. Missing Investor ATAs

**Scenario:** Investor quote ATA doesn't exist.

**Error:** Account not found (Solana error).

**Resolution:** Create ATAs before distribution, or skip investor (implementation choice). Current implementation requires ATAs to exist.

---

## Pro-Rata Distribution Formula

### Mathematical Model

```
Given:
  Y0 = Total investor allocation at TGE
  locked_total(t) = Sum of still-locked tokens at time t
  investor_fee_share_bps = Max investor share (e.g., 7000 = 70%)
  claimed_quote = Total quote fees claimed from position

Compute:
  1. Locked fraction (0 to 1):
     f_locked(t) = locked_total(t) / Y0

  2. Eligible investor share (capped, basis points 0-10000):
     eligible_share_bps = min(investor_fee_share_bps, floor(f_locked(t) * 10000))

  3. Total allocated to investors:
     investor_allocation = floor(claimed_quote * eligible_share_bps / 10000)

  4. Per-investor weight:
     weight_i(t) = locked_i(t) / locked_total(t)

  5. Per-investor payout (floor rounding):
     payout_i = floor(investor_allocation * weight_i(t))

     IF payout_i < min_payout_lamports:
       payout_i = 0 (accumulate as dust)

  6. Creator remainder:
     creator_amount = claimed_quote - sum(payout_i)
```

### Example Calculation

```
Policy Configuration:
  Y0 = 1,000,000 tokens
  investor_fee_share_bps = 7000 (70%)
  daily_cap_lamports = 0 (no cap)
  min_payout_lamports = 1,000

Distribution Event:
  claimed_quote = 10,000 tokens

Investor States (from Streamflow):
  Investor A: locked = 200,000
  Investor B: locked = 150,000
  Investor C: locked = 100,000
  locked_total = 450,000

Calculation:
  1. f_locked = 450,000 / 1,000,000 = 0.45 (45%)

  2. eligible_share_bps = min(7000, floor(0.45 * 10000))
                        = min(7000, 4500)
                        = 4500 bps (45%)

  3. investor_allocation = floor(10,000 * 4500 / 10000)
                         = floor(4,500)
                         = 4,500 tokens

  4. Investor weights:
     weight_A = 200,000 / 450,000 = 0.4444 (44.44%)
     weight_B = 150,000 / 450,000 = 0.3333 (33.33%)
     weight_C = 100,000 / 450,000 = 0.2222 (22.22%)

  5. Payouts (floor rounding):
     payout_A = floor(4,500 * 0.4444) = floor(2,000) = 2,000 tokens ✅
     payout_B = floor(4,500 * 0.3333) = floor(1,500) = 1,500 tokens ✅
     payout_C = floor(4,500 * 0.2222) = floor(1,000) = 1,000 tokens ✅

     Total paid = 2,000 + 1,500 + 1,000 = 4,500 tokens

  6. Creator remainder:
     creator_amount = 10,000 - 4,500 = 5,500 tokens

Result:
  Investors receive: 4,500 tokens (45% of claimed fees)
  Creator receives: 5,500 tokens (55% of claimed fees)
```

---

## Constants

```rust
// 24 hours in seconds
pub const DISTRIBUTION_WINDOW_SECONDS: i64 = 86_400;

// 100% in basis points
pub const BPS_DENOMINATOR: u64 = 10_000;

// PDA seeds
pub const VAULT_SEED: &[u8] = b"vault";
pub const INVESTOR_FEE_POS_OWNER_SEED: &[u8] = b"investor_fee_pos_owner";
pub const POLICY_SEED: &[u8] = b"policy";
pub const PROGRESS_SEED: &[u8] = b"progress";
pub const TREASURY_SEED: &[u8] = b"treasury";

// Meteora constants
pub const CP_AMM_PROGRAM_ID: &str = "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG";
pub const POOL_AUTHORITY: &str = "HLnpSz9h2S4hiLQ43rnSD9XkcUThA7B8hQMKmDaiTLcC";

// Streamflow
pub const STREAMFLOW_PROGRAM_ID: &str = "strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m";
```

---

## Security Considerations

1. **Quote-Only Enforcement:** Deterministic validation rejects positions that could accrue base fees.
2. **Checked Arithmetic:** All math operations use checked variants to prevent overflow.
3. **Idempotent Pagination:** Sequential page enforcement prevents double-payment.
4. **PDA Ownership:** All critical accounts use PDAs with deterministic derivation.
5. **Streamflow Validation:** Stream account ownership verified before reading data.
6. **Time Gate:** 24h enforcement prevents rapid draining or manipulation.
7. **Daily Caps:** Optional rate limiting to smooth distributions.

---

## License

MIT

---

## Resources

- **Original Bounty:** [Superteam Earn](https://earn.superteam.fun/listing/build-permissionless-fee-routing-anchor-program-for-meteora-dlmm-v2)
- **Meteora Documentation:** [docs.meteora.ag](https://docs.meteora.ag/)
- **Streamflow Documentation:** [docs.streamflow.finance](https://docs.streamflow.finance/)
- **Anchor Book:** [book.anchor-lang.com](https://book.anchor-lang.com/)
- **Solana Cookbook:** [solanacookbook.com](https://solanacookbook.com/)

---

## Support

For questions or issues:
- **Telegram:** https://t.me/algopapi
- **GitHub Issues:** [Create an issue](https://github.com/your-org/meteora-dlmm-fee-routing/issues)
