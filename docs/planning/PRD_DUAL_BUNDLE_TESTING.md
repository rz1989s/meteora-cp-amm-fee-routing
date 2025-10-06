# PRD: Dual-Bundle Testing Strategy Implementation

**Version**: 1.0
**Author**: Development Team
**Date**: October 6, 2025
**Status**: DRAFT - Pending Review

---

## Executive Summary

This PRD outlines the implementation of a comprehensive dual-bundle testing strategy to **exceed Superteam bounty requirements** and demonstrate **production-grade engineering practices**.

### The Opportunity
Current state: 16/16 real tests passing BUT tested on devnet (not local validator)
Bounty requirement: "Tests demonstrating end-to-end flows against cp-amm and Streamflow on a **local validator**" (line 139)

### The Solution
Implement **dual-bundle verification**:
1. **Local Validator Bundle** (Bounty Compliance): 33 tests passing on local validator with full CP-AMM + Streamflow integration
2. **Live Devnet Bundle** (Real-World Proof): 16 tests passing on deployed devnet program with verifiable on-chain transactions

### Value Proposition to Judges
> "We don't just meet requirements - we prove production readiness through dual verification. Most submissions test locally only. We test locally AND prove it works on live devnet."

---

## Business Context & Goals

### Bounty Requirement Analysis

**Line 119**: "Tests (local validator/bankrun)"
**Line 139**: "Tests demonstrating end‑to‑end flows against cp-amm and Streamflow on a local validator"

**Current Gap**:
- ✅ Have 16/16 real tests passing
- ❌ Tests run on devnet, NOT local validator (bounty requirement violation)
- ❌ 17 integration tests stubbed as TODO (not implemented)

### Business Goals

1. **Bounty Compliance**: Meet line 139 requirement (local validator testing)
2. **Competitive Differentiation**: Exceed requirements with dual-bundle strategy
3. **Production Readiness**: Prove program works on live network (not just theory)
4. **Professional Engineering**: Demonstrate systematic approach with comprehensive testing

### Success Metrics

**Primary Metrics**:
- ✅ 33/33 tests passing on local validator (26 TypeScript + 7 Rust)
- ✅ 16/16 tests passing on live devnet (9 TypeScript + 7 Rust)
- ✅ All 17 integration tests fully implemented (zero stubs)
- ✅ 100% test coverage (all logic paths tested)

**Secondary Metrics**:
- ✅ Documentation updated across all files (README, website, docs/)
- ✅ Pitch website showcases dual strategy prominently
- ✅ Two npm scripts: `test:local` and `test:devnet` working independently
- ✅ Setup scripts for reproducible test environment

---

## Current State Analysis

### Existing Test Infrastructure

**Devnet Tests** (5 tests in `tests/devnet-deployment-test.ts`):
```typescript
✅ Should verify program is deployed on devnet
✅ Should initialize Policy account on devnet
✅ Should initialize Progress account on devnet
✅ Should verify Policy account state
✅ Should verify Progress account state
```

**Integration Logic Tests** (4 tests in `tests/program-logic-tests.ts`):
```typescript
✅ Should have BaseFeesNotAllowed error properly defined
✅ Should have DistributionWindowNotElapsed error defined
✅ Should have InvalidPageIndex error defined
✅ Should verify quote-only enforcement in source code
```

**Stubbed Integration Tests** (17 tests in `tests/fee-routing.ts`):
```typescript
⏳ Should initialize honorary position (quote-only)
⏳ Should reject pools with base token fees
⏳ Should enforce 24-hour time gate
⏳ Should calculate pro-rata distribution correctly
⏳ Should handle pagination idempotently
⏳ Should accumulate dust below min_payout threshold
⏳ Should enforce daily cap
⏳ Should send remainder to creator on final page
⏳ Should handle edge case: all tokens unlocked
⏳ Should handle edge case: all tokens locked
⏳ Should emit HonoraryPositionInitialized
⏳ Should emit QuoteFeesClaimed
⏳ Should emit InvestorPayoutPage
⏳ Should emit CreatorPayoutDayClosed
⏳ Should reject invalid page_index
⏳ Should prevent overflow in arithmetic
⏳ Should validate Streamflow account ownership
```

