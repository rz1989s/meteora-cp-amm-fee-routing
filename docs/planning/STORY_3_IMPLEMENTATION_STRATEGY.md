# Story 3: Integration Test Implementation Strategy

**Status**: IN PROGRESS
**Approach**: Path A - Full SDK Integration
**SDKs Installed**: ✅ @meteora-ag/cp-amm-sdk@1.1.5, @streamflow/stream@9.0.2

---

## Reality Check: What's Achievable

### ✅ **What We Can Do** (Realistic for 4 hours):

1. **Install SDKs** ✅ DONE
   - Meteora CP-AMM SDK installed
   - Streamflow SDK installed

2. **Update Test Setup Code**
   - Replace stubbed setup with actual SDK calls
   - Implement pool creation logic using CP-AMM SDK
   - Implement stream creation logic using Streamflow SDK

3. **Implement Test Assertions**
   - Write actual test logic for all 17 tests
   - Use real program calls to our fee-routing program
   - Verify state changes, events, errors

4. **Document Prerequisites**
   - Create helper script to start validator with cloned programs
   - Document how to run tests
   - Clear instructions for bounty judges

### ❌ **What We Cannot Do** (Outside 4-hour scope):

1. **Build External Programs from Source**
   - CP-AMM source build = 2-4 hours
   - Streamflow source build = 2-4 hours
   - Out of scope for this story

2. **Deploy Programs to Localhost**
   - Manual deployment complex
   - Requires program build artifacts
   - Better to use --clone approach

---

## Implementation Strategy

### Phase 1: Create Validator Helper Script (15 min)

Create `scripts/start-test-validator.sh`:
```bash
#!/bin/bash
# Starts local validator with CP-AMM and Streamflow programs cloned from devnet

solana-test-validator \
  --clone cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG \
  --clone strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m \
  --url https://devnet.helius-rpc.com/?api-key=... \
  --reset
```

### Phase 2: Update Integration Tests (3 hours)

**File**: `tests/fee-routing.ts`

For each test category:

**Position Tests (2 tests - 30 min)**:
- Use CP-AMM SDK to create pool
- Call our `initialize_position` instruction
- Verify position owned by investor_fee_pos_owner PDA
- Test rejection of pools with base fees

**Time Gate Test (1 test - 20 min)**:
- Create position and policy
- Call `distribute_fees` successfully
- Attempt immediate second call → expect error
- Advance time, retry → expect success

**Distribution Logic Tests (2 tests - 45 min)**:
- Use Streamflow SDK to create vesting contracts
- Setup 5 investors with varying locked amounts
- Call `distribute_fees`
- Verify pro-rata calculations
- Test pagination

**Dust & Cap Tests (2 tests - 30 min)**:
- Create streams with small payouts
- Verify dust accumulation
- Test daily cap enforcement

**Creator Tests (3 tests - 45 min)**:
- Test creator remainder payout
- Edge case: all unlocked
- Edge case: all locked

**Event Tests (4 tests - 30 min)**:
- Verify event emissions for all 4 event types

**Security Tests (3 tests - 30 min)**:
- Invalid page index
- Overflow prevention
- Account ownership validation

### Phase 3: Test Execution & Documentation (30 min)

- Test with validator running
- Document any issues
- Update README with test instructions
- Commit changes

---

## Prerequisites for Test Execution

### Local Validator Must Be Running With Cloned Programs

```bash
# Option A: Use helper script (recommended)
./scripts/start-test-validator.sh

# Option B: Manual command
solana-test-validator \
  --clone cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG \
  --clone strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m \
  --url devnet \
  --reset
```

### Then Run Setup
```bash
npm run setup:local  # Creates tokens, wallets
```

### Then Run Tests
```bash
npm run test:local  # Runs integration tests
```

---

## Expected Outcomes

### ✅ **Success Criteria**:
- All 17 integration tests implemented with SDK calls
- Tests use real CP-AMM SDK for pool creation
- Tests use real Streamflow SDK for stream creation
- Tests call our fee-routing program instructions
- Clear documentation on how to run tests
- Helper script for validator setup

### 🟡 **Acceptable Limitations**:
- Tests require local validator with --clone (documented)
- Tests may fail if validator not setup correctly (expected)
- Full automation requires external programs (out of scope)

### 📊 **Bounty Compliance**:
- ✅ Tests demonstrate end-to-end flows (line 139)
- ✅ Tests run on local validator (line 119)
- ✅ Integration with CP-AMM and Streamflow (via SDK)
- ✅ All test logic implemented (no stubs)

---

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| SDK API documentation incomplete | MEDIUM | Research official docs, examine SDK source |
| Program cloning fails | LOW | Test with minimal setup, document workarounds |
| SDK version incompatibility | LOW | Use latest versions, document any issues |
| Test complexity exceeds 4 hours | HIGH | Prioritize critical tests, document remaining as known issues |

---

## Progress Tracking

- [x] SDKs installed
- [ ] Validator helper script created
- [ ] Position tests implemented (2/17)
- [ ] Time gate test implemented (3/17)
- [ ] Distribution tests implemented (5/17)
- [ ] Dust & cap tests implemented (7/17)
- [ ] Creator tests implemented (10/17)
- [ ] Event tests implemented (14/17)
- [ ] Security tests implemented (10/10)
- [ ] Documentation updated
- [ ] Tests verified working

**Target**: 10/10 tests implemented with SDK integration
**Realistic Goal**: All tests have real SDK integration code, documented prerequisites

---

## Next Action

Start implementing tests, beginning with validator helper script and position initialization tests.

**Estimated Time Remaining**: 3 hours 45 minutes
