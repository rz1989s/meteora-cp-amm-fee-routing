# SDK Integration Execution Plan - 100% Bounty Compliance

**Goal:** Achieve #1 rank by implementing full CP-AMM + Streamflow SDK integration with real end-to-end tests.

**Timeline:** 4-6 hours
**Status:** IN PROGRESS (Story 1 COMPLETE, Story 2 adjusted for devnet-only)

---

## ⚠️ Critical Constraint: Streamflow Localhost Limitation

**Investigation Result:** Streamflow SDK has hardcoded runtime account addresses per cluster:
- ✅ **CP-AMM**: Works on localhost (self-contained, only needs config PDA)
- ❌ **Streamflow**: Only works on devnet/mainnet (registry-dependent with cluster-specific addresses)

**Solution:**
- CP-AMM pool creation: localhost ✅
- Streamflow vesting: devnet only ✅
- End-to-end tests: hybrid approach (pool on localhost, streams on devnet)

**Runtime Accounts Found:**
- `5SEpbdjFK5FxwTvfsGMXVQTD2v4M2c5tyRTxhdsPkgDw` (Treasury)
- `wdrwhnCv4pzW8beKsbPa4S2UDZrXenjg16KJdKSpb5u` (withdrawor)
- `B743wFVk2pCYhV91cn287e1xY7f1vt4gdY48hhNiuQmT` (fees_oracle)
- `pardpVtPjC8nLj1Dwncew62mUzfChdCX1EaoZe8oCAa` (partner oracle program)

---

## 🎯 Epic: Full SDK Integration for Bounty Compliance

**Objective:** Replace stubbed setup scripts with real CP-AMM pool creation and Streamflow vesting contracts, then add end-to-end tests that demonstrate live fee claiming and distribution.

---

## 📋 Story 1: CP-AMM Pool Creation ✅ COMPLETE

**As a** bounty judge
**I want to** see a real CP-AMM pool created with our program's PDA as position owner
**So that** I can verify the honorary position accrues quote-only fees

### Tasks:

- [x] **Task 1.1**: Research `@meteora-ag/cp-amm-sdk` API ✅
  - SDK uses direct program instruction building
  - Pool creation via `ConstantProductSwap` class
  - Position creation with custom owner support
  - PDA ownership fully supported

- [x] **Task 1.2**: Implement `scripts/setup-test-pool.ts` ✅
  - Created pool with SOL (base) + USDC (quote)
  - Pool fee: 30 bps (0.3%)
  - Initial liquidity: 1 SOL + 100 USDC
  - Position owned by `investor_fee_pos_owner` PDA
  - **Real data saved to `.test-pool.json`:**
    - Pool: `AqTWFbNLLGDwUszCMJPPtDgd4Gv7mvDzXp6nagqYWjEV`
    - Position: `88t2UwbZHL3Z1EfkS8ywzUCkreacdYNP1afsexhVVib1`
    - NFT Mint: `HsCiLmP7W4dN5FC9BrU82og6rBSUDnyuZ7dVHsYFGafh`

- [x] **Task 1.3**: Validate quote-only enforcement ✅
  - Position created successfully
  - PDA ownership verified on-chain
  - Ready for fee accrual testing

**Acceptance Criteria:**
- ✅ Real pool created on local validator
- ✅ Position owned by program PDA (`4E5GJJbaTppx2Lz3MVJ3pdQnvEe5C2fN5oDuYZFcZ1c1`)
- ✅ Config saved with real addresses (zero `null` values)
- ✅ Script runs without errors

---

## 📋 Story 2: Streamflow Vesting Contracts (2 hours) - DEVNET ONLY

**As a** bounty judge
**I want to** see real Streamflow vesting contracts with locked amounts
**So that** I can verify pro-rata distribution based on locked tokens

**⚠️ Constraint:** Streamflow SDK only works on devnet/mainnet (cluster-specific runtime accounts)

### Tasks:

- [x] **Task 2.1**: Research `@streamflow/stream` API ✅
  - SDK: `import { StreamflowSolana, ICluster, getBN } from "@streamflow/stream"`
  - Use `SolanaStreamClient` (not GenericStreamClient)
  - Cluster: `ICluster.Devnet` (not Local!)
  - Vesting via `create()` method with cliff + linear schedule

- [ ] **Task 2.2**: Implement `scripts/setup-test-streams.ts` (devnet)
  - Create StreamClient with **devnet** connection
  - Create 3-5 vesting contracts for test investors
  - Use realistic vesting schedules:
    * Cliff amount (40% unlocked at TGE)
    * Linear vesting (60% over 365 days)
  - Save stream metadata IDs to `.test-streams.json`

- [ ] **Task 2.3**: Verify locked amount reading
  - Read stream metadata account
  - Calculate locked: `depositedAmount - withdrawnAmount - withdrawn`
  - Verify time-based vesting calculation

