<!-- Satellite context file — extends the global hub (~/.claude/CLAUDE.md | ~/.pi/agent/AGENTS.md). Host-neutral; project-specific only. Do not duplicate hub standards here. -->

# Meteora CP-AMM Fee Routing

> Permissionless fee routing Anchor program for **Meteora DAMM v2** (Constant Product AMM / CP-AMM) pools. Creates an "honorary" NFT-based LP position that accrues fees, then distributes them to investors (pro-rata based on Streamflow locked amounts) via a 24-hour permissionless crank, with remainder going to creators.

> **Terminology:** This is **DAMM V2 / CP-AMM**, NOT DLMM. (The bounty URL says "dlmm-v2" — a platform typo; the bounty doc clearly states "DAMM V2".)

**Org:** rz1989s (personal). **Status:** ✅ complete, production-ready. (Bounty outcome: did not win — winner created pools with `OnlyB` fee mode at protocol level; this integrates with existing pools.)

## On-Chain

- **Program ID:** `RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP` (devnet)
- **Deployer:** `RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b`
- **Policy PDA:** `6YyC75eRsssSnHrRFYpRiyoohCQyLqiHDe6CRje69hzt`
- **Progress PDA:** `9cumYPtnKQmKsVmTeKguv7h3YWspRoMUQeqgAHMFNXxv`
- **Binary:** 371KB (370,696 bytes), zero warnings, 0 `unsafe` blocks

**External programs:** Meteora CP-AMM `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG` · Streamflow `strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m` (read locked amounts; cloned in test validator).

## Common Commands

```bash
anchor build --verifiable   # reproducible build (deterministic hash on any machine)
anchor build                # faster, not reproducible
anchor test                 # all tests (requires devnet validator w/ account clones)
anchor test --provider.cluster devnet

npm run test:local          # 22 local integration tests
npm run test:e2e            # 15 E2E integration tests
npm run test:devnet         # 10 live devnet tests (Helius RPC)
npm run test:all            # local + e2e + devnet + unit

cd website && npm run type-check:strict  # website TS strictness (run after website changes)
```

**Tests:** Triple-bundle — 22 local + 15 E2E + 10 devnet (TS) + 7 Rust unit = 54 unique tests, all passing.

## Core Architecture

### Four-Instruction Design
1. **`initialize_policy`** — immutable distribution config (Y0, fee shares, caps, thresholds)
2. **`initialize_progress`** — daily distribution tracking state (mutable; pagination + payouts)
3. **`initialize_position`** — NFT-based honorary DAMM v2 position owned by program PDA
4. **`distribute_fees`** — permissionless 24h crank: claims fees, distributes via SPL transfers (supports pagination)

### PDA Seeds
```
VAULT_SEED = b"vault"
INVESTOR_FEE_POS_OWNER_SEED = b"investor_fee_pos_owner"
POLICY_SEED = b"policy"        # immutable distribution config
PROGRESS_SEED = b"progress"     # daily distribution state (mutable)
TREASURY_SEED = b"treasury"     # signs token transfers

# Position owner PDA: [VAULT_SEED, vault.key(), INVESTOR_FEE_POS_OWNER_SEED]
# Treasury authority PDA: [TREASURY_SEED]
```

### Critical: Quote-Only Enforcement
Bounty requirement (line 101): *"If any base fees are observed, the crank must fail deterministically."* Implementation: claims fees (page 0 only); if any Token A (base) fees detected → `FeeRoutingError::BaseFeesDetected` immediately. Only Token B (quote) distributed to investors pro-rata; remainder to creator.

### Pro-Rata Distribution Math
```
f_locked(t)            = locked_total(t) / Y0
eligible_investor_share = min(investor_fee_share_bps, floor(f_locked(t) * 10000))
investor_fee_quote     = floor(claimed_quote * eligible_investor_share / 10000)
weight_i(t)            = locked_i(t) / locked_total(t)
payout_i               = floor(investor_fee_quote * weight_i(t))
```

### Idempotent Pagination + Dust/Cap Handling
- `distribute_fees` called with sequential `page_index` within same 24h window; `current_page` in Progress prevents double-payment; resume if crank interrupted. Creator payout only on final page when `creator_payout_sent == false`.
- Skip transfers below `min_payout_lamports`; accumulate skipped dust in `carry_over_lamports`; enforce `daily_cap_lamports` (0 = no cap); excess above cap carries forward.

### Events
`HonoraryPositionInitialized`, `QuoteFeesClaimed`, `InvestorPayoutPage`, `CreatorPayoutDayClosed`.

## Constants
`DISTRIBUTION_WINDOW_SECONDS = 86_400` (24h) · `BPS_DENOMINATOR = 10_000`.

## Wallets

- **Test wallet** `~/.config/solana/test-wallet.json` (`3DvLMt…`) — user ops, tests, setup.
- **Deployer wallet** `~/.config/solana/REC-devnet.json` (`RECdpx…`) — program deploy/upgrade/authority, funds test wallet. Keep secure (upgrade authority).

## ⚠️ Security: Helius API Key Rotation

A Helius devnet API key is **temporarily hardcoded** across `Anchor.toml`, `package.json`, `scripts/*.ts`, `tests/devnet-*.ts`, `website/app/admin/page.tsx` for judge accessibility (public Solana RPC rate-limited; Anchor.toml can't use env vars). **Plan:** rotate immediately after bounty judgment; new key → `.env` (gitignored). Devnet-only, no mainnet/financial risk. See `.env.example` for the rotation plan.

## Program Verification

`anchor build --verifiable` produces a **reproducible** hash on any machine. The deployed binary differs from local `.so` due to BPF Loader transformation (+12,288 bytes metadata) — **never compare local `.so` to a devnet dump**. Instead, compare devnet dumps across time (they match if source unchanged).

- Verifiable build hash: `f17b9a32…` (368,640 bytes)
- Deployed hash (BPF-transformed): `4f81eac6…` (380,928 bytes)

## Repository Structure

```
programs/fee-routing/   # Anchor program source
tests/                  # integration tests (TS)
website/                 # Next.js pitch site (meteora-fee-routing.rectorspace.com)
docs/{bounty,deployment,planning,reports,security,testing,website}/
archive/                 # historical docs
```

**Key docs:** `README.md` (33KB) · `docs/reports/FINAL_STATUS.md` · `docs/security/SECURITY_AUDIT.md` · `docs/testing/TESTING_GUIDE.md`.