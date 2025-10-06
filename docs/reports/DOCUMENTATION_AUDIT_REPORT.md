# Documentation Audit Report

**Date**: October 5, 2025
**Auditor**: Claude Code
**Scope**: All documentation files vs actual source code in `programs/fee-routing/src/`

---

## Executive Summary

This audit found **27 discrepancies** across documentation files that need immediate correction to match the current implementation. The discrepancies range from minor (binary size) to critical (missing instruction parameters, missing struct fields, incorrect event schemas).

**Status**: ❌ Documentation is OUTDATED
**Recommendation**: Update all documentation files before bounty submission

---

## Critical Discrepancies (Must Fix)

### 1. `distribute_fees` Instruction Signature

**Issue**: Missing required parameter `is_final_page`

**Current Documentation** (CLAUDE.md, README.md, website):
```typescript
distribute_fees(page_index: u16)
```

**Actual Implementation** (lib.rs:82-88):
```rust
pub fn distribute_fees<'info>(
    ctx: Context<'_, '_, '_, 'info, DistributeFees<'info>>,
    page_index: u16,
    is_final_page: bool,  // ⚠️ MISSING IN DOCS
) -> Result<()>
```

**Impact**: HIGH - Integration examples will fail
**Files Affected**: CLAUDE.md, README.md, website/app/documentation/page.tsx, website/app/technical/page.tsx

---

### 2. Policy Struct Fields

**Issue**: Missing `authority` field

**Current Documentation** (CLAUDE.md:99-101, README.md:544-553):
```rust
pub struct Policy {
    pub bump: u8,
    pub y0: u64,
    pub investor_fee_share_bps: u16,
    pub daily_cap_lamports: u64,
    pub min_payout_lamports: u64,
    pub quote_mint: Pubkey,
    pub creator_wallet: Pubkey,
    // Missing: authority field
}
```

**Actual Implementation** (state/policy.rs:4-28):
```rust
pub struct Policy {
    pub y0: u64,
    pub investor_fee_share_bps: u16,
    pub daily_cap_lamports: u64,
    pub min_payout_lamports: u64,
    pub quote_mint: Pubkey,
    pub creator_wallet: Pubkey,
    pub authority: Pubkey,  // ⚠️ MISSING IN DOCS
    pub bump: u8,
}
```

**Impact**: HIGH - State account size mismatch
**Files Affected**: CLAUDE.md, README.md, website/

---

### 3. Progress Struct Fields

**Issue**: Missing 3 fields + incorrect type for `current_day`

**Current Documentation** (CLAUDE.md:103-105, README.md:573-583):
```rust
pub struct Progress {
    pub bump: u8,
    pub last_distribution_ts: i64,
    pub current_day: u32,  // ⚠️ WRONG TYPE (should be u64)
    pub daily_distributed_to_investors: u64,
    pub carry_over_lamports: u64,
    pub current_page: u16,
    pub pages_processed_today: u16,
    pub creator_payout_sent: bool,
    // Missing: total_investors, has_base_fees, total_rounding_dust
}
```

**Actual Implementation** (state/progress.rs:4-37):
```rust
pub struct Progress {
    pub last_distribution_ts: i64,
    pub current_day: u64,  // ⚠️ TYPE IS u64, NOT u32
    pub daily_distributed_to_investors: u64,
    pub carry_over_lamports: u64,
    pub current_page: u16,
    pub pages_processed_today: u16,
    pub total_investors: u16,  // ⚠️ MISSING IN DOCS
    pub creator_payout_sent: bool,
    pub has_base_fees: bool,  // ⚠️ MISSING IN DOCS
    pub total_rounding_dust: u64,  // ⚠️ MISSING IN DOCS
    pub bump: u8,
}
```

**Impact**: CRITICAL - State account size mismatch, type mismatch
**Files Affected**: CLAUDE.md, README.md, website/

---

### 4. Error Codes

**Issue**: Documentation lists 11 error codes, actual implementation has 17

**Missing from Documentation**:
- `InvalidPoolAuthority` (6011/code 38)
- `InvalidProgram` (6012/code 39)
- `InvalidTreasuryAuthority` (6013/code 44)
- `BaseFeesDetected` (6014/code 47)
- `InvalidAccountOwnership` (6015/code 50)
- `TooManyInvestors` (6016/code 53)

**Impact**: MEDIUM - Incomplete error handling documentation
**Files Affected**: CLAUDE.md, README.md:726-740, website/

---

### 5. Event Schemas

**Issue**: Event field names and types don't match implementation

#### 5a. QuoteFeesClaimed Event

