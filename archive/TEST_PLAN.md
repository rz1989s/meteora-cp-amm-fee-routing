# Test Plan - Meteora DAMM V2 Fee Routing

**Last Updated**: October 3, 2025
**Phase**: Phase 3 (Integration Testing)
**Status**: Unit tests passing, integration tests documented

---

## Test Strategy

### Three-Tier Testing Approach

**Tier 1: Unit Tests** ✅ **PASSING**
- Math module functions (checked arithmetic)
- PDA derivation logic
- Account structure validation
- **Status**: 7/7 tests passing
- **Location**: `programs/fee-routing/src/math.rs`

**Tier 2: Integration Tests** 📝 **DOCUMENTED**
- Full instruction flows with mocked programs
- CPI interactions with Meteora and Streamflow
- Event emissions and state transitions
- **Status**: Test cases documented, requires `anchor test`
- **Location**: `tests/fee-routing.ts`

**Tier 3: Devnet Tests** ⏳ **PLANNED**
- Real Meteora DAMM V2 pools
- Real Streamflow streams
- End-to-end distribution cycles
- **Status**: Requires devnet deployment (Phase 4)

---

## Tier 1: Unit Tests (✅ Complete)

### Math Module Tests

**File**: `programs/fee-routing/src/math.rs`

**Running Tests**:
```bash
cd programs/fee-routing
cargo test --lib
```

**Test Cases** (All Passing):

1. **`test_locked_fraction_calculation`**
   - Tests: `locked_total / Y0` calculation
   - Edge cases: 0 locked, 100% locked, overflow prevention
   - Status: ✅ PASS

2. **`test_eligible_share_with_cap`**
   - Tests: `min(locked_fraction_bps, investor_fee_share_bps)`
   - Edge cases: Cap application, full eligibility
   - Status: ✅ PASS

3. **`test_investor_allocation`**
   - Tests: `claimed_quote * eligible_share_bps / 10000`
   - Edge cases: Zero allocation, overflow handling
   - Status: ✅ PASS

4. **`test_investor_payout`**
   - Tests: Pro-rata weight calculation
   - Formula: `floor(allocation * locked_i / locked_total)`
   - Status: ✅ PASS

5. **`test_daily_cap_application`**
   - Tests: Cap enforcement and carryover
   - Edge cases: No cap, partial cap, full cap
   - Status: ✅ PASS

6. **`test_minimum_threshold`**
   - Tests: Dust accumulation below `min_payout_lamports`
   - Verifies carryover logic
   - Status: ✅ PASS

7. **`test_id`**
   - Tests: Program ID matches declared ID
   - Status: ✅ PASS

**Result**: **7/7 tests passing** ✅

---

## Tier 2: Integration Tests (📝 Documented)

### Test Environment Requirements

**Prerequisites**:
- Anchor CLI installed
- Local validator with cloned programs:
  - Meteora CP-AMM: `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG`
  - Streamflow: `strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m`
- Test token mints created
- Mock accounts initialized

**Running Tests**:
```bash
anchor test
# OR for specific cluster:
anchor test --provider.cluster devnet
```

### Test Suite Structure

**File**: `tests/fee-routing.ts`

#### 1. Position Initialization Tests

**Test Case**: `Should initialize honorary position (quote-only)`
- **Setup**:
  - Create mock Meteora pool
  - Generate NFT mint keypair
  - Derive position PDAs
- **Action**: Call `initialize_position`
- **Verify**:
  - Position created with correct PDA
  - NFT minted to program account
  - Event `HonoraryPositionInitialized` emitted
  - Pool authority validation passed

**Test Case**: `Should reject pools with base token fees`
- **Setup**: Mock pool with base token configuration
- **Action**: Attempt `initialize_position`
- **Verify**: Fails with validation error (if applicable)

#### 2. Fee Distribution Tests

**Test Case**: `Should enforce 24-hour time gate`
- **Setup**:
  - Initialize position
  - Set `last_distribution_ts` to current time
