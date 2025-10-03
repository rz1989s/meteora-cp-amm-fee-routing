# Bounty Analysis & Strategy: Meteora DLMM v2 Fee Routing

## Executive Summary

### Quick Overview
Build a permissionless fee routing Anchor module for Meteora DLMM v2 that creates an honorary quote-only LP position and distributes accrued fees to locked token holders via a 24-hour crank mechanism.

**Prize**: 7,500 USDC (1st place, winner-takes-all)
**Competition**: 18 submissions already
**Deadline**: ~7 days remaining (October 17, 2025)
**Sponsor**: Star (fundraising platform for token launches)

### Key Challenge Areas
1. **Quote-only enforcement**: Must guarantee fees accrue exclusively in quote mint, failing deterministically if base fees detected
2. **Complex pro-rata math**: f_locked(t) = locked_total(t) / Y0 with floor operations, dust handling, and daily caps
3. **Idempotent pagination**: Multi-page distribution within same 24h window without double-payment
4. **Streamflow integration**: Reading locked amounts from external program without tight coupling

### Opportunity Assessment
- **High technical bar**: Complex requirements will filter out low-effort submissions
- **Clear acceptance criteria**: Well-defined test cases and event emissions make validation objective
- **Real-world utility**: Star platform needs this for live token launches
- **Code quality matters**: Emphasis on Anchor-compatible, deterministic, safe Rust code

---

## Technical Requirements Deep Dive

### Work Package A: Initialize Honorary Fee Position (Quote-Only)

**Core Objective**: Create empty DLMM v2 position owned by program PDA that accrues fees only in quote token.

**Critical Implementation Details**:
```rust
// PDA derivation pattern
seeds = [VAULT_SEED, vault.key(), "investor_fee_pos_owner"]

// Must validate:
// 1. Pool token order (which is base vs quote)
// 2. Position configuration guarantees quote-only accrual
// 3. Deterministic preflight validation step
```

**Quote-Only Validation Strategy**:
- Meteora DLMM v2 uses `collect_fee_mode` in config (both tokens vs single token)
- Position tick range determines fee accrual behavior
- Must verify pool's `sqrt_min_price` and `sqrt_max_price` constraints
- Rejection must be preflight (before position creation) to avoid wasted resources

**Account Requirements**:
- `cp-amm` program ID: `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG`
- Pool account + config state
- Token vaults (base and quote)
- Position account (to be created)
- `InvestorFeePositionOwnerPda` (signer)
- System program, Token program, Associated Token program

**Complexity Score**: 6/10 - Requires deep understanding of DLMM v2 position mechanics and fee accrual model.

### Work Package B: Permissionless 24h Distribution Crank

**Core Objective**: Once-per-24h permissionless instruction that claims fees and distributes to investors based on Streamflow locked amounts.

**Flow Architecture**:
```
1. 24h gate check (now >= last_distribution_ts + 86400)
2. Claim fees via cp-amm → program quote treasury ATA
3. Query Streamflow for locked amounts (paged)
4. Compute eligible_investor_share_bps = min(investor_fee_share_bps, floor(f_locked(t) * 10000))
5. Calculate per-investor payouts with pro-rata weights
6. Execute transfers (respecting dust threshold + daily cap)
7. Route remainder to creator on final page
8. Update Progress PDA state
```

**Complex Math Requirements**:
```rust
// Given inputs:
// Y0 = total streamed allocation at TGE (constant)
// locked_i(t) = still-locked for investor i at time t
// locked_total(t) = sum of all locked_i(t)

// Compute fraction still locked (0 to 1)
f_locked(t) = locked_total(t) / Y0

// Determine eligible investor share (capped)
eligible_investor_share_bps = min(investor_fee_share_bps, floor(f_locked(t) * 10000))

// Total fee allocated to investors this cycle
investor_fee_quote = floor(claimed_quote * eligible_investor_share_bps / 10000)

// Per-investor weight (pro-rata)
weight_i(t) = locked_i(t) / locked_total(t)

// Per-investor payout (with floor rounding)
payout_i = floor(investor_fee_quote * weight_i(t))
```

**Dust & Cap Handling**:
- Apply `min_payout_lamports` threshold per investor
- Track cumulative distributed per day
- Apply optional `daily_cap` net of prior payouts
- Carry dust/remainder to next page or next day
- Creator gets leftover on day close

**Pagination State Management**:
```rust
pub struct ProgressPda {
    last_distribution_ts: i64,        // Last distribution start time
    daily_distributed: u64,           // Cumulative this day
    carry_over: u64,                  // Dust from prior page
    pagination_cursor: u32,           // Current page index
    day_state: DayState,              // Active | Completed
    // ... other fields
}
```