**Rust Unit Tests** (7 tests in `programs/fee-routing/src/lib.rs`):
```rust
✅ test_locked_fraction_calculation
✅ test_eligible_share_with_cap
✅ test_investor_allocation
✅ test_investor_payout
✅ test_daily_cap_application
✅ test_minimum_threshold
✅ test_id
```

### Current Anchor.toml Configuration

**Problem**: Uses devnet URL instead of local validator
```toml
[test.validator]
url = "https://devnet.helius-rpc.com/?api-key=..." # ❌ WRONG

[[test.validator.clone]]
address = "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG"  # CP-AMM
address = "strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m"  # Streamflow
```

---

## Proposed Solution: Dual-Bundle Testing Strategy

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│           DUAL-BUNDLE TESTING ARCHITECTURE              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  BUNDLE 1: LOCAL VALIDATOR (Bounty Compliance)         │
│  ┌────────────────────────────────────────────────┐    │
│  │ npm run test:local                              │    │
│  │                                                  │    │
│  │ • Starts local solana-test-validator            │    │
│  │ • Clones CP-AMM program from devnet             │    │
│  │ • Clones Streamflow program from devnet         │    │
│  │ • Runs setup scripts (pool, streams, tokens)    │    │
│  │ • Executes ALL 26 TypeScript integration tests  │    │
│  │ • Executes 7 Rust unit tests                    │    │
│  │                                                  │    │
│  │ Result: 33/33 tests passing ✅                  │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  BUNDLE 2: LIVE DEVNET (Real-World Proof)              │
│  ┌────────────────────────────────────────────────┐    │
│  │ npm run test:devnet                             │    │
│  │                                                  │    │
│  │ • Connects to Helius devnet RPC                 │    │
│  │ • Tests deployed program: RECt...WP             │    │
│  │ • Verifies Policy & Progress PDAs               │    │
│  │ • Validates account states                      │    │
│  │ • Runs integration logic tests (IDL)            │    │
│  │ • Executes 7 Rust unit tests                    │    │
│  │                                                  │    │
│  │ Result: 16/16 tests passing ✅                  │    │
│  │ Verifiable on Solscan!                          │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Bundle Breakdown

#### Bundle 1: Local Validator Tests (33 tests)

**TypeScript Tests** (26 tests):
- 5 initialization tests (Policy, Progress, Position on local validator)
- 4 integration logic tests (IDL verification, source code validation)
- 17 integration tests (FULLY IMPLEMENTED):
  - Position initialization with quote-only enforcement
  - Base fee rejection (fails if Token A fees detected)
  - 24h time gate enforcement
  - Pro-rata distribution with real Streamflow data
  - Pagination (multi-page distribution)
  - Dust accumulation & carry-over
  - Daily cap enforcement
  - Creator remainder payout
  - Edge cases (all locked/unlocked)
  - Event emissions (4 events)
  - Security validations (3 tests)

**Rust Unit Tests** (7 tests):
- All existing math and validation tests

**Environment**: Local solana-test-validator with cloned programs

#### Bundle 2: Live Devnet Tests (16 tests)

**TypeScript Tests** (9 tests):
- 5 devnet deployment verification tests
- 4 integration logic tests (IDL verification)

**Rust Unit Tests** (7 tests):
- All existing math and validation tests

**Environment**: Live Solana devnet via Helius RPC

### Test Environment Setup Requirements

**For Local Validator Bundle**, we need:

1. **CP-AMM Pool Setup**:
   - Create pool with Token A (base) and Token B (quote - USDC)
   - Add liquidity to pool
   - Initialize NFT position owned by program PDA
   - Generate some trading activity (optional, for fee accrual)

2. **Streamflow Contract Setup**:
   - Create vesting contracts for 3-5 test investors
   - Configure locked/unlocked token amounts
   - Set vesting schedules

3. **Token Setup**:
   - Mint Token A (base token)
   - Mint Token B (quote token - simulated USDC)
   - Fund test wallets
   - Create ATAs for all test accounts

4. **Program Deployment**:
   - Deploy fee-routing program to local validator
   - Initialize Policy PDA
   - Initialize Progress PDA
   - Initialize Position (NFT-based honorary position)

---

## Epic & Stories Breakdown

### Epic: Dual-Bundle Testing Strategy Implementation

**Total Effort**: 11 hours
**Timeline**: 2 days

---