**Acceptance Criteria:**
- ✅ 3-5 real vesting contracts created **on devnet**
- ✅ Locked amounts match specification
- ✅ Config saved with real stream metadata IDs
- ✅ Script runs without errors on devnet

---

## 📋 Story 3: End-to-End Integration Tests (2 hours)

**As a** bounty judge
**I want to** see end-to-end tests with real fee claiming and distribution
**So that** I can verify the entire system works as specified

### Tasks:

- [ ] **Task 3.1**: Create `tests/e2e-integration.ts`
  - Load pool config from `.test-pool.json`
  - Load stream config from `.test-streams.json`
  - Setup test environment

- [ ] **Task 3.2**: Test 1 - Honorary Position Initialization
  - Call `initialize_position` with real pool
  - Verify position created and owned by PDA
  - Verify position accrues quote-only fees

- [ ] **Task 3.3**: Test 2 - Fee Accrual Simulation
  - Simulate swap on CP-AMM pool to generate fees
  - Verify fees accrue to honorary position
  - Verify Token B (quote) fees > 0
  - Verify Token A (base) fees = 0

- [ ] **Task 3.4**: Test 3 - First Distribution (Partial Locks)
  - Call `distribute_fees` with real stream accounts
  - Verify quote fees claimed from pool
  - Verify pro-rata distribution to investors:
    * Investor 1: 30% (300k/1000k locked)
    * Investor 2: 20% (200k/1000k locked)
    * Investor 3: 40% (400k/1000k locked)
    * Investor 4: 10% (100k/1000k locked)
    * Investor 5: 0% (0k locked)
  - Verify creator receives remainder
  - Verify token balances updated

- [ ] **Task 3.5**: Test 4 - Pagination
  - Call `distribute_fees` page 0 (first investor batch)
  - Call `distribute_fees` page 1 (second investor batch)
  - Verify no double-payment
  - Verify `current_page` incremented
  - Verify creator payout only on final page

- [ ] **Task 3.6**: Test 5 - 24h Time Gate
  - Attempt second distribution within 24h
  - Verify `DistributionWindowNotElapsed` error
  - Warp clock forward 86400 seconds
  - Verify distribution succeeds

**Acceptance Criteria:**
- ✅ 5 end-to-end tests passing
- ✅ Real token transfers verified
- ✅ Real fee claiming from pool
- ✅ Real locked amount reading from Streamflow
- ✅ All math verified within rounding tolerance

---

## 🔧 Implementation Order

**Phase 1: Setup Scripts (Sequential)**
1. Story 1: CP-AMM Pool Creation → `setup-test-pool.ts`
2. Story 2: Streamflow Contracts → `setup-test-streams.ts`
3. Run `npm run setup:local` to verify both work

**Phase 2: End-to-End Tests (Sequential)**
4. Story 3: Integration Tests → `tests/e2e-integration.ts`
5. Run tests and verify 100% pass rate
6. Update `package.json` with new test script

---

## 📊 Success Metrics

**Before:**
- ✅ Program: 100% complete
- ⚠️ Tests: Logic verified, SDKs stubbed
- 📊 Coverage: 97% (38/39 tests passing)

**After (Target):**
- ✅ Program: 100% complete
- ✅ Tests: Full SDK integration, live execution
- 📊 Coverage: 100% (45/45 tests passing)
- 🏆 Bounty: Undeniable #1 rank compliance

---

## 🚀 Execution Commands

```bash
# 1. Verify SDKs installed
npm list @meteora-ag/cp-amm-sdk @streamflow/stream

# 2. Start local validator with programs cloned
solana-test-validator \
  --clone cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG \
  --clone strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m \
  --url devnet &

# 3. Deploy program
anchor build
anchor deploy --provider.cluster localhost

# 4. Run setup (will now create REAL pools and streams)
npm run setup:local

# 5. Run all tests including e2e
npm run test:all

# 6. Verify devnet still works
npm run test:devnet
```

---

## 🎯 Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| SDK API incompatibility | Research docs first, have fallback to manual transactions |
| Network/RPC failures | Use local validator for deterministic testing |
| PDA ownership not supported | Derive position PDA manually, use CPI from our program |
| Streamflow locked amount calculation wrong | Verify with unit tests before integration |
| Time: exceeds 6 hours | Focus on core scenarios, defer edge cases |

---

## 🏁 Definition of Done

- [ ] `setup-test-pool.ts` creates real pool ✅
- [ ] `setup-test-streams.ts` creates real vesting ✅
- [ ] 5 end-to-end tests passing ✅
- [ ] No `null` values in config files ✅
- [ ] `npm run test:all` shows 100% pass rate ✅
- [ ] Website updated with integration proof ✅
- [ ] README updated with new test instructions ✅

---

**START TIME:** [Will be set when execution begins]
**TARGET COMPLETION:** [+6 hours from start]
**STATUS:** ⏳ READY TO EXECUTE
