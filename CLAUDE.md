# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Permissionless fee routing Anchor program for Meteora DAMM v2 (Constant Product AMM / CP-AMM) pools. Creates an "honorary" NFT-based LP position that accrues fees, then distributes them to investors (pro-rata based on Streamflow locked amounts) via a 24-hour permissionless crank, with remainder going to creators.

**Program ID**: `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS`

**Important Terminology Note:**
- This project is for **Meteora DAMM V2** (also called **CP-AMM** - Constant Product AMM)
- The bounty URL says "dlmm-v2" but that's a typo on the platform
- The actual bounty document clearly states "DAMM V2" throughout
- Always refer to this as DAMM V2 or CP-AMM, NOT DLMM
- Only mention "DLMM" when referencing the original bounty URL

## Build & Test Commands

```bash
# Build the program
anchor build

# Run all tests (requires devnet validator with account clones)
anchor test

# Test with specific Solana validator
anchor test --provider.cluster devnet
```

## Core Architecture

### Two-Instruction Design

1. **`initialize_position`**: Creates NFT-based honorary DAMM v2 position owned by program PDA
2. **`distribute_fees`**: Permissionless 24h crank that claims fees and distributes (supports pagination)

### State Accounts

**Policy** (`seeds = [b"policy"]`):
- Immutable distribution configuration
- Fields: `y0` (total investor allocation at TGE), `investor_fee_share_bps`, `daily_cap_lamports`, `min_payout_lamports`, `quote_mint`, `creator_wallet`

**Progress** (`seeds = [b"progress"]`):
- Daily distribution tracking state (mutable)
- Fields: `last_distribution_ts`, `current_day`, `daily_distributed_to_investors`, `carry_over_lamports`, `current_page`, `creator_payout_sent`

### PDA Seeds

```rust
VAULT_SEED = b"vault"
INVESTOR_FEE_POS_OWNER_SEED = b"investor_fee_pos_owner"
POLICY_SEED = b"policy"
PROGRESS_SEED = b"progress"
TREASURY_SEED = b"treasury"

// Position owner PDA derivation:
[VAULT_SEED, vault.key(), INVESTOR_FEE_POS_OWNER_SEED]
```

## Critical Implementation Requirements

### Quote-Only Enforcement

The honorary position MUST accrue fees exclusively in quote mint. Reject pools that would generate base token fees:
- Validate pool configuration in `initialize_position` preflight
- Check tick range guarantees quote-only accrual
- Fail deterministically before position creation to avoid wasted resources

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

See `bounty-analysis.md` for comprehensive test scenarios. Critical paths:
1. Quote-only validation (reject base fee pools)
2. Pagination idempotency (no double-payment)
3. Pro-rata math accuracy (locked fractions, weights, dust)
4. Edge cases: all tokens unlocked, dust threshold, daily cap enforcement
5. 24h time gate enforcement

## Constants

- `DISTRIBUTION_WINDOW_SECONDS = 86_400` (24 hours)
- `BPS_DENOMINATOR = 10_000` (100% in basis points)

## Development Notes

- Anchor version: 0.30.1
- Rust edition: 2021
- Test runner: ts-mocha with 1000s timeout
- Release profile: overflow checks enabled, LTO fat, single codegen unit
- All arithmetic must use checked operations or explicit overflow handling
- PDA derivations must be deterministic and collision-resistant
