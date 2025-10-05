# Implementation Tasks - Meteora DAMM V2 Fee Routing

**Status**: In Progress
**Deadline**: October 17, 2025 (~7 days remaining)
**Program ID**: `RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce`

---

## ✅ PHASE 1 RESEARCH COMPLETE

**Research Findings Documented**: `INTEGRATION_GUIDE.md`

### Key Discoveries:
- **Meteora DAMM v2 / CP-AMM**: Use `create_position` for NFT-based positions (corrected from DLMM)
- **Meteora DAMM v2**: Use `claim_position_fee` for fee claiming
- **Streamflow**: Contract struct has no discriminator, use borsh deserialization
- **Streamflow**: Locked amount = `net_amount_deposited - (vested + cliff)`

**External Programs Cloned**:
- `/Users/rz/local-dev/meteora-damm-v2-sdk` (Meteora DAMM v2 / CP-AMM) ✅
- `/Users/rz/local-dev/meteora-dlmm-sdk` (Meteora DLMM - initially cloned by mistake) ❌
- `/Users/rz/local-dev/streamflow-rust-sdk` (Streamflow) ✅

---

## Phase 1: Core Account Structures

### 1.1 PolicyConfig Account ✅ COMPLETE
- [x] Define account structure with required fields
- [x] Implement validation logic
- [x] Add PDA derivation helpers
- [x] Document field constraints

**Fields**:
- `y0: u64` - Total investor allocation at TGE
- `investor_fee_share_bps: u16` - Max investor share (basis points)
- `daily_cap_lamports: u64` - Daily distribution cap (0 = unlimited)
- `min_payout_lamports: u64` - Minimum payout threshold
- `quote_mint: Pubkey` - Quote token mint
- `creator_wallet: Pubkey` - Creator remainder recipient

### 1.2 ProgressState Account ✅ COMPLETE
- [x] Define mutable state structure
- [x] Add initialization logic
- [x] Implement day reset logic
- [x] Add pagination tracking fields

**Fields**:
- `last_distribution_ts: i64` - Last distribution timestamp
- `current_day: u64` - Distribution day counter
- `daily_distributed_to_investors: u64` - Running total for current day
- `carry_over_lamports: u64` - Accumulated dust from previous cycles
- `current_page: u32` - Current pagination index
- `creator_payout_sent: bool` - Flag for final creator payout

---

## Phase 2: Initialize Position Instruction

### 2.1 Account Context Setup ✅ COMPLETE
- [x] Define InitializePosition accounts struct
- [x] Add PDA constraints and seeds
- [x] Validate signer permissions
- [x] Add Meteora CP-AMM program accounts

### 2.2 Quote-Only Validation ✅ COMPLETE
- [x] Research Meteora DAMM v2 pool configuration
- [x] Implement fee distribution strategy (both tokens)
- [x] Add swap logic for quote-only distribution
- [x] Write preflight validation tests

### 2.3 Position Creation via CPI ✅ COMPLETE
- [x] Build CPI call to CP-AMM initialize_position
- [x] Handle position owner PDA signing
- [x] Emit HonoraryPositionInitialized event
- [x] Add error handling

---

## Phase 3: Distribution Math Module

### 3.1 Pro-Rata Calculation Logic ✅ COMPLETE
- [x] Implement locked fraction computation: `f_locked(t) = locked_total(t) / Y0`
- [x] Add eligible share calculation with cap
- [x] Implement per-investor weight calculation
- [x] Add floor rounding for payouts
- [x] Write unit tests for edge cases

### 3.2 Dust and Cap Handling ✅ COMPLETE
- [x] Implement min_payout_lamports threshold check
- [x] Add dust accumulation to carry_over
- [x] Enforce daily_cap_lamports limit
- [x] Calculate excess carryover for next cycle

---

## Phase 4: Distribute Fees Instruction

### 4.1 Account Context Setup ✅ COMPLETE
- [x] Define DistributeFees accounts struct
- [x] Add remaining accounts parser (Streamflow streams + investor ATAs)
- [x] Validate 24-hour time gate
- [x] Add pagination index validation

### 4.2 Fee Claiming ✅ COMPLETE
- [x] Build CPI call to CP-AMM claim_position_fee
- [x] Handle treasury PDA signing
- [x] Emit QuoteFeesClaimed event
- [x] Validate quote token amounts

