# Upgrade History

This document tracks all upgrades to the fee-routing program on devnet.

## Program Information

- **Program ID**: `RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce`
- **Deployer/Authority**: `RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b`
- **Network**: Devnet
- **Explorer**: [View on Solscan](https://solscan.io/account/RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce?cluster=devnet)

---

## Upgrade Log

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
- ✅ Cargo test: 7/7 unit tests passing
- ✅ Anchor test: 22/22 integration tests passing

---

### v0.2.0 - Initial Deployment

**Binary Size**: 362 KB (370,688 bytes)

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
  --program-id RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce \
  --provider.cluster devnet
```

### Verify Upgrade

```bash
# Check program info
solana program show RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce --url devnet

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