- **Action**: Call `distribute_fees` with `page_index=0`
- **Verify**: Fails with `DistributionWindowNotElapsed` error
- **Then**: Advance clock 24 hours, retry → succeeds

**Test Case**: `Should calculate pro-rata distribution correctly`
- **Setup**:
  - Y0 = 1,000,000
  - Create 3 mock Streamflow streams:
    - Investor A: 300,000 locked
    - Investor B: 150,000 locked
    - Investor C: 50,000 locked
  - Total locked = 500,000 (50%)
  - investor_fee_share_bps = 7000 (70%)
  - Claimed fees = 10,000
- **Expected Math**:
  - `f_locked = 500,000 / 1,000,000 = 5000 bps (50%)`
  - `eligible_share = min(5000, 7000) = 5000 bps`
  - `investor_allocation = 10,000 * 5000 / 10000 = 5,000`
  - Investor A: `5,000 * 300,000 / 500,000 = 3,000`
  - Investor B: `5,000 * 150,000 / 500,000 = 1,500`
  - Investor C: `5,000 * 50,000 / 500,000 = 500`
  - Creator: `10,000 - 5,000 = 5,000`
- **Verify**: Actual payouts match expected

**Test Case**: `Should handle pagination idempotently`
- **Setup**:
  - Create 10 investors
  - Call `distribute_fees` page_index=0
- **Action**:
  - Call again with page_index=0 → should fail (InvalidPageIndex)
  - Call with page_index=1 → should succeed
  - Call with page_index=1 again → should fail
- **Verify**: No double-payment occurs

**Test Case**: `Should accumulate dust below min_payout threshold`
- **Setup**:
  - min_payout_lamports = 1000
  - Create investor with locked = 100 (small amount)
  - Claimed fees = 10,000
- **Expected**: Investor payout < 1000 → skip transfer, add to carry_over
- **Verify**: `carry_over_lamports` increased, no transfer made

**Test Case**: `Should enforce daily cap`
- **Setup**:
  - daily_cap_lamports = 5000
  - Claimed fees = 10,000
  - Total locked allows full 10,000 allocation
- **Action**: Call `distribute_fees`
- **Verify**:
  - Only 5,000 distributed
  - 5,000 added to carry_over
  - Event shows capped amount

**Test Case**: `Should send remainder to creator on final page`
- **Setup**:
  - Complete investor distribution
  - Mark as final page
- **Action**: Call `distribute_fees` final page
- **Verify**:
  - Creator receives remainder
  - `creator_payout_sent = true`
  - `CreatorPayoutDayClosed` event emitted

**Test Case**: `Should handle edge case: all tokens unlocked`
- **Setup**:
  - All Streamflow streams fully vested
  - locked_total = 0
- **Expected**:
  - `f_locked = 0`
  - `eligible_share = 0`
  - All fees go to creator (100%)
- **Verify**: Creator receives all claimed fees

**Test Case**: `Should handle edge case: all tokens locked`
- **Setup**:
  - locked_total = Y0 (100% locked)
- **Expected**:
  - `f_locked = 10000 bps (100%)`
  - `eligible_share = min(10000, investor_fee_share_bps)`
  - Maximum investor allocation
- **Verify**: Calculation matches formula

#### 3. Event Emission Tests

**Test Cases**:
- `Should emit HonoraryPositionInitialized` on position creation
- `Should emit QuoteFeesClaimed` on fee claim (page 0)
- `Should emit InvestorPayoutPage` for each distribution page
- `Should emit CreatorPayoutDayClosed` when creator receives remainder

**Verification Method**:
```typescript
const listener = program.addEventListener("EventName", (event) => {
  console.log("Event:", event);
  expect(event.field).to.equal(expectedValue);
});
```

#### 4. Security Tests

**Test Case**: `Should reject invalid page_index`
- Out-of-order pages
- Replay attacks

**Test Case**: `Should prevent overflow in arithmetic`
- Large numbers near u64::MAX
- Checked operations throw errors

**Test Case**: `Should validate Streamflow account ownership`
- Pass non-Streamflow account → fails
- Validates `stream_account.owner == streamflow_sdk::id()`