### Story 1: Local Validator Configuration (2 hours)

**Goal**: Configure Anchor to use local validator instead of devnet

**Tasks**:
1. ✅ **Modify Anchor.toml for local validator** (30 min)
   - Remove devnet URL from `[test.validator]`
   - Keep account clones for CP-AMM and Streamflow
   - Configure startup/shutdown wait times
   - Test local validator starts correctly

2. ✅ **Create Anchor.devnet.toml for devnet testing** (30 min)
   - Copy current Anchor.toml
   - Rename to Anchor.devnet.toml
   - Keep devnet URL configuration
   - Test devnet configuration works

3. ✅ **Update npm scripts in package.json** (30 min)
   ```json
   {
     "test:local": "anchor test",
     "test:devnet": "anchor test --config Anchor.devnet.toml"
   }
   ```

4. ✅ **Test both configurations independently** (30 min)
   - Run `npm run test:local` - should start local validator
   - Run `npm run test:devnet` - should connect to devnet
   - Verify no conflicts between configs

**Acceptance Criteria**:
- ✅ `npm run test:local` starts local validator successfully
- ✅ `npm run test:devnet` connects to Helius devnet RPC
- ✅ Both configs work independently without interference
- ✅ Documentation updated with config details

---

### Story 2: Test Environment Setup Scripts (3 hours)

**Goal**: Create automated setup scripts for local test environment

**Tasks**:

1. ✅ **Create `scripts/setup-test-tokens.ts`** (45 min)
   ```typescript
   // Mint Token A (base) and Token B (quote/USDC)
   // Fund test wallets with SOL
   // Create ATAs for all test accounts
   ```
   - Mint 1,000,000 Token A (base)
   - Mint 1,000,000 Token B (quote - simulated USDC)
   - Fund 5 test wallets with 10 SOL each
   - Create ATAs for program PDAs and test wallets

2. ✅ **Create `scripts/setup-test-pool.ts`** (1 hour)
   ```typescript
   // Create CP-AMM pool on local validator
   // Add liquidity
   // Initialize NFT position owned by program PDA
   ```
   - Initialize CP-AMM pool with Token A + Token B
   - Add liquidity: 100,000 Token A + 100,000 Token B
   - Create honorary NFT position owned by `investor_fee_pos_owner` PDA
   - Verify pool state and position ownership

3. ✅ **Create `scripts/setup-test-streams.ts`** (1 hour)
   ```typescript
   // Create Streamflow vesting contracts for test investors
   // Configure locked/unlocked amounts
   ```
   - Create 5 vesting contracts (one per test investor)
   - Investor 1: 300,000 locked / 500,000 total (60% locked)
   - Investor 2: 200,000 locked / 500,000 total (40% locked)
   - Investor 3: 400,000 locked / 500,000 total (80% locked)
   - Investor 4: 100,000 locked / 500,000 total (20% locked)
   - Investor 5: 0 locked / 500,000 total (0% locked)
   - Total Y0: 1,000,000 (matches Policy.y0)

4. ✅ **Create `scripts/run-local-setup.ts`** (15 min)
   ```typescript
   // Master script that runs all setup scripts in order
   // Run before integration tests
   ```
   - Orchestrates execution order
   - Error handling and validation
   - Outputs setup summary

**Acceptance Criteria**:
- ✅ All setup scripts run successfully on local validator
- ✅ CP-AMM pool created with liquidity
- ✅ 5 Streamflow vesting contracts created with correct locked amounts
- ✅ All tokens minted and ATAs created
- ✅ Honorary NFT position owned by program PDA
- ✅ Master script `run-local-setup.ts` executes all steps automatically

---

### Story 3: Integration Test Implementation (4 hours)

**Goal**: Implement all 17 stubbed integration tests in `tests/fee-routing.ts`

**Tasks**:

1. ✅ **Position Initialization Tests (2 tests)** (30 min)
   - Test: "Should initialize honorary position (quote-only)"
     - Create position with quote-only pool
     - Verify position owned by program PDA
     - Verify position config (quote mint only)
   - Test: "Should reject pools with base token fees"
     - Attempt to create position with pool that has base fees
     - Expect BaseFeesNotAllowed error

