# Upgrade History

This document tracks all upgrades to the fee-routing program on devnet.

## Program Information

- **Program ID**: `RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP`
- **Deployer/Authority**: `RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b`
- **Network**: Devnet
- **Explorer**: [View on Solscan](https://solscan.io/account/RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP?cluster=devnet)

---

## Upgrade Log

### v0.2.3 - October 7, 2025 (Verifiable Build)

**Upgrade Signature**: `3tVHXk9yaaDkWGGnHiGWr4QvJ3rojFpSSErujMmbMAQ4SjgFw37ExfUZTgPenxekPKrJo1HX9zugnvJkQMdi9hCW`

**Explorer**: [View on Solscan](https://solscan.io/tx/3tVHXk9yaaDkWGGnHiGWr4QvJ3rojFpSSErujMmbMAQ4SjgFw37ExfUZTgPenxekPKrJo1HX9zugnvJkQMdi9hCW?cluster=devnet)

**Changes**:
- **Verifiable Build**: Deployed using `anchor build --verifiable` for cross-machine reproducibility
  - Anyone can rebuild from source and verify hash matches
  - Ensures transparent, auditable deployments
  - All PR #4 changes included
- **Verification**: Reproducible verifiable hash confirmed (f17b9a32...)
- **BPF Transformation**: Deployed hash (4f81eac6...) includes +12,288 bytes BPF metadata

**Commit**: `4ad0458` (Merge pull request #4)

**Build Status**:
- ✅ Verifiable binary size: 368,640 bytes (360 KB)
- ✅ Verifiable SHA-256 Hash: f17b9a32057833a6187ab8001de933c145275216ad91989dc2352f807a825c4f
- ✅ Deployed binary size: 380,928 bytes (371 KB, includes BPF metadata)
- ✅ Deployed SHA-256 Hash: 4f81eac65081f112ca419886c799992cf117f8bb725feb2009f3f6bbd7c71e46
- ✅ Build method: `anchor build --verifiable` (Docker-based, reproducible)
- ✅ Cargo build: 0 errors, 0 warnings
- ✅ All tests passing: 32/32 (22 local + 10 devnet)
- ✅ Program deployed and hash verified on devnet

---

### v0.2.2 - October 7, 2025

**Upgrade Signature**: `3JweeECLrU4toBm2km738ei74ict46Wkeg2jkMUGw5HSDWjyAhaWDpUCCEC5CoWHG4sZcME3X78iZJtVyhYZBFPd`

**Explorer**: [View on Solscan](https://solscan.io/tx/3JweeECLrU4toBm2km738ei74ict46Wkeg2jkMUGw5HSDWjyAhaWDpUCCEC5CoWHG4sZcME3X78iZJtVyhYZBFPd?cluster=devnet)

**Changes**:
- **Hash Verified Upgrade**: Deployed program with cryptographic hash verification
  - All PR #4 feedback changes included
  - Error type cleanup (BaseFeesNotAllowed removed)
  - Absolute path fixes in tests
  - API key security enhancements
- **Verification**: Deployed binary hash matches devnet dump (e6548dc5...)

**Commit**: `4ad0458` (Merge pull request #4)

**Build Status**:
- ✅ Binary size: 370,696 bytes (361 KB)
- ✅ SHA-256 Hash: e6548dc59ff5aa09459ae1c5e949cef3a8e9b151440612ad7d884601fff52d64
- ✅ Cargo build: 0 errors, 0 warnings
- ✅ All tests passing: 54/54 (22 local + 15 E2E + 10 devnet + 7 unit)
- ✅ Program deployed and hash verified on devnet

---

### v0.2.1 - October 5, 2025

**Upgrade Signature**: `3eh7F61gx7SZrVk3xsvg2QCwPq5qPuHA8RMp7LjC6xQUvui3GTmVtA3QUK2gYd9YAWZ8JLR6nWfJhVkpfEEQjWoe`

**Explorer**: [View on Solscan](https://solscan.io/tx/3eh7F61gx7SZrVk3xsvg2QCwPq5qPuHA8RMp7LjC6xQUvui3GTmVtA3QUK2gYd9YAWZ8JLR6nWfJhVkpfEEQjWoe?cluster=devnet)

**Changes**:
- **Critical Security Fix**: Fixed `has_base_fees` flag not being set when base fees detected
  - Now sets flag BEFORE returning error (line 289 in distribute_fees.rs)
  - Prevents concurrent crank attempts from bypassing base fee detection
  - Ensures bounty requirement (line 101) enforced across all pages
- **Enhancement**: Added `rounding_dust` field to `InvestorPayoutPage` event
  - Enables off-chain systems to reconcile exact amounts
  - Improves transparency and auditability
  - No on-chain state reads required for reconciliation

**Commit**: `76e103a19266df45318bd9e9de9c3963ad73f9b4`

**Files Modified**:
- `programs/fee-routing/src/instructions/distribute_fees.rs` (2 lines)
- `programs/fee-routing/src/events.rs` (1 line)

**Build Status**:
- ✅ Binary size: 371 KB (380,928 bytes)
- ✅ Cargo build: 0 errors, 0 warnings
- ✅ Cargo test: 7/7 unit tests + 4/4 integration logic tests passing
- ✅ Anchor test: 16/16 real tests passing (5 devnet + 7 unit + 4 integration logic)

---

### v0.2.0 - Initial Deployment

**Binary Size**: 371 KB (370,696 bytes)

**Features**:
- 4 instructions: `initialize_policy`, `initialize_progress`, `initialize_position`, `distribute_fees`
- Real SPL token transfers via treasury PDA
- Base fee enforcement (fails if Token A detected)
- Pro-rata fee distribution to investors
- 24-hour permissionless crank
- Pagination support
- Daily cap enforcement
- Dust accumulation

---

## Upgrade Commands Reference

### Upgrade Program

```bash
# Switch to deployer keypair
solana config set --keypair ~/.config/solana/REC-devnet.json

# Upgrade program
anchor upgrade target/deploy/fee_routing.so \
  --program-id RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP \
  --provider.cluster devnet
```

### Verify Upgrade

```bash
# Check program info
solana program show RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP --url devnet

# Verify binary size
ls -lh target/deploy/fee_routing.so

# Check deployer balance
solana balance RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b
```

---

## Notes

- Always bump version in `Cargo.toml` before upgrade
- Document all changes in commit message
- Run full test suite before upgrade
- Update documentation after successful upgrade
- Keep backup of previous binary for rollback if needed