### 4.3 Distribution Loop ✅ COMPLETE
- [x] Parse remaining accounts (stream, ATA pairs)
- [x] Read locked amounts from Streamflow accounts
- [x] Compute per-investor payouts
- [x] Execute token transfers via CPI
- [x] Track page state for idempotency
- [x] Emit InvestorPayoutPage event

### 4.4 Creator Payout ✅ COMPLETE
- [x] Calculate remainder after investor distribution
- [x] Check creator_payout_sent flag
- [x] Transfer remainder to creator_wallet
- [x] Emit CreatorPayoutDayClosed event
- [x] Reset state for next 24h cycle

---

## Phase 5: Event Definitions

### 5.1 Event Structs ✅ COMPLETE
- [x] HonoraryPositionInitialized
- [x] QuoteFeesClaimed
- [x] InvestorPayoutPage
- [x] CreatorPayoutDayClosed

---

## Phase 6: Error Handling

### 6.1 Custom Error Enum ✅ COMPLETE
- [x] Define FeeRoutingError variants
- [x] Add descriptive error messages
- [x] Map to specific failure scenarios

**Error Cases**:
- InvalidQuoteMint
- BaseTokenFeesDetected
- DistributionTooSoon (24h not elapsed)
- InvalidPageIndex
- DailyCapExceeded
- InsufficientCarryOver
- InvalidStreamflowAccount

---

## Phase 7: Testing

### 7.1 Unit Tests ✅ COMPLETE
- [x] Pro-rata math module tests
- [x] Dust handling edge cases
- [x] Daily cap enforcement
- [x] Locked fraction boundary conditions

### 7.2 Integration Tests ✅ COMPLETE
- [x] Setup test validator with CP-AMM + Streamflow clones
- [x] Happy path: full distribution cycle
- [x] Quote-only validation (reject base fee pools)
- [x] Pagination idempotency tests
- [x] 24-hour time gate enforcement
- [x] Edge case: all tokens unlocked
- [x] Edge case: dust below min_payout
- [x] Edge case: daily cap reached mid-cycle

### 7.3 Test Data Setup ✅ COMPLETE
- [x] Mock Streamflow stream accounts
- [x] Mock DAMM v2 / CP-AMM pool
- [x] Test investor wallets and ATAs
- [x] Mock quote token mints

---

## Phase 8: Build and Deploy

### 8.1 Local Build ✅ COMPLETE
- [x] Run `anchor build`
- [x] Verify program ID matches declared ID
- [x] Check for compilation warnings
- [x] Run clippy for code quality

### 8.2 Test Execution ✅ COMPLETE
- [x] Run `anchor test` with all scenarios
- [x] Verify event emissions
- [x] Check account state transitions
- [x] Validate error handling paths

### 8.3 Devnet Deployment (Optional)
- [ ] Deploy to devnet
- [ ] Test against real CP-AMM pools
- [ ] Verify Streamflow integration
- [ ] Document deployment process

---

## Phase 9: Documentation

### 9.1 Code Documentation ✅ COMPLETE
- [x] Add rustdoc comments to public functions
- [x] Document PDA derivation patterns
- [x] Explain critical math operations
- [x] Add usage examples

### 9.2 Submission Package
- [ ] Update README.md with usage guide
- [ ] Document test execution steps
- [ ] Add architecture diagrams (optional)
- [ ] Prepare bounty submission materials

---

## Critical Path Items (Must Complete)

1. ✅ PolicyConfig + ProgressState accounts
2. ✅ Quote-only validation logic
3. ✅ Pro-rata distribution math
4. ✅ Pagination idempotency
5. ✅ Event emissions
6. ✅ Integration tests
7. ✅ Build verification

---

## Risk Items

- **Meteora CP-AMM Integration**: Need to study their position creation and fee claiming interfaces
- **Streamflow Account Parsing**: Must handle account deserialization correctly
- **Overflow Safety**: All math operations must use checked arithmetic
- **Test Environment**: Need devnet validator with program clones configured

---

## Success Criteria

- [x] Program compiles without errors
- [x] All integration tests pass
- [x] Quote-only validation rejects base fee pools
- [x] Pagination prevents double-payment
- [x] Pro-rata math matches specification
- [x] Events emitted for all state changes
- [ ] Code reviewed and optimized
- [ ] Ready for bounty submission

---

**Last Updated**: 2025-10-03
**Next Review**: After Phase 8.2 completion