2. ✅ **Time Gate Test (1 test)** (30 min)
   - Test: "Should enforce 24-hour time gate"
     - Run distribute_fees successfully (day 1)
     - Attempt immediate second distribution
     - Expect DistributionWindowNotElapsed error
     - Advance clock 24h (warp time)
     - Retry distribute_fees - should succeed

3. ✅ **Distribution Logic Tests (2 tests)** (45 min)
   - Test: "Should calculate pro-rata distribution correctly"
     - Setup: 5 investors with varied locked amounts
     - Claim fees from pool (quote tokens only)
     - Execute distribute_fees
     - Verify each investor receives pro-rata share
     - Validate math: payout_i = floor(total * locked_i / locked_total)
   - Test: "Should handle pagination idempotently"
     - Start distribution with page 0
     - Continue with page 1, 2, 3 (multiple calls)
     - Verify no double-payment
     - Verify current_page tracking correct

4. ✅ **Dust & Cap Tests (2 tests)** (30 min)
   - Test: "Should accumulate dust below min_payout threshold"
     - Configure min_payout_lamports = 1000
     - Generate payouts below threshold (e.g., 500 lamports)
     - Verify transfers skipped
     - Verify carry_over_lamports accumulated
   - Test: "Should enforce daily cap"
     - Configure daily_cap_lamports = 50000
     - Generate 100000 in fees
     - Verify only 50000 distributed
     - Verify 50000 carried to next day

5. ✅ **Creator & Edge Case Tests (3 tests)** (45 min)
   - Test: "Should send remainder to creator on final page"
     - Run full distribution
     - Verify investor share calculated correctly
     - Verify remainder = claimed_quote - investor_total
     - Verify creator receives remainder
     - Verify creator_payout_sent flag set
   - Test: "Should handle edge case: all tokens unlocked"
     - Setup: All investors have 0 locked tokens
     - Run distribute_fees
     - Verify 100% goes to creator (no investor share)
   - Test: "Should handle edge case: all tokens locked"
     - Setup: All investors have 100% locked
     - Run distribute_fees
     - Verify full investor_fee_share_bps applied (70%)

6. ✅ **Event Emission Tests (4 tests)** (45 min)
   - Test: "Should emit HonoraryPositionInitialized"
     - Call initialize_position
     - Verify event emitted with correct fields
   - Test: "Should emit QuoteFeesClaimed"
     - Call distribute_fees (page 0)
     - Verify event with claimed amount
   - Test: "Should emit InvestorPayoutPage"
     - Run distribute_fees with payouts
     - Verify event with investor addresses and amounts
   - Test: "Should emit CreatorPayoutDayClosed"
     - Complete distribution (final page)
     - Verify event with creator amount

7. ✅ **Security Validation Tests (3 tests)** (45 min)
   - Test: "Should reject invalid page_index"
     - Attempt page_index = 5 when current_page = 2
     - Expect InvalidPageIndex error
   - Test: "Should prevent overflow in arithmetic"
     - Test with u64::MAX values
     - Verify checked arithmetic prevents overflow
   - Test: "Should validate Streamflow account ownership"
     - Pass invalid stream account (wrong owner)
     - Expect account validation error

**Acceptance Criteria**:
- ✅ All 17 integration tests implemented (no stubs)
- ✅ All tests passing on local validator
- ✅ Tests use real CP-AMM and Streamflow programs (cloned)
- ✅ Event emissions verified
- ✅ Security validations enforced

---

### Story 4: Devnet Bundle Configuration (1 hour)

**Goal**: Configure separate devnet test bundle for real-world verification

**Tasks**:

1. ✅ **Create `tests/devnet-bundle.ts`** (30 min)
   - Import devnet deployment tests (5 tests)
   - Import integration logic tests (4 tests)
   - Configure for Helius devnet RPC
   - Skip local-only tests

2. ✅ **Update npm scripts** (15 min)
   ```json
   {
     "test": "npm run test:local",
     "test:local": "anchor test",
     "test:devnet": "anchor test --config Anchor.devnet.toml tests/devnet-bundle.ts",
     "test:unit": "cargo test --lib"
   }
   ```

3. ✅ **Test devnet bundle independently** (15 min)
   - Run `npm run test:devnet`
   - Verify 9 TypeScript tests pass (5 devnet + 4 logic)
   - Verify connection to live devnet
   - Verify program interaction with deployed contract

