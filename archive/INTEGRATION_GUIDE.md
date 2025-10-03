# Integration Guide - External Programs

**Status**: Phase 1 Research Complete ✅ (CORRECTED)
**Date**: October 3, 2025
**Critical Correction Applied**: See CRITICAL_CORRECTION.md

This guide documents the findings from researching Meteora DAMM v2 / CP-AMM and Streamflow program interfaces, and provides step-by-step implementation instructions.

---

## ⚠️ IMPORTANT CORRECTION

**Initial Research Error**: Originally researched DLMM (wrong program)
**Corrected To**: DAMM v2 / CP-AMM (correct program per bounty)
**Impact**: Integration is SIMPLER than originally thought (NFT-based positions)
**Details**: See CRITICAL_CORRECTION.md

---

## Table of Contents

1. [Meteora DAMM v2 Integration](#meteora-damm-v2-integration)
2. [Streamflow Integration](#streamflow-integration)
3. [Implementation Checklist](#implementation-checklist)
4. [Code Examples](#code-examples)

---

## Meteora DAMM v2 Integration

### Program Information

**Program ID**: `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG` ✅
**Program Name**: `cp_amm` (Constant Product AMM)
**Repository**: https://github.com/MeteoraAg/damm-v2-sdk
**IDL Location**: `src/idl/cp_amm.json`
**Documentation**: https://docs.meteora.ag/developer-guide/guides/damm-v2/overview

**Pool Authority**: `HLnpSz9h2S4hiLQ43rnSD9XkcUThA7B8hQMKmDaiTLcC`

### Architecture Overview

**DAMM v2 uses NFT-based position ownership:**
- Each position is represented by an NFT
- Position PDA is derived from NFT mint: `[b"position", nft_mint]`
- Whoever holds the NFT controls the position
- Simpler than DLMM's complex PDA derivation

### Required Instructions

#### 1. Create Position (NFT-Based)

**Instruction**: `create_position`
**Discriminator**: `[48, 215, 197, 153, 96, 203, 180, 133]`

**Accounts**:
```rust
pub struct CreatePosition<'info> {
    /// Owner of the position NFT (can be any account)
    pub owner: AccountInfo<'info>,

    /// NEW keypair - will become the NFT mint
    #[account(mut, signer)]
    pub position_nft_mint: Signer<'info>,

    /// NFT token account PDA
    /// Seeds: [b"position_nft_account", position_nft_mint]
    #[account(
        mut,
        seeds = [b"position_nft_account", position_nft_mint.key().as_ref()],
        bump
    )]
    pub position_nft_account: AccountInfo<'info>,

    /// The CP-AMM pool
    #[account(mut)]
    pub pool: AccountInfo<'info>,

    /// Position data PDA
    /// Seeds: [b"position", position_nft_mint]
    #[account(
        mut,
        seeds = [b"position", position_nft_mint.key().as_ref()],
        bump
    )]
    pub position: AccountInfo<'info>,

    /// Pool authority (constant address)
    /// CHECK: Hardcoded address verified by program
    #[account(address = POOL_AUTHORITY)]
    pub pool_authority: AccountInfo<'info>,

    /// Payer for account creation (can be anyone)
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Token program (Token-2022)
    #[account(address = token_interface::ID)]
    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,

    /// Event authority PDA
    /// Seeds: [b"__event_authority"]
    #[account(seeds = [b"__event_authority"], bump)]
    pub event_authority: AccountInfo<'info>,

    pub program: AccountInfo<'info>,
}
```

**Arguments**: None!

**Process**:
1. Generate new keypair for `position_nft_mint`
2. Call instruction with owner as our program PDA
3. Position NFT is minted to `position_nft_account`
4. Position data stored in position PDA

**For Our Use Case (Honorary Position)**:
```rust
// Generate NFT mint keypair
let nft_mint = Keypair::generate(&mut OsRng);

// Our program PDA will be the owner
let owner = ctx.accounts.position_owner_pda.key();

// Call create_position
// NFT will be minted to account controlled by our program
```

**Quote-Only Configuration**:
- DAMM v2 / CP-AMM pools have both token A and token B
- Position receives fees from both tokens proportionally
- To achieve "quote-only", we need to:
  1. Ensure pool is configured such that one side has minimal activity
  2. OR accept both tokens and swap to quote
  3. OR validate pool token order and only claim quote side

**Key Notes**:
- Much simpler than DLMM (no bin IDs, no width, no complex derivation)
- NFT-based ownership is standard Metaplex pattern
- Position creation has NO parameters (simplified!)
- Single PDA seed makes derivation deterministic

#### 2. Claim Position Fees

**Instruction**: `claim_position_fee`
**Discriminator**: `[180, 38, 154, 17, 133, 33, 162, 211]`

**Accounts**:
```rust
pub struct ClaimPositionFee<'info> {
    /// Pool authority (constant)
    /// CHECK: Hardcoded address
    #[account(address = POOL_AUTHORITY)]
    pub pool_authority: AccountInfo<'info>,

    /// The CP-AMM pool
    pub pool: AccountInfo<'info>,

    /// Position data account
    #[account(mut)]
    pub position: AccountInfo<'info>,

    /// User's token A account (destination)
    #[account(mut)]
    pub token_a_account: AccountInfo<'info>,

    /// User's token B account (destination)
    #[account(mut)]
    pub token_b_account: AccountInfo<'info>,

    /// Pool's token A vault (source)
    #[account(mut)]
    pub token_a_vault: AccountInfo<'info>,

    /// Pool's token B vault (source)
    #[account(mut)]
    pub token_b_vault: AccountInfo<'info>,

    /// Token A mint
    pub token_a_mint: AccountInfo<'info>,

    /// Token B mint
    pub token_b_mint: AccountInfo<'info>,

    /// Position NFT token account (for authority check)
    pub position_nft_account: AccountInfo<'info>,

    /// Owner of the position NFT (must sign)
    pub owner: Signer<'info>,

    /// Token A program
    pub token_a_program: AccountInfo<'info>,

    /// Token B program
    pub token_b_program: AccountInfo<'info>,

    /// Event authority
    #[account(seeds = [b"__event_authority"], bump)]
    pub event_authority: AccountInfo<'info>,

    pub program: AccountInfo<'info>,
}
```

**Arguments**: None!

**Returns**: Fees transferred directly to token_a_account and token_b_account

**Key Notes**:
- Claims fees from BOTH token A and token B
- Much simpler than DLMM (no bin arrays needed)
- Direct transfer to user accounts
- Owner must sign (NFT holder authority)

**For Our Use Case**:
- Token A = base token (ideally 0 fees or minimal)
- Token B = quote token (target for distribution)
- May need to handle both tokens or swap A→B

---

## Streamflow Integration

### Program Information

**Program ID**: `strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m` ✅
**Devnet Program ID**: `HqDGZjaVRXJ9MGRQEw7qDc2rAr6iH1n1kAQdCZaCMfMZ`
**Repository**: https://github.com/streamflow-finance/rust-sdk
**Source**: `programs/streamflow-sdk/src/state.rs`

### Contract Account Structure

**Important**: Stream accounts **DO NOT have an Anchor discriminator**. Must deserialize manually.

```rust
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
#[repr(C)]
pub struct Contract {
    pub magic: u64,                     // Magic bytes for validation
    pub version: u8,                    // Program version
    pub created_at: u64,                // Creation timestamp
    pub amount_withdrawn: u64,          // Total amount withdrawn so far
    pub canceled_at: u64,               // Cancellation timestamp (0 if active)
    pub end_time: u64,                  // Stream end time
    pub last_withdrawn_at: u64,         // Last withdrawal timestamp

    // Key accounts
    pub sender: Pubkey,
    pub sender_tokens: Pubkey,
    pub recipient: Pubkey,
    pub recipient_tokens: Pubkey,
    pub mint: Pubkey,
    pub escrow_tokens: Pubkey,

    // Fee accounts
    pub streamflow_treasury: Pubkey,
    pub streamflow_treasury_tokens: Pubkey,
    pub streamflow_fee_total: u64,
    pub streamflow_fee_withdrawn: u64,
    pub streamflow_fee_percent: f32,

    pub partner: Pubkey,
    pub partner_tokens: Pubkey,
    pub partner_fee_total: u64,
    pub partner_fee_withdrawn: u64,
    pub partner_fee_percent: f32,

    // Vesting parameters
    pub ix: CreateParams,               // Stream configuration
    pub ix_padding: Vec<u8>,

    // State flags
    pub closed: bool,
    pub current_pause_start: u64,
    pub pause_cumulative: u64,
    pub last_rate_change_time: u64,
    pub funds_unlocked_at_last_rate_change: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
#[repr(C)]
pub struct CreateParams {
    pub start_time: u64,
    pub net_amount_deposited: u64,      // CRITICAL: Total deposited
    pub period: u64,                    // Vesting period in seconds
    pub amount_per_period: u64,         // Amount unlocked per period
    pub cliff: u64,                     // Cliff timestamp
    pub cliff_amount: u64,              // Amount unlocked at cliff
    pub cancelable_by_sender: bool,
    pub cancelable_by_recipient: bool,
    pub automatic_withdrawal: bool,
    pub transferable_by_sender: bool,
    pub transferable_by_recipient: bool,
    pub can_topup: bool,
    pub stream_name: [u8; 64],
    pub withdraw_frequency: u64,
    pub ghost: u32,                     // Padding for backwards compat
    pub pausable: bool,
    pub can_update_rate: bool,
}
```

### Key Methods

```rust
impl Contract {
    /// Returns effective start time (considers cliff and rate changes)
    pub fn effective_start_time(&self) -> u64 {
        std::cmp::max(self.last_rate_change_time, self.start_time())
    }

    /// Calculates pause duration
    pub fn pause_time(&self, now: u64) -> u64 {
        if self.current_pause_start > 0 {
            return self.pause_cumulative + now - self.current_pause_start;
        }
        self.pause_cumulative
    }

    /// Amount vested (excluding cliff)
    pub fn vested_available(&self, now: u64) -> u64 {
        let start = self.start_time();
        if self.current_pause_start < start && self.current_pause_start != 0 {
            return 0;
        }
        let effective_stream_duration = now - self.effective_start_time() - self.pause_time(now);
        let effective_periods_passed = effective_stream_duration / self.ix.period;
        let effective_amount_available = effective_periods_passed * self.ix.amount_per_period;

        effective_amount_available + self.funds_unlocked_at_last_rate_change
    }

    /// Amount available at cliff
    pub fn cliff_available(&self, now: u64) -> u64 {
        if self.current_pause_start < self.ix.cliff && self.current_pause_start != 0 {
            return 0;
        }
        if now < self.ix.cliff {
            return 0;
        }
        self.ix.cliff_amount
    }

    /// Total amount available to claim
    pub fn available_to_claim(&self, now: u64, fee_percentage: f32) -> u64 {
        if self.start_time() > now
            || self.ix.net_amount_deposited == 0
            || self.ix.net_amount_deposited == self.amount_withdrawn
        {
            return 0;
        }
        if now >= self.end_time && self.current_pause_start == 0 {
            return self.ix.net_amount_deposited - self.amount_withdrawn;
        }

        let vested_available = self.vested_available(now);
        let cliff_available = self.cliff_available(now);
        (vested_available + cliff_available) - self.amount_withdrawn
    }
}
```

### Calculating Locked Amount

**CRITICAL for Pro-Rata Distribution**:

```rust
/// Calculate amount still locked (not yet vested)
pub fn calculate_locked_amount(contract: &Contract, now: u64) -> u64 {
    let total_unlocked = contract.vested_available(now) + contract.cliff_available(now);
    contract.ix.net_amount_deposited.saturating_sub(total_unlocked)
}
```

**Formula**:
```
locked_amount = net_amount_deposited - (vested_available + cliff_available)
```

**NOT**:
```
❌ locked_amount = net_amount_deposited - amount_withdrawn  // This is remaining, not locked
```

### Deserialization

**Without Discriminator**:
```rust
use borsh::BorshDeserialize;

let stream_data = stream_account.data.borrow();
let contract = Contract::try_from_slice(&stream_data)
    .map_err(|_| ErrorCode::InvalidStreamMetadata)?;
```

**With Anchor**:
```rust
// Streamflow accounts don't have discriminator, use try_from_slice directly
let contract: Contract = borsh::BorshDeserialize::try_from_slice(
    &stream_account.try_borrow_data()?
)?;
```

---

## Implementation Checklist

### Phase 2.1: Add Dependencies

- [ ] Add to `programs/fee-routing/Cargo.toml`:
```toml
[dependencies]
# Existing dependencies...

# Meteora DAMM v2 for CPI calls
# Note: May need to use git dependency or local path
# cp-amm = { git = "https://github.com/MeteoraAg/damm-v2", features = ["cpi"] }

# Streamflow for account deserialization
# streamflow-sdk = { git = "https://github.com/streamflow-finance/rust-sdk", features = ["no-entrypoint"] }

# Borsh for manual deserialization
borsh = "0.10.3"
```

**Alternative**: Copy necessary types into local modules if direct dependency causes conflicts.

### Phase 2.2: Initialize Position Implementation

**File**: `src/instructions/initialize_position.rs`

- [ ] Import Meteora types
- [ ] Update `InitializePosition` accounts struct with NFT-based accounts
- [ ] Generate NFT mint keypair
- [ ] Implement CPI call to `create_position`
- [ ] Store NFT mint pubkey in Policy or separate account
- [ ] Handle errors and edge cases

**Location**: Lines 47-65 (replace TODO)

### Phase 2.3: Fee Claiming Implementation

**File**: `src/instructions/distribute_fees.rs`

- [ ] Import Meteora types
- [ ] Add token A and token B accounts to context
- [ ] Implement CPI call to `claim_position_fee`
- [ ] Handle both token A and token B fees
- [ ] Consider swapping token A to token B (if needed for quote-only)
- [ ] Update event emission with actual amounts

**Location**: Lines 88-108 (replace TODO)

### Phase 2.4: Streamflow Integration

**File**: `src/instructions/distribute_fees.rs`

- [ ] Import Streamflow `Contract` type
- [ ] Implement manual deserialization (no discriminator)
- [ ] Calculate locked amount using vesting logic
- [ ] Validate stream account ownership
- [ ] Handle paused/cancelled streams
- [ ] Add error handling for invalid streams

**Location**: Lines 144-152 (replace TODO)

### Phase 2.5: Testing

- [ ] Write unit tests for locked amount calculation
- [ ] Create integration test with mock DAMM v2 position
- [ ] Create integration test with mock Streamflow streams
- [ ] Test NFT-based position ownership
- [ ] Test edge cases (paused streams, cancelled streams)
- [ ] Test with real programs on devnet

---

## Code Examples

### Example 1: Create NFT-Based Position

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, Mint, TokenAccount};
use crate::constants::*;

pub fn initialize_position_handler(ctx: Context<InitializePosition>) -> Result<()> {
    // Generate new NFT mint keypair (done before calling instruction)
    // let nft_mint = Keypair::generate(&mut OsRng);

    // Our program PDA signs as owner
    let vault_key = ctx.accounts.vault.key();
    let seeds = &[
        VAULT_SEED,
        vault_key.as_ref(),
        INVESTOR_FEE_POS_OWNER_SEED,
        &[ctx.bumps.position_owner_pda],
    ];
    let signer_seeds = &[&seeds[..]];

    // CPI to Meteora DAMM v2 / CP-AMM
    let cpi_program = ctx.accounts.cp_amm_program.to_account_info();
    let cpi_accounts = cp_amm::cpi::accounts::CreatePosition {
        owner: ctx.accounts.position_owner_pda.to_account_info(),
        position_nft_mint: ctx.accounts.position_nft_mint.to_account_info(),
        position_nft_account: ctx.accounts.position_nft_account.to_account_info(),
        pool: ctx.accounts.pool.to_account_info(),
        position: ctx.accounts.position.to_account_info(),
        pool_authority: ctx.accounts.pool_authority.to_account_info(),
        payer: ctx.accounts.authority.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        event_authority: ctx.accounts.event_authority.to_account_info(),
        program: cpi_program.clone(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        cpi_program,
        cpi_accounts,
        signer_seeds,
    );

    // Create position (no arguments!)
    cp_amm::cpi::create_position(cpi_ctx)?;

    // Store NFT mint for later reference
    // (May want to store in Policy or separate account)

    emit!(HonoraryPositionInitialized {
        position: ctx.accounts.position.key(),
        owner_pda: ctx.accounts.position_owner_pda.key(),
        quote_mint: ctx.accounts.quote_mint.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
```

### Example 2: Claim Fees via CPI

```rust
pub fn distribute_fees_handler(
    ctx: Context<DistributeFees>,
    page_index: u16,
) -> Result<()> {
    // ... (time gate logic)

    if page_index == 0 {
        // Claim fees from DAMM v2 position
        let vault_key = ctx.accounts.vault.key();
        let seeds = &[
            VAULT_SEED,
            vault_key.as_ref(),
            INVESTOR_FEE_POS_OWNER_SEED,
            &[ctx.bumps.position_owner_pda],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_program = ctx.accounts.cp_amm_program.to_account_info();
        let cpi_accounts = cp_amm::cpi::accounts::ClaimPositionFee {
            pool_authority: ctx.accounts.pool_authority.to_account_info(),
            pool: ctx.accounts.pool.to_account_info(),
            position: ctx.accounts.position.to_account_info(),
            token_a_account: ctx.accounts.treasury_token_a.to_account_info(),
            token_b_account: ctx.accounts.treasury_token_b.to_account_info(),
            token_a_vault: ctx.accounts.token_a_vault.to_account_info(),
            token_b_vault: ctx.accounts.token_b_vault.to_account_info(),
            token_a_mint: ctx.accounts.token_a_mint.to_account_info(),
            token_b_mint: ctx.accounts.token_b_mint.to_account_info(),
            position_nft_account: ctx.accounts.position_nft_account.to_account_info(),
            owner: ctx.accounts.position_owner_pda.to_account_info(),
            token_a_program: ctx.accounts.token_program.to_account_info(),
            token_b_program: ctx.accounts.token_program.to_account_info(),
            event_authority: ctx.accounts.event_authority.to_account_info(),
            program: cpi_program.clone(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            cpi_program,
            cpi_accounts,
            signer_seeds,
        );

        // Claim fees (no arguments!)
        cp_amm::cpi::claim_position_fee(cpi_ctx)?;

        // Read treasury balances to get claimed amounts
        let token_a_claimed = ctx.accounts.treasury_token_a.amount;
        let token_b_claimed = ctx.accounts.treasury_token_b.amount;

        msg!("Claimed: {} token A, {} token B", token_a_claimed, token_b_claimed);

        // For quote-only distribution, use token B (or swap A→B)
        let claimed_fees = token_b_claimed;

        emit!(QuoteFeesClaimed {
            amount: claimed_fees,
            timestamp: now,
            distribution_day: progress.current_day,
        });
    }

    // ... (rest of distribution logic)
}
```

### Example 3: Read Streamflow Locked Amount

```rust
use borsh::BorshDeserialize;
use streamflow_sdk::state::Contract;

// In distribute_fees handler, when parsing investor accounts
for i in 0..investor_count {
    let stream_account = &remaining_accounts[i * 2];

    // Validate account owner
    require!(
        stream_account.owner == &streamflow_program::ID,
        ErrorCode::InvalidStreamAccount
    );

    // Deserialize without discriminator
    let stream_data = stream_account.try_borrow_data()?;
    let contract = Contract::try_from_slice(&stream_data)
        .map_err(|_| ErrorCode::InvalidStreamMetadata)?;

    // Validate stream is active
    require!(!contract.closed, ErrorCode::StreamClosed);
    require!(contract.canceled_at == 0, ErrorCode::StreamCanceled);

    // Calculate locked amount
    let now = Clock::get()?.unix_timestamp as u64;
    let vested = contract.vested_available(now);
    let cliff = contract.cliff_available(now);
    let total_unlocked = vested + cliff;

    let locked = contract.ix.net_amount_deposited.saturating_sub(total_unlocked);

    locked_amounts.push(locked);
    total_locked = total_locked.checked_add(locked)?;
}
```

---

## Critical Considerations

### 1. Quote-Only Enforcement

**Challenge**: DAMM v2 positions accrue fees in BOTH token A and token B.

**Approaches**:
1. **Accept Both & Swap**: Claim both tokens, swap token A to token B
2. **Pool Selection**: Only use pools where token A is quote, token B is base
3. **Dual Distribution**: Distribute both tokens separately (changes math)
4. **Validation Only**: Verify pool token order, fail if incorrect

**Recommended**: Accept both, swap A→B, then distribute B only.

### 2. NFT Ownership Management

**Challenge**: Position controlled by NFT, not direct PDA.

**Safeguards**:
- Store NFT mint pubkey in Policy or separate account
- Ensure NFT account is program-controlled PDA
- Never transfer NFT out of program control
- Validate NFT ownership on every claim

### 3. Streamflow Account Validation

**Challenge**: No discriminator means any account data could be parsed.

**Safeguards**:
- Verify account owner is Streamflow program
- Check `magic` bytes match expected value
- Validate `version` is supported
- Ensure `mint` matches expected token
- Check account size matches expected

### 4. Program Authority

**Challenge**: Pool authority is hardcoded constant address.

**Solution**:
- Use constant: `HLnpSz9h2S4hiLQ43rnSD9XkcUThA7B8hQMKmDaiTLcC`
- Include in accounts with address constraint
- Do not derive, just validate

---

## Next Steps

1. ✅ Phase 1: Research Complete (Corrected)
2. **Phase 2**: Implement CPI calls (2-4 hours)
   - **Simpler than originally estimated!** (NFT-based is easier)
3. **Phase 3**: Test with mocks (2-3 hours)
4. **Phase 4**: Deploy to devnet and test with real programs (2-3 hours)
5. **Phase 5**: Security audit and optimization (2-3 hours)

---

## References

- **Meteora DAMM v2 SDK**: `/Users/rz/local-dev/meteora-damm-v2-sdk`
- **Meteora IDL**: `/Users/rz/local-dev/meteora-damm-v2-sdk/src/idl/cp_amm.json`
- **Meteora Docs**: https://docs.meteora.ag/developer-guide/guides/damm-v2/overview
- **Streamflow SDK**: `/Users/rz/local-dev/streamflow-rust-sdk`
- **Streamflow State**: `/Users/rz/local-dev/streamflow-rust-sdk/programs/streamflow-sdk/src/state.rs`
- **Correction Details**: `CRITICAL_CORRECTION.md`

---

**Document Version**: 2.0 (Corrected)
**Last Updated**: October 3, 2025
**Status**: Ready for Phase 2 Implementation with DAMM v2 / CP-AMM

**Key Advantage**: NFT-based positions are SIMPLER than DLMM's complex PDA system!