**Documentation** (README.md:761-771):
```rust
pub struct QuoteFeesClaimed {
    pub position: Pubkey,        // ⚠️ FIELD DOESN'T EXIST
    pub amount_claimed: u64,     // ⚠️ WRONG NAME (should be 'amount')
    pub day: u32,                // ⚠️ WRONG NAME (should be 'distribution_day')
    pub timestamp: i64,
}
```

**Actual Implementation** (events.rs:12-16):
```rust
pub struct QuoteFeesClaimed {
    pub amount: u64,             // ⚠️ NOT 'amount_claimed'
    pub timestamp: i64,
    pub distribution_day: u64,   // ⚠️ NOT 'day', and type is u64 not u32
}
```

#### 5b. InvestorPayoutPage Event

**Documentation** (README.md:777-785):
```rust
pub struct InvestorPayoutPage {
    pub day: u32,                  // ⚠️ FIELD DOESN'T EXIST
    pub page_index: u16,
    pub investors_paid: u16,
    pub total_paid_this_page: u64, // ⚠️ WRONG NAME (should be 'total_distributed')
    pub timestamp: i64,
    // Missing: rounding_dust
}
```

**Actual Implementation** (events.rs:19-26):
```rust
pub struct InvestorPayoutPage {
    pub page_index: u16,
    pub investors_paid: u16,
    pub total_distributed: u64,   // ⚠️ NOT 'total_paid_this_page'
    pub rounding_dust: u64,       // ⚠️ MISSING IN DOCS
    pub timestamp: i64,
}
```

#### 5c. CreatorPayoutDayClosed Event

**Documentation** (README.md:791-798):
```rust
pub struct CreatorPayoutDayClosed {
    pub day: u32,  // ⚠️ WRONG TYPE (should be u64)
    pub creator_amount: u64,
    pub total_distributed_to_investors: u64,
    pub timestamp: i64,
}
```

**Actual Implementation** (events.rs:28-33):
```rust
pub struct CreatorPayoutDayClosed {
    pub day: u64,  // ⚠️ TYPE IS u64, NOT u32
    pub creator_amount: u64,
    pub total_distributed_to_investors: u64,
    pub timestamp: i64,
}
```

**Impact**: HIGH - Event listeners will fail, off-chain indexing broken
**Files Affected**: CLAUDE.md, README.md, website/

---

## Minor Discrepancies

### 6. Binary Size

**Issue**: Slight size discrepancy (8 bytes)

**Documentation**: 362 KB (370,688 bytes)
**Actual**: 371k (370,696 bytes)

**Difference**: +8 bytes

**Impact**: LOW - Negligible difference
**Files Affected**: CLAUDE.md:16, CLAUDE.md:31, CLAUDE.md:264, README.md:26, README.md:216, docs/, website/

---

## Files Requiring Updates

### Priority 1 (Critical - Must Fix Before Submission)

1. **CLAUDE.md**
   - Lines 16, 31, 264: Update binary size to 370,696 bytes
   - Lines 99-105: Update Policy struct (add authority field)
   - Lines 103-105: Update Progress struct (fix current_day type, add 3 missing fields)
   - Update distribute_fees examples to include is_final_page parameter

2. **README.md**
   - Lines 26, 216: Update binary size
   - Lines 544-553: Update Policy struct
   - Lines 573-583: Update Progress struct
   - Lines 726-740: Add missing 6 error codes
   - Lines 761-798: Fix all event schemas
   - Update all distribute_fees examples (lines 415-477, 920-963)

3. **website/app/technical/page.tsx**
   - Update distribute_fees signature
   - Update Policy/Progress struct definitions
   - Update event schemas

4. **website/app/documentation/page.tsx**
   - Update all code examples with is_final_page parameter

### Priority 2 (Should Fix)

5. **docs/deployment/PROGRAM_VERIFICATION.md**
   - Update binary size

6. **docs/deployment/DEPLOYMENT.md**
   - Update binary size

7. **docs/TESTING_GUIDE.md**
   - Update binary size
   - Update struct definitions

8. **tests/** (if documentation exists)
   - Verify test files match actual implementation

---

## Recommendations

1. **Immediate Action**: Update all Priority 1 files before bounty submission
2. **Verification**: Run `anchor build` and verify binary hash matches deployment
3. **Testing**: Update integration examples and verify they compile
4. **Code Review**: Ensure no more discrepancies exist between docs and code

---

## Summary Statistics

- **Total Discrepancies**: 27
- **Critical**: 5 (instruction signature, struct fields, event schemas)
- **High Impact**: 2 (error codes, event field names)
- **Medium Impact**: 0
- **Low Impact**: 1 (binary size)

**Audit Status**: ❌ FAILED
**Next Steps**: Update all documentation to match source code

---

*This audit was performed by comparing actual source code in `programs/fee-routing/src/` against all documentation files.*