**Acceptance Criteria**:
- ✅ `npm run test:devnet` runs 9 TypeScript tests successfully
- ✅ Tests verify deployed program on devnet
- ✅ No interference with local validator tests
- ✅ Documentation updated with both commands

---

### Story 5: Documentation & Pitch Updates (1 hour)

**Goal**: Update all documentation to reflect dual-bundle strategy

**Tasks**:

1. ✅ **Update README.md** (15 min)
   - Add "Dual-Bundle Testing Strategy" section
   - Update test count: 33 local + 16 devnet
   - Add npm script examples
   - Update badges

2. ✅ **Update CLAUDE.md** (15 min)
   - Update "Testing Strategy" section
   - Document both bundles
   - Add setup script documentation

3. ✅ **Update website/app/testing/page.tsx** (20 min)
   - Add "Dual-Bundle Strategy" tab/section
   - Show both test results (33 local + 16 devnet)
   - Add visual comparison table
   - Highlight competitive advantage

4. ✅ **Update docs/reports/FINAL_STATUS.md** (10 min)
   - Update test counts
   - Add dual-bundle achievement section

5. ✅ **Create `docs/reports/DUAL_BUNDLE_IMPLEMENTATION.md`** (10 min)
   - Document implementation details
   - Include setup instructions
   - Add troubleshooting guide

**Acceptance Criteria**:
- ✅ README.md showcases dual-bundle strategy prominently
- ✅ Website testing page highlights 33+16 test achievement
- ✅ All documentation consistent with new test counts
- ✅ Setup instructions clear and reproducible

---

## Technical Requirements

### Environment Setup

**Local Validator Requirements**:
- Solana CLI 1.18.0+
- Anchor 0.31.1
- Node.js 18+
- Rust 1.75.0+
- 8GB RAM minimum (for validator + cloned programs)

**Account Cloning**:
```toml
[[test.validator.clone]]
address = "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG"  # CP-AMM program

[[test.validator.clone]]
address = "strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m"  # Streamflow program
```

### Test Data Configuration

**Policy Configuration** (for tests):
```rust
y0: 1_000_000  // Total investor allocation at TGE
investor_fee_share_bps: 7000  // 70% max to investors
daily_cap_lamports: 0  // No cap (for easier testing)
min_payout_lamports: 1000  // 1000 lamports minimum
quote_mint: <Token B mint>  // Simulated USDC
creator_wallet: <Test wallet>
```

**Test Investors** (Streamflow contracts):
```
Investor 1: 300,000 / 500,000 locked (60%)
Investor 2: 200,000 / 500,000 locked (40%)
Investor 3: 400,000 / 500,000 locked (80%)
Investor 4: 100,000 / 500,000 locked (20%)
Investor 5: 0 / 500,000 locked (0%)
Total Y0: 1,000,000
```

**Pool Configuration**:
```
Token A (base): 100,000 tokens
Token B (quote): 100,000 tokens
Fee tier: 0.3%
Position owner: investor_fee_pos_owner PDA
```

### npm Scripts Overview

```json
{
  "scripts": {
    "test": "npm run test:local",
    "test:local": "anchor test",
    "test:devnet": "anchor test --config Anchor.devnet.toml tests/devnet-bundle.ts",
    "test:unit": "cargo test --lib",
    "test:all": "npm run test:local && npm run test:devnet && npm run test:unit",
    "setup:local": "ts-node scripts/run-local-setup.ts"
  }
}
```

---

## Implementation Timeline

### Day 1 (6 hours)

**Morning** (3 hours):
- ✅ Story 1: Local Validator Configuration (2 hours)
- ✅ Start Story 2: Setup Scripts (1 hour - token setup)

**Afternoon** (3 hours):
- ✅ Continue Story 2: Setup Scripts (2 hours - pool + streams)
- ✅ Start Story 3: Integration Tests (1 hour - position tests)

### Day 2 (5 hours)

**Morning** (3 hours):
- ✅ Continue Story 3: Integration Tests (3 hours - complete all 17 tests)

**Afternoon** (2 hours):
- ✅ Story 4: Devnet Bundle Configuration (1 hour)
- ✅ Story 5: Documentation Updates (1 hour)

**Total**: 11 hours over 2 days

---

## Risks & Mitigations

### Risk 1: CP-AMM Integration Complexity
**Risk Level**: MEDIUM
**Description**: Creating CP-AMM pool programmatically may be complex

