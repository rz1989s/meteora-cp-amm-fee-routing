# Smart Contract Upgrade Guide

## Current Status

**Deployed Program (OLD)**:
- Program ID: `RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP`
- Size: 316 KB
- Instructions: 2 (incomplete - with TODOs)
- Status: ❌ Outdated

**New Build (READY)**:
- Program ID: Same (`RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP`)
- Size: 371 KB
- Instructions: 4 (complete - all features implemented)
- Status: ✅ Ready for upgrade

---

## Changes in New Version

### New Features:
1. ✅ `initialize_policy` instruction added
2. ✅ `initialize_progress` instruction added
3. ✅ Real SPL token transfers implemented (no more TODOs!)
4. ✅ Base fee enforcement (fails if Token A detected)
5. ✅ Treasury PDA for signing token transfers
6. ✅ New error types: `BaseFeesDetected`, `InvalidPoolAuthority`, `InvalidProgram`
7. ✅ Zero warnings (cargo check & cargo test)

### Breaking Changes:
- `distribute_fees` now requires `treasury_authority` account
- Will FAIL if base fees (Token A) detected (bounty requirement)
- New state initialization flow required

---

## Upgrade Commands

### Option 1: Upgrade Existing Program (Recommended)

This keeps the same Program ID.

```bash
# Step 1: Verify you have the upgrade authority keypair
# Authority: RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b

# Step 2: Check current program status
solana program show RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP --url devnet

# Step 3: Upgrade the program binary
anchor upgrade target/deploy/fee_routing.so \
  --program-id RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP \
  --provider.cluster devnet

# Step 4: Update the IDL on-chain
anchor idl upgrade RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP \
  --filepath target/idl/fee_routing.json \
  --provider.cluster devnet

# Step 5: Verify upgrade success
solana program show RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP --url devnet
# Should show: Data Length: 362264 bytes

# Step 6: Fetch and verify IDL
anchor idl fetch RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP \
  --provider.cluster devnet \
  -o /tmp/deployed.json

# Check for 4 instructions
jq '.instructions[] | .name' /tmp/deployed.json
# Should output:
# "distribute_fees"
# "initialize_policy"
# "initialize_position"
# "initialize_progress"
```

### Option 2: Fresh Deployment (New Program ID)

Only use this if Option 1 fails or you want a completely new deployment.

```bash
# Step 1: Deploy new program
anchor deploy --provider.cluster devnet
# This will output a NEW program ID

# Step 2: Note the new program ID from output
# It will look like: Program Id: <NEW_PROGRAM_ID>

# Step 3: Initialize IDL for new program
anchor idl init <NEW_PROGRAM_ID> \
  --filepath target/idl/fee_routing.json \
  --provider.cluster devnet

# Step 4: Update lib.rs with new program ID
# Edit programs/fee-routing/src/lib.rs:
# declare_id!("<NEW_PROGRAM_ID>");

# Step 5: Rebuild with new ID
anchor build

# Step 6: Update all documentation
# - Update README.md program ID
# - Update CLAUDE.md program ID
# - Update website/app/page.tsx program ID
```

---

## Verification Steps

After upgrade, verify everything is working:

```bash
# 1. Check program size
solana program show RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP --url devnet | grep "Data Length"
# Expected: 362264 bytes

# 2. Verify IDL has 4 instructions
anchor idl fetch RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP \
  --provider.cluster devnet \
  -o /tmp/verify.json

jq '.instructions | length' /tmp/verify.json
# Expected: 4

# 3. Verify new error codes exist
jq '.errors[] | select(.name == "BaseFeesDetected")' /tmp/verify.json
# Should return the BaseFeesDetected error definition

# 4. Check upgrade authority (should remain the same)
solana program show RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP --url devnet | grep "Authority"
# Expected: RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b
```

---

## Post-Upgrade Checklist

After successful upgrade:

- [ ] Program binary upgraded (371 KB)
- [ ] IDL updated on-chain (4 instructions)
- [ ] Verification tests passed
- [ ] Explorer link updated (if needed)
- [ ] Pitch website points to correct program
- [ ] Bounty submission references correct program

---

## Rollback Plan

If something goes wrong, you can rollback to previous version:

```bash
# Only possible if you have the old .so file
# Keep a backup before upgrading!

anchor upgrade target/deploy/fee_routing_OLD.so \
  --program-id RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP \
  --provider.cluster devnet
```

---

## Notes

- **Upgrade Authority**: You must have the keypair for `RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b`
- **Network**: All commands use `--provider.cluster devnet`
- **Testing**: Consider testing on localnet first before devnet upgrade
- **Documentation**: After upgrade, all docs already reference the correct program ID

---

**Ready to upgrade?** Run Option 1 commands when you're ready!