---

## Tier 3: Devnet Tests (⏳ Planned for Phase 4)

### Prerequisites

- Program deployed to devnet
- Real Meteora DAMM V2 pool with liquidity
- Real Streamflow streams with vesting schedules
- Funded test wallets

### Test Scenarios

1. **End-to-End Distribution Cycle**
   - Create real position in devnet pool
   - Accrue real fees over time
   - Run distribution crank
   - Verify on-chain state

2. **Multi-Day Distribution**
   - Day 1: Partial distribution
   - Day 2: Continue with carried over amount
   - Verify daily cap enforcement across days

3. **Real Streamflow Integration**
   - Query actual Streamflow contracts
   - Calculate locked amounts
   - Verify distribution matches vesting schedules

4. **Gas Optimization**
   - Measure compute units per instruction
   - Optimize if needed
   - Document costs

---

## Current Test Status

### ✅ Completed

- [x] Math module unit tests (7/7 passing)
- [x] Program compiles successfully
- [x] Test file structure created
- [x] Test cases documented

### 📝 In Progress

- [ ] Integration test implementation (requires `anchor test`)
- [ ] Mock account creation helpers
- [ ] Event listener setup

### ⏳ Pending (Phase 4)

- [ ] Devnet deployment
- [ ] Real pool integration testing
- [ ] Real Streamflow stream testing
- [ ] Gas optimization measurements

---

## Running Tests

### Unit Tests (Available Now)

```bash
# Run math module tests
cd programs/fee-routing
cargo test --lib

# Expected output:
# test math::tests::test_locked_fraction_calculation ... ok
# test math::tests::test_eligible_share_with_cap ... ok
# test math::tests::test_investor_allocation ... ok
# test math::tests::test_investor_payout ... ok
# test math::tests::test_daily_cap_application ... ok
# test math::tests::test_minimum_threshold ... ok
# test math::tests::test_id ... ok
#
# test result: ok. 7 passed; 0 failed
```

### Integration Tests (Requires Anchor)

```bash
# Install Anchor CLI first
npm install -g @coral-xyz/anchor-cli

# Run integration tests
anchor test

# Run with specific cluster
anchor test --provider.cluster devnet
```

---

## Test Coverage Goals

### Critical Paths (Must Test)

- [x] **Math Operations**: 100% covered ✅
- [ ] **Position Initialization**: CPI flow documented
- [ ] **Fee Claiming**: Dual-token handling documented
- [ ] **Distribution Logic**: Pro-rata calculation documented
- [ ] **Pagination**: Idempotency documented
- [ ] **Time Gates**: 24h enforcement documented

### Nice to Have

- [ ] Stress tests (many investors)
- [ ] Concurrent distribution attempts
- [ ] Edge case: Empty pool (no fees)
- [ ] Edge case: Paused streams
- [ ] Gas benchmarking

---

## Next Steps for Full Testing

1. **Install Anchor CLI**:
   ```bash
   npm install -g @coral-xyz/anchor-cli
   ```

2. **Run Integration Tests**:
   ```bash
   anchor test
   ```

3. **Fix Any Failing Tests**:
   - Adjust mock data
   - Fix CPI account ordering
   - Handle errors properly

4. **Deploy to Devnet** (Phase 4):
   ```bash
   anchor deploy --provider.cluster devnet
   ```

5. **Run Devnet Tests**:
   - Test with real pools
   - Verify with real streams
   - Document results

---

## Success Criteria

**Phase 3 Complete When**:
- [x] Unit tests passing (7/7) ✅
- [ ] Integration tests documented ✅
- [ ] Test plan complete ✅
- [ ] Anchor test infrastructure ready

**Ready for Phase 4 When**:
- [ ] All integration tests pass with mocks
- [ ] No compilation errors
- [ ] Event emissions verified
- [ ] Edge cases handled

---

**Current Status**: Unit tests passing, integration test framework documented. Ready for `anchor test` execution when Anchor CLI is available.