**Mitigation**:
- Start with simplest pool configuration
- Use CP-AMM SDK if available
- Clone existing pool account as template
- Fallback: Manual pool creation via UI, clone to local validator

### Risk 2: Streamflow Contract Creation
**Risk Level**: MEDIUM
**Description**: Creating vesting contracts programmatically may require Streamflow SDK

**Mitigation**:
- Review Streamflow documentation for program instructions
- Use Streamflow SDK/CLI if available
- Create contracts on devnet first, then clone accounts
- Fallback: Mock Streamflow data structure (less ideal)

### Risk 3: Time Gate Testing (Clock Manipulation)
**Risk Level**: LOW
**Description**: Testing 24h time gate requires clock manipulation on local validator

**Mitigation**:
- Use `solana-test-validator --warp-slot` for time advancement
- Or use `solana program set-clock` command
- Test with shorter time windows first (1 minute) then scale to 24h
- Ensure Progress.last_distribution_ts updates correctly

### Risk 4: Account Cloning Performance
**Risk Level**: LOW
**Description**: Cloning large programs may slow down validator startup

**Mitigation**:
- Configure adequate startup_wait in Anchor.toml (current: 10000ms)
- Monitor validator logs for clone completion
- Increase timeout if needed (max 30000ms)
- Document expected startup time in README

### Risk 5: Test Data Setup Complexity
**Risk Level**: MEDIUM
**Description**: Setup scripts may fail due to missing dependencies or incorrect sequencing

**Mitigation**:
- Build setup scripts incrementally (tokens → pool → streams)
- Test each script independently before integration
- Add comprehensive error handling and logging
- Create teardown/cleanup script for retry capability
- Document manual setup steps as fallback

---

## Definition of Done

### Functional Requirements ✅

- [ ] **Local validator bundle**: 33/33 tests passing
  - [ ] 26 TypeScript tests (5 init + 4 logic + 17 integration)
  - [ ] 7 Rust unit tests
- [ ] **Devnet bundle**: 16/16 tests passing
  - [ ] 9 TypeScript tests (5 devnet + 4 logic)
  - [ ] 7 Rust unit tests
- [ ] All 17 integration tests fully implemented (zero stubs)
- [ ] Setup scripts working: tokens, pool, streams, master script
- [ ] Both npm scripts functional: `test:local` and `test:devnet`

### Technical Requirements ✅

- [ ] Anchor.toml configured for local validator
- [ ] Anchor.devnet.toml configured for devnet
- [ ] CP-AMM and Streamflow programs cloned successfully
- [ ] Test environment reproducible (setup scripts)
- [ ] No conflicts between local and devnet configs
- [ ] Zero test warnings or errors

### Documentation Requirements ✅

- [ ] README.md updated with dual-bundle strategy section
- [ ] CLAUDE.md testing strategy updated
- [ ] Website testing page showcases both bundles
- [ ] docs/reports/DUAL_BUNDLE_IMPLEMENTATION.md created
- [ ] docs/reports/FINAL_STATUS.md updated
- [ ] Setup script documentation complete
- [ ] All test counts updated consistently (33 local + 16 devnet)

### Quality Requirements ✅

- [ ] All tests pass reliably (not flaky)
- [ ] Test execution time acceptable (<30s for local, <5s for devnet)
- [ ] Code follows project conventions
- [ ] No console.log debugging code left in tests
- [ ] Error messages clear and actionable
- [ ] Git history clean (meaningful commits)

### Acceptance Criteria ✅

- [ ] User can run `npm run test:local` and see 33 tests pass
- [ ] User can run `npm run test:devnet` and see 16 tests pass
- [ ] User can run `npm run setup:local` to prepare test environment
- [ ] Pitch website clearly highlights dual-bundle achievement
- [ ] Documentation provides clear setup instructions
- [ ] No bounty requirement gaps (line 139 fully satisfied)

---

## Success Validation Checklist

Run these commands to validate implementation:

```bash
# 1. Local validator bundle
npm run setup:local        # Setup test environment
npm run test:local         # Should show: 33 passing

# 2. Devnet bundle
npm run test:devnet        # Should show: 16 passing

# 3. Unit tests
npm run test:unit          # Should show: 7 passed

# 4. All tests
npm run test:all           # Runs all three above

# 5. Documentation check
grep -r "33.*tests\|33/33" README.md docs/ website/
grep -r "16.*tests\|16/16" README.md docs/ website/

# 6. Verify no stubs remain
grep -i "TODO\|stub\|not implemented" tests/fee-routing.ts
# Should return: 0 results
```

---

## Post-Implementation Review

### Key Metrics to Measure

1. **Test Coverage**:
   - Local: 33/33 passing ✅
   - Devnet: 16/16 passing ✅
   - Total: 49 test executions (33 + 16, with 7 unit tests counted twice)

2. **Execution Performance**:
   - Local bundle: <30s (acceptable)
   - Devnet bundle: <5s (acceptable)
   - Setup scripts: <60s (acceptable)

3. **Documentation Completeness**:
   - README updated ✅
   - Website updated ✅
   - All docs consistent ✅
   - Setup instructions clear ✅

4. **Competitive Advantage**:
   - Dual-bundle strategy unique ✅
   - Production readiness proven ✅
   - Professional engineering demonstrated ✅

### Lessons Learned (To Document After Implementation)

- What worked well in account cloning?
- Any challenges with CP-AMM integration?
- How reliable are Streamflow contract creation scripts?
- Any performance bottlenecks discovered?
- What would we do differently next time?

---

## Appendix: Bounty Requirement Mapping

### Line-by-Line Compliance

| Bounty Line | Requirement | Current Status | After Implementation |
|-------------|-------------|----------------|---------------------|
| 119 | Tests (local validator/bankrun) | ❌ Testing on devnet | ✅ Local validator bundle |
| 139 | End-to-end flows against cp-amm and Streamflow on local validator | ❌ Not implemented (17 stubs) | ✅ All 17 tests implemented |
| 125 | Dust and cap behavior tested | ✅ Unit tests | ✅ Integration tests added |
| 126 | Base-fee presence causes deterministic failure | ✅ Error defined | ✅ Integration test added |
| 100 | 24h time gate | ✅ Error defined | ✅ Integration test added |
| 72 | Pagination idempotent | ✅ Error defined | ✅ Integration test added |
| 132 | Emit events | ✅ Events defined | ✅ Integration tests verify emissions |

**Verdict**: After implementation, **100% bounty compliance** + **exceeds expectations** with devnet verification

---

## Appendix: Pitch Website Content Preview

### Testing Page - New Section

```markdown
## 🏆 Dual-Bundle Testing Strategy

We don't just meet bounty requirements - we exceed them with **dual verification**:

### Bundle 1: Local Validator (Bounty Compliance)
✅ **33 tests passing** on local solana-test-validator
- Full CP-AMM integration (account cloning from devnet)
- Full Streamflow integration (vesting contracts)
- End-to-end flows: position → fees → distribution
- All edge cases: quote-only, pagination, dust, caps
- Event emissions verified
- Security validations enforced

**Run it yourself**: `npm run test:local`

### Bundle 2: Live Devnet (Real-World Proof)
✅ **16 tests passing** on live Solana devnet
- Deployed program: `RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP`
- Policy PDA: `6YyC75eRsssSnHrRFYpRiyoohCQyLqiHDe6CRje69hzt`
- Progress PDA: `9cumYPtnKQmKsVmTeKguv7h3YWspRoMUQeqgAHMFNXxv`
- **Verifiable on Solscan right now!**

**Run it yourself**: `npm run test:devnet`

### Why This Matters
Most submissions test locally only (meets requirement but unproven).
**We prove BOTH bounty compliance AND production readiness.**

Judges can verify our claims on Solscan immediately - not just theory, but working code on live network.
```

---

## Questions for Review

Before starting implementation, please confirm:

1. ✅ **Scope approval**: Are all 5 stories in scope? Any additions/removals?
2. ✅ **Timeline**: Is 2 days (11 hours) realistic? Need more/less time?
3. ✅ **Risk tolerance**: Comfortable with MEDIUM risks (CP-AMM/Streamflow integration)?
4. ✅ **Setup approach**: Agree with account cloning vs. building from source?
5. ✅ **Documentation priority**: Website pitch content most important?

**Ready to proceed?** Once approved, we'll start with Story 1: Local Validator Configuration.

---

**END OF PRD**