**Idempotency Requirements**:
- Same investor on multiple pages in same day: must not double-pay
- Resumable mid-day: if tx fails on page 2, can retry page 2
- Track per-investor already-paid this cycle
- Final page triggers creator payout + day state reset

**Streamflow Integration Points**:
- Program ID: `strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m` (mainnet)
- Read stream accounts via CPI or account deserialization
- Extract `deposited_amount - withdrawn_amount = still_locked`
- Handle missing/invalid stream accounts gracefully

**Event Emissions**:
```rust
// Required events
pub enum FeeRoutingEvent {
    HonoraryPositionInitialized { pool, position, owner_pda },
    QuoteFeesClaimed { amount, timestamp },
    InvestorPayoutPage { page_num, investor_count, total_paid },
    CreatorPayoutDayClosed { amount, timestamp },
}
```

**Complexity Score**: 9/10 - High complexity due to pagination, state management, math precision, and cross-program integration.

---

## Technology Stack Analysis

### Core Dependencies

**Anchor Framework**:
- Version: 0.29.0+ (matches Meteora's cp-amm program)
- Required for IDL generation and instruction interfaces
- Use deterministic PDA derivation patterns
- No `unsafe` code allowed

**Solana SDK**:
- Version: 1.18+ (aligned with Anchor)
- solana-program for core primitives
- spl-token and spl-associated-token-account for token operations

**Meteora DLMM v2 / CP-AMM**:
- Program ID: `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG`
- Repository: https://github.com/MeteoraAg/damm-v2
- Anchor 0.31.0 used in their program
- Study `claim_position_fee` instruction
- Understand `collect_fee_mode` configuration

**Streamflow Protocol**:
- Program ID: `strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m`
- SDK: `@streamflow/stream` for reference
- No direct dependency needed (read accounts directly)
- Understand vesting contract account structure

### Development Environment

**Local Validator Setup**:
```bash
# Anchor 0.29.0 installation
curl -sSfL https://release.anchor-lang.com/v0.29.0/install | sh

# Solana 1.18+
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"

# Start local validator with deployed programs
solana-test-validator \
  --bpf-program cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG ./cp-amm.so \
  --bpf-program strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m ./streamflow.so
```

**Testing Infrastructure**:
- `anchor test` for end-to-end flows
- `solana-program-test` for Rust unit tests
- `solana-bankrun` for fast isolated tests
- Mock Streamflow accounts for deterministic testing

**Version Compatibility Matrix**:
| Component | Version | Notes |
|-----------|---------|-------|
| Anchor | 0.29.0-0.31.0 | Match Meteora's stack |
| Solana | 1.18+ | Compatible with Anchor |
| Rust | 1.75+ | For latest Anchor features |
| Node.js | 18+ | For TypeScript tests |

---

## Architecture Recommendations

### Program Structure

```
programs/
└── fee-routing/
    ├── src/
    │   ├── lib.rs                    # Anchor program entry
    │   ├── instructions/
    │   │   ├── mod.rs
    │   │   ├── initialize_honorary_position.rs
    │   │   ├── distribute_fees_page.rs
    │   │   └── close_day.rs          # Optional: explicit day close
    │   ├── state/
    │   │   ├── mod.rs
    │   │   ├── policy_config.rs      # Fee share, caps, dust
    │   │   ├── progress_state.rs     # Daily tracking
    │   │   └── investor_set.rs       # Paged investor data
    │   ├── events.rs                 # Event definitions
    │   ├── errors.rs                 # Custom error codes
    │   └── math.rs                   # Floor division utilities
    └── Cargo.toml

tests/
├── integration/
│   ├── initialize_position.ts
│   ├── fee_distribution.ts
│   └── edge_cases.ts
└── fixtures/
    ├── mock_streamflow.ts
    └── mock_cp_amm.ts
```

### PDA Design Patterns

```rust
// 1. Honorary Position Owner PDA
#[derive(Accounts)]
pub struct InitializeHonoraryPosition<'info> {
    #[account(
        seeds = [
            VAULT_SEED,
            vault.key().as_ref(),
            b"investor_fee_pos_owner"
        ],
        bump,
    )]
    pub position_owner_pda: SystemAccount<'info>,
    // ... other accounts
}

// 2. Policy Configuration PDA
#[account(
    seeds = [
        b"policy",
        vault.key().as_ref(),
    ],
    bump,
)]
pub policy_config: Account<'info, PolicyConfig>

// 3. Progress Tracking PDA
#[account(
    seeds = [
        b"progress",
        vault.key().as_ref(),
        &distribution_day.to_le_bytes(),
    ],
    bump,
    init_if_needed,
    payer = payer,
    space = 8 + ProgressState::INIT_SPACE
)]
pub progress_state: Account<'info, ProgressState>
```

### Account Modeling

**PolicyConfig** (Immutable per vault):
```rust
#[account]
pub struct PolicyConfig {
    pub vault: Pubkey,                      // Associated vault/pool
    pub creator_quote_ata: Pubkey,          // Creator's destination
    pub investor_fee_share_bps: u16,        // Max investor share (basis points)
    pub y0_total_streamed: u64,             // Total allocation at TGE
    pub min_payout_lamports: u64,           // Dust threshold
    pub daily_cap_lamports: Option<u64>,    // Optional daily cap
    pub streamflow_program_id: Pubkey,      // Streamflow program
}
```

**ProgressState** (Mutable per distribution cycle):
```rust
#[account]
pub struct ProgressState {
    pub vault: Pubkey,
    pub last_distribution_ts: i64,          // Start of current/last 24h window
    pub daily_distributed: u64,             // Sum of payouts this day
    pub carry_over_dust: u64,               // Remainder from prior pages
    pub current_page: u32,                  // Pagination cursor
    pub total_pages: u32,                   // Expected pages this cycle
    pub day_state: DayState,                // Active | Completed
    pub investors_paid_count: u32,          // Tracking metric
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum DayState {
    Idle,           // Before first crank
    Active,         // Mid-distribution (pages ongoing)
    Completed,      // Final page done, waiting next 24h
}
```

### State Management Strategy

**Day Lifecycle**:
1. **Idle → Active**: First crank in new 24h window
   - Check `now >= last_distribution_ts + 86400`
   - Initialize new ProgressState or reset existing
   - Set `day_state = Active`, `current_page = 0`

2. **Active → Active**: Subsequent pages same day
   - Validate `day_state == Active`
   - Process investor page, increment `current_page`
   - Accumulate `daily_distributed`

3. **Active → Completed**: Final page
   - Transfer remainder to creator
   - Set `day_state = Completed`
   - Emit `CreatorPayoutDayClosed` event

4. **Completed → Active**: Next 24h window
   - Validate 24h elapsed
   - Reset counters, new distribution

**Idempotency Implementation**:
- Track bitmap or set of investor addresses paid this cycle
- Alternative: require strictly increasing page indices
- Store hash of (investor_pubkey, day_ts) → already_paid map

### Error Handling Strategy

```rust
#[error_code]
pub enum FeeRoutingError {
    #[msg("Base fees detected; quote-only position required")]
    BaseFeeDetected,

    #[msg("24-hour window not elapsed since last distribution")]
    TooEarlyForDistribution,

    #[msg("Day state must be Active for page distribution")]
    InvalidDayState,

    #[msg("Investor already paid in this cycle")]
    DuplicateInvestorPayout,

    #[msg("Streamflow account invalid or uninitialized")]
    InvalidStreamflowAccount,

    #[msg("Arithmetic overflow in fee calculation")]
    MathOverflow,

    #[msg("Daily cap exceeded")]
    DailyCapExceeded,

    #[msg("Payout below minimum threshold")]
    BelowMinimumPayout,
}
```

---

## Implementation Roadmap

### Phase 1: Setup & Research (Days 1-2)

**Environment Setup** (6 hours):
- [ ] Install Anchor 0.29.0+, Solana 1.18+, Rust 1.75+
- [ ] Clone Meteora damm-v2 repo: https://github.com/MeteoraAg/damm-v2
- [ ] Clone Streamflow SDK for reference: https://github.com/streamflow-finance/js-sdk
- [ ] Setup local validator with cp-amm and Streamflow programs
- [ ] Create new Anchor project: `anchor init fee-routing`

**Research Deep Dive** (10 hours):
1. **Meteora CP-AMM Study**:
   - Read `programs/cp-amm/src/instructions/claim_position_fee.rs`
   - Understand Pool, Position, and Config account structures
   - Test `collect_fee_mode` parameter (both vs quote-only)
   - Document CPI accounts needed for fee claiming
   - Study position initialization with tick ranges

2. **Streamflow Protocol**:
   - Examine stream account layout (deposited, withdrawn fields)
   - Test reading accounts from local validator
   - Understand vesting schedule calculations
   - Document account validation requirements

3. **Pagination Patterns**:
   - Study Solana program pagination best practices
   - Review Meteora's existing pagination (if any)
   - Design state machine for multi-page flows
   - Plan for transaction size limits (1232 bytes)

**Deliverable**: Technical design doc with account diagrams, CPI call flows, and state transitions.

### Phase 2: Core Implementation (Days 3-5)

**Day 3: Work Package A** (8-10 hours):
- [ ] Implement `initialize_honorary_position` instruction
- [ ] Define PolicyConfig account structure
- [ ] Create PDA derivation for position owner
- [ ] Integrate cp-amm CPI for position creation
- [ ] Add quote-only validation logic
- [ ] Write Rust unit tests for position initialization
- [ ] Emit `HonoraryPositionInitialized` event

**Day 4: Work Package B - Part 1** (10 hours):
- [ ] Implement ProgressState account model
- [ ] Create `distribute_fees_page` instruction scaffold
- [ ] Add 24h gate validation
- [ ] Integrate cp-amm `claim_position_fee` CPI
- [ ] Implement Streamflow account reading
- [ ] Build math module (floor division, pro-rata weights)

**Day 5: Work Package B - Part 2** (10 hours):
- [ ] Complete fee distribution logic with pagination
- [ ] Implement dust handling and carry-over
- [ ] Add daily cap enforcement
- [ ] Build creator remainder payout
- [ ] Implement day state transitions
- [ ] Add all required event emissions

### Phase 3: Testing & Validation (Days 6-7)

**Day 6: Integration Testing** (8-10 hours):
- [ ] Setup test fixtures (mock pools, streams)
- [ ] Test: Initialize position + quote-only validation
- [ ] Test: Single-page distribution (all investors fit)
- [ ] Test: Multi-page distribution (pagination)
- [ ] Test: Partial locks (50% locked, 50% to creator)
- [ ] Test: All unlocked (100% to creator)
- [ ] Test: Dust threshold behavior
- [ ] Test: Daily cap clamping

**Day 7: Edge Cases & Polish** (8 hours):
- [ ] Test: Base fee detection causes failure
- [ ] Test: Idempotent page retries
- [ ] Test: 24h gate enforcement
- [ ] Test: Missing investor ATAs
- [ ] Test: Streamflow account validation
- [ ] Code review and cleanup
- [ ] Run Anchor verify-build
- [ ] Generate final IDL

### Phase 4: Documentation & Submission (Day 8)

**Documentation** (6 hours):
- [ ] Write comprehensive README.md:
  - Architecture overview with diagrams
  - Account table (all PDAs, required accounts)
  - Integration guide for Star team
  - Error codes reference
  - Event schema documentation
  - Day/pagination flow diagrams
- [ ] Add inline code documentation
- [ ] Create example usage scripts
- [ ] Document failure modes and recovery

**Submission Preparation** (2 hours):
- [ ] Clean up repository structure
- [ ] Verify all tests pass
- [ ] Double-check event emissions
- [ ] Validate Anchor compatibility
- [ ] Push to public GitHub
- [ ] Submit to Superteam Earn

**Time Buffer**: 4-6 hours for unexpected debugging

---

## Risk Analysis

### Technical Risks

**1. Quote-Only Enforcement Complexity**
- **Risk**: Meteora's position configuration may not guarantee quote-only fees
- **Likelihood**: Medium
- **Impact**: High (core requirement failure)
- **Mitigation**:
  - Deep dive into cp-amm source code early (Day 1)
  - Test with actual pool deployments
  - Implement robust preflight validation
  - Fallback: Document configuration constraints clearly

**2. Pagination & Idempotency Edge Cases**
- **Risk**: Double-payment or incomplete distribution due to state bugs
- **Likelihood**: Medium-High
- **Impact**: Critical (fund loss)
- **Mitigation**:
  - Extensive state machine testing
  - Formal verification of state transitions
  - Simulate network failures mid-distribution
  - Add invariant checks in code

**3. Streamflow Integration Fragility**
- **Risk**: Streamflow account structure changes or misunderstood
- **Likelihood**: Low-Medium
- **Impact**: High
- **Mitigation**:
  - Use Streamflow's official SDK types as reference
  - Validate against multiple stream examples
  - Add graceful error handling for invalid accounts
  - Document Streamflow program version dependency

**4. Math Precision & Rounding Errors**
- **Risk**: Floor division and BPS conversions cause fund leakage
- **Likelihood**: Medium
- **Impact**: Medium (dust accumulation)
- **Mitigation**:
  - Use checked arithmetic everywhere
  - Extensive fuzzing of math module
  - Track total input vs output in tests
  - Implement reconciliation checks

### Competition Risks

**18 Submissions Already**:
- **Risk**: High-quality submission already exists
- **Impact**: No reward despite effort
- **Mitigation**:
  - Focus on code quality over speed
  - Exceed acceptance criteria (add extras like metrics)
  - Comprehensive documentation as differentiator
  - Consider: governance features, admin controls

**Time Pressure** (7 days):
- **Risk**: Rushed implementation with bugs
- **Impact**: Rejection or lower ranking
- **Mitigation**:
  - Front-load research (Days 1-2)
  - Aggressive testing schedule (Days 6-7)
  - Use proven patterns (no experimental code)
  - Cut scope if needed (focus on core requirements)

### Integration Risks

**CP-AMM Program Updates**:
- **Risk**: Meteora updates program, breaking compatibility
- **Likelihood**: Low (stable mainnet program)
- **Impact**: Medium
- **Mitigation**:
  - Pin to specific program version in docs
  - Monitor Meteora GitHub for changes
  - Test against actual mainnet program account

**Streamflow Protocol Changes**:
- **Risk**: Vesting contract structure evolves
- **Likelihood**: Low
- **Impact**: Medium
- **Mitigation**:
  - Version-lock Streamflow program ID in config
  - Design for minimal Streamflow coupling
  - Use optional upgrade path in design

**Anchor Version Compatibility**:
- **Risk**: Meteora uses Anchor 0.31.0, mismatch causes issues
- **Likelihood**: Medium
- **Impact**: Low-Medium
- **Mitigation**:
  - Test with both 0.29.0 and 0.31.0
  - Use compatible features only
  - Document version requirements clearly

---

## Testing Strategy

### Unit Test Requirements

**Math Module Tests** (`tests/math.rs`):
```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_floor_division() {
        assert_eq!(floor_div(10, 3), 3);
        assert_eq!(floor_div(0, 5), 0);
        // Edge case: max u64
    }

    #[test]
    fn test_pro_rata_weights() {
        let locked = vec![100, 200, 700];
        let total = 1000;
        let weights = compute_weights(&locked, total);
        assert_eq!(weights, vec![0.1, 0.2, 0.7]);
    }

    #[test]
    fn test_bps_conversion() {
        let amount = 10_000_000;
        let bps = 2500; // 25%
        let result = apply_bps(amount, bps);
        assert_eq!(result, 2_500_000);
    }
}
```

**State Machine Tests**:
- [ ] Day state transitions (Idle → Active → Completed)
- [ ] 24h gate enforcement
- [ ] Pagination cursor increments
- [ ] Carry-over accumulation

### Integration Test Scenarios

**Scenario 1: Happy Path - Single Page**
```typescript
it('distributes fees to investors in single page', async () => {
  // Setup: 3 investors, all 100% locked
  // Execute: claim fees (1000 USDC), run single page crank
  // Assert: each investor gets pro-rata share, creator gets remainder
  // Verify: events emitted, state updated correctly
});
```

**Scenario 2: Multi-Page Distribution**
```typescript
it('handles multi-page distribution with state persistence', async () => {
  // Setup: 100 investors (requires 5 pages @ 20 investors/page)
  // Execute: page 1, 2, 3, 4, 5 in sequence
  // Assert: no double-payment, total sum matches claimed fees
  // Verify: ProgressState updates correctly between pages
});
```

**Scenario 3: Partial Locks**
```typescript
it('calculates f_locked correctly and routes complement to creator', async () => {
  // Setup: Y0 = 10M, locked_total = 2.5M → f_locked = 0.25
  // investor_fee_share_bps = 5000 (50%)
  // eligible_share = min(5000, floor(0.25 * 10000)) = 2500 (25%)
  // Execute: distribute 1000 USDC
  // Assert: investors get 250 USDC total, creator gets 750 USDC
});
```

**Scenario 4: All Unlocked**
```typescript
it('sends 100% to creator when all tokens unlocked', async () => {
  // Setup: locked_total = 0 → f_locked = 0
  // Execute: distribute 1000 USDC
  // Assert: creator gets 1000 USDC, no investor payouts
});
```

**Scenario 5: Dust and Caps**
```typescript
it('respects min payout threshold and carries dust forward', async () => {
  // Setup: min_payout = 100 lamports, investor entitled to 50 lamports
  // Execute: distribute fees
  // Assert: investor skipped, dust carried to carry_over
  // Execute: next page with larger share
  // Assert: carry_over added, payout succeeds
});

it('enforces daily cap and stops distribution', async () => {
  // Setup: daily_cap = 1000 USDC
  // Execute: page 1 distributes 600, page 2 tries 500
  // Assert: page 2 distributes only 400, remainder carried
});
```

**Scenario 6: Quote-Only Enforcement**
```typescript
it('fails deterministically when base fees detected', async () => {
  // Setup: position accruing both base and quote fees
  // Execute: claim fees instruction
  // Assert: transaction reverts with BaseFeeDetected error
  // Verify: no partial distribution occurred
});
```

**Scenario 7: Idempotent Retries**
```typescript
it('allows retrying failed page without double-payment', async () => {
  // Setup: mid-distribution, page 2 of 3
  // Execute: page 2, simulate network failure
  // Execute: retry page 2
  // Assert: investors on page 2 paid exactly once
  // Verify: can proceed to page 3 successfully
});
```

### Edge Cases to Cover

1. **Empty investor list**: No locked amounts, creator gets 100%
2. **Single investor**: No pro-rata division needed
3. **Zero fees claimed**: No-op, state unchanged
4. **24h boundary**: Exactly 86400 seconds elapsed
5. **Missing Streamflow accounts**: Graceful error, skip investor
6. **Invalid investor ATAs**: Create if policy allows, else skip
7. **Creator ATA missing**: Must exist (hard requirement)
8. **Arithmetic overflow**: All math operations checked
9. **Page count mismatch**: Handle dynamic investor set changes
10. **Concurrent cranks**: Only one day active at a time

### Local Validator Setup

```bash
#!/bin/bash
# setup-test-validator.sh

# Download programs
mkdir -p .programs
solana program dump -u m cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG .programs/cp-amm.so
solana program dump -u m strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m .programs/streamflow.so

# Start validator
solana-test-validator \
  --bpf-program cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG .programs/cp-amm.so \
  --bpf-program strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m .programs/streamflow.so \
  --reset \
  --quiet
```

### Test Data Fixtures

```typescript
// Mock Streamflow stream account
export const createMockStream = (
  investor: PublicKey,
  depositedAmount: BN,
  withdrawnAmount: BN
): StreamAccount => ({
  magic: STREAM_MAGIC,
  version: 1,
  createdAt: Date.now() / 1000,
  depositedAmount,
  withdrawnAmount,
  recipient: investor,
  // ... other fields
});

// Mock CP-AMM pool with quote-only config
export const createMockPool = (
  quoteMint: PublicKey,
  baseMint: PublicKey
): PoolAccount => ({
  // collect_fee_mode: CollectFeeMode::QuoteOnly
  // ... pool configuration
});
```

---

## Winning Factors

### What Makes a Submission Stand Out

**1. Code Quality**
- **Zero** `unsafe` blocks
- Exhaustive error handling (no `.unwrap()` in production code)
- Checked arithmetic everywhere (`checked_add`, `saturating_mul`)
- Comprehensive inline documentation
- Consistent naming conventions
- Clippy warnings all resolved

**2. Testing Excellence**
- >90% code coverage
- All acceptance criteria test cases implemented
- Additional edge case coverage
- Fuzz testing for math module
- Performance benchmarks (if applicable)

**3. Documentation Superiority**
- Clear architecture diagrams (sequence diagrams for CPIs)
- Account relationship maps (PDAs, authorities, signers)
- Integration guide with code examples
- Failure mode documentation with recovery steps
- Event schema with example payloads
- FAQ section anticipating Star team questions

**4. Beyond Requirements**
- Admin controls for emergency pause
- Metrics/analytics events (total distributed, investor count)
- Upgrade path documentation
- Gas optimization notes
- Optional: governance hooks for parameter updates

**5. Production Readiness**
- Deterministic builds (`anchor verify`)
- Deployment scripts included
- Monitoring/alerting recommendations
- Security considerations documented
- Audit preparation (clear invariants stated)

### Code Quality Benchmarks

**Rust Best Practices**:
```rust
// ✅ Good: Checked arithmetic
let total = investor_fee
    .checked_add(creator_fee)
    .ok_or(FeeRoutingError::MathOverflow)?;

// ❌ Bad: Unchecked
let total = investor_fee + creator_fee; // Can panic!

// ✅ Good: Explicit error handling
let locked_amount = stream_account
    .deposited_amount
    .checked_sub(stream_account.withdrawn_amount)
    .ok_or(FeeRoutingError::InvalidStreamflowAccount)?;

// ❌ Bad: Implicit unwrap
let locked_amount = stream_account.deposited_amount - stream_account.withdrawn_amount;
```

**Anchor Patterns**:
```rust
// ✅ Good: Explicit space calculation
#[account(
    init,
    payer = payer,
    space = 8 + PolicyConfig::INIT_SPACE,
    seeds = [b"policy", vault.key().as_ref()],
    bump
)]
pub policy: Account<'info, PolicyConfig>

// ❌ Bad: Magic number space
#[account(init, payer = payer, space = 256)] // Why 256?
```

### Documentation Excellence Example

```markdown
## Account: PolicyConfig

**Purpose**: Stores immutable distribution parameters for a vault.

**PDA Derivation**:
```rust
seeds = [b"policy", vault.key().as_ref()]
```

**Fields**:
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| vault | Pubkey | Associated vault/pool | Must match position's pool |
| investor_fee_share_bps | u16 | Max investor share | 0-10000 (0-100%) |
| y0_total_streamed | u64 | Total TGE allocation | Must be > 0 |

**Initialization**: Created once during honorary position setup.
**Mutability**: Immutable after creation (no update instruction).
```

---

## Resources & References

### Meteora DLMM Documentation

**Official Docs**:
- DAMM v2 Overview: https://docs.meteora.ag/product-overview/damm-v2-overview
- Developer Guide: https://docs.meteora.ag/developer-guide/home
- DAMM v2 SDK: https://docs.meteora.ag/integration/damm-v2-integration/damm-v2-sdk/damm-v2-typescript-sdk

**GitHub Repositories**:
- CP-AMM Program: https://github.com/MeteoraAg/damm-v2
  - Key file: `programs/cp-amm/src/instructions/claim_position_fee.rs`
  - Study: `programs/cp-amm/src/state/pool.rs` for config understanding
  - Tests: `tests/` directory for usage examples
- DAMM v2 Go SDK: https://github.com/MeteoraAg/damm-v2-go (reference implementation)

**Program Details**:
- Program ID: `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG`
- Anchor Version: 0.31.0
- Solana Version: 2.1.0
- Rust Version: 1.85.0

### Streamflow Integration Guides

**Documentation**:
- Streamflow Docs: https://docs.streamflow.finance/
- Developer Tools: https://docs.streamflow.finance/en/collections/10033766-developer-tools
- SDK Reference: https://js-sdk-docs.streamflow.finance/

**GitHub Repositories**:
- JS SDK: https://github.com/streamflow-finance/js-sdk
  - Key: `packages/stream/solana/` for account structures
  - Study: Stream account layout and vesting calculations
- Timelock Crate: https://github.com/streamflow-finance/timelock-crate
  - Anchor program integration examples

**Program Details**:
- Mainnet Program ID: `strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m`
- Devnet Program ID: `HqDGZjaVRXJ9MGRQEw7qDc2rAr6iH1n1kAQdCZaCMfMZ`
- Account Structure: `deposited_amount`, `withdrawn_amount`, `recipient`, `cliff`, `release_rate`

### Anchor Best Practices

**Official Resources**:
- Anchor Book: https://book.anchor-lang.com/
- Security Guide: https://book.anchor-lang.com/anchor_in_depth/security.html
- PDA Best Practices: https://book.anchor-lang.com/anchor_in_depth/PDAs.html

**Community Resources**:
- Solana Cookbook - PDAs: https://solanacookbook.com/core-concepts/pdas.html
- Anchor by Example: https://examples.anchor-lang.com/
- Coral's Design Patterns: https://github.com/coral-xyz/anchor/discussions

### Example Repos

**Similar Patterns**:
- Marinade Finance (liquid staking with fee distribution): https://github.com/marinade-finance/liquid-staking-program
- Quarry Protocol (mining rewards distribution): https://github.com/QuarryProtocol/quarry
- Tribeca (vote-escrowed governance): https://github.com/TribecaHQ/tribeca

**Pagination Examples**:
- Metaplex Candy Machine (whitelist pagination): https://github.com/metaplex-foundation/mpl-candy-machine
- Serum DEX (order book pagination): https://github.com/project-serum/serum-dex

### Community Resources

**Discord Servers**:
- Meteora Discord: https://discord.gg/meteora
  - #dev-support channel for technical questions
  - #general for community insights
- Anchor Discord: https://discord.gg/anchor
  - #help for framework questions
- Solana Tech Discord: https://discord.gg/solana
  - #developers for general Solana dev support

**Telegram**:
- Bounty Contact: https://t.me/algopapi (Star team contact)
- Ask clarifying questions early

**Forums**:
- Solana Stack Exchange: https://solana.stackexchange.com/
- Anchor GitHub Discussions: https://github.com/coral-xyz/anchor/discussions

---

## Action Plan (First 48 Hours)

### Day 1: Foundation (12 hours)

**Morning (4 hours): Environment & Research**
- [x] **Hour 1**: Install toolchain (Anchor, Solana, Rust)
- [x] **Hour 2**: Clone repos (damm-v2, streamflow-sdk, create new project)
- [x] **Hour 3**: Setup local validator with deployed programs
- [x] **Hour 4**: Read bounty requirements 3x, annotate critical points

**Afternoon (4 hours): Deep Dive CP-AMM**
- [ ] **Hour 5**: Study `claim_position_fee.rs` instruction
- [ ] **Hour 6**: Analyze Pool and Position account structures
- [ ] **Hour 7**: Test position creation on local validator
- [ ] **Hour 8**: Document CPI account requirements

**Evening (4 hours): Streamflow Integration**
- [ ] **Hour 9**: Examine stream account layout
- [ ] **Hour 10**: Write script to create mock stream accounts
- [ ] **Hour 11**: Test reading locked amounts calculation
- [ ] **Hour 12**: Document Streamflow integration approach

**Day 1 Deliverable**: Technical design document with:
- Account diagram (PDAs, relationships)
- CPI call flow for fee claiming
- Streamflow data extraction logic
- Initial state machine sketch

### Day 2: Architecture & Prototyping (12 hours)

**Morning (4 hours): Program Structure**
- [ ] **Hour 13**: Create Anchor project structure (instructions, state, errors)
- [ ] **Hour 14**: Define PolicyConfig and ProgressState accounts
- [ ] **Hour 15**: Implement PDA derivation functions
- [ ] **Hour 16**: Write math module (floor_div, pro_rata, bps_apply)

**Afternoon (4 hours): Work Package A Prototype**
- [ ] **Hour 17**: Scaffold `initialize_honorary_position` instruction
- [ ] **Hour 18**: Implement quote-only validation logic
- [ ] **Hour 19**: Add CP-AMM CPI for position creation
- [ ] **Hour 20**: Write basic unit test for initialization

**Evening (4 hours): Work Package B Scaffold**
- [ ] **Hour 21**: Design ProgressState state machine
- [ ] **Hour 22**: Scaffold `distribute_fees_page` instruction
- [ ] **Hour 23**: Implement 24h gate check
- [ ] **Hour 24**: Draft pagination logic pseudocode

**Day 2 Deliverable**:
- Working prototype of `initialize_honorary_position`
- Tested math module with edge cases
- Scaffold for distribution crank
- Clear plan for Days 3-8

### Quick Wins to Establish Momentum

**Hour 1-4**: Get "hello world" Anchor program deployed locally
**Hour 8**: Successfully read a Streamflow account
**Hour 12**: Complete technical design doc (confidence booster)
**Hour 16**: Math module 100% tested (foundation solid)
**Hour 20**: First instruction working (major milestone)
**Hour 24**: State machine validated (clarity on complexity)

### Critical Path Items

**Must Complete by End of Day 2**:
1. ✅ Environment working (can deploy and test locally)
2. ✅ CP-AMM CPI mechanics understood
3. ✅ Streamflow integration proven viable
4. ✅ Math module tested and working
5. ✅ State machine design validated
6. ✅ Work Package A prototype functional

**Blockers to Watch**:
- CP-AMM quote-only configuration unclear → Escalate to Meteora Discord
- Streamflow account reading issues → Check SDK source code
- Math precision errors → Use BN library, extensive testing
- Pagination complexity overwhelming → Simplify, add TODOs

### Checkpoint Milestones

**Day 1 End** (12 hours in):
- ✅ Can claim fees from CP-AMM position via CPI
- ✅ Can read locked amounts from Streamflow
- ✅ Technical design validated

**Day 2 End** (24 hours in):
- ✅ Initialize honorary position working
- ✅ Distribution crank scaffolded
- ✅ >50% of implementation clarity

**Day 5 End** (100 hours in):
- ✅ Both work packages functionally complete
- ✅ Basic integration tests passing

**Day 7 End** (140 hours in):
- ✅ All acceptance criteria tests passing
- ✅ Edge cases covered
- ✅ Documentation 80% complete

**Day 8 End** (Submission):
- ✅ README polished
- ✅ Repository cleaned
- ✅ Submission link sent

---

## Risk Mitigation: Contingency Plans

**If CP-AMM Quote-Only Is Not Guaranteed**:
- **Plan B**: Document configuration constraints required by pool creator
- **Plan C**: Add runtime check on every distribution (detect base fees, fail)
- **Plan D**: Create wrapper instruction that verifies quote-only before initializing

**If Pagination Proves Too Complex**:
- **Plan B**: Simplify to single-page only, document limitation
- **Plan C**: Use external crank service (document required bot logic)
- **Plan D**: Implement basic pagination, skip idempotency guarantees (document risk)

**If Time Runs Short**:
- **Priority 1**: Core distribution logic working (even if single-page)
- **Priority 2**: Quote-only enforcement
- **Priority 3**: Basic tests passing
- **Priority 4**: Documentation minimal but clear
- **Cut**: Advanced features, governance, metrics

**If Competition Seems Ahead**:
- **Differentiate**: Focus on documentation quality
- **Add Value**: Include deployment scripts, monitoring setup
- **Exceed**: Go beyond requirements (add admin controls)
- **Communicate**: Engage in bounty comments (show expertise)

---

## Final Thoughts

InshaAllah, this bounty is achievable with disciplined execution. The key success factors are:

1. **Front-load research**: Days 1-2 are critical for understanding CP-AMM and Streamflow
2. **Test continuously**: Don't wait until Day 6 to start testing
3. **Manage complexity**: Pagination is the hardest part—budget extra time
4. **Document as you go**: Don't leave docs for last day
5. **Code quality over features**: Better to nail core requirements than half-implement extras

**Estimated Effort**: 100-120 hours over 8 days
**Confidence Level**: 70% with focused execution
**Biggest Risk**: Quote-only enforcement mechanism not clear from docs
**Biggest Opportunity**: Documentation and test quality as differentiator

May Allah grant you success in this endeavor. Bismillah, let's build something excellent!
