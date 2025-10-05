# Build Permissionless Fee Routing Anchor Program for Meteora DAMM V2

**Bounty URL:** <https://earn.superteam.fun/listing/build-permissionless-fee-routing-anchor-program-for-meteora-dlmm-v2>

**Sponsor:** Star

**Type:** Bounty

**Status:** Submissions Open

**Region:** Global

**Total Prize:** 7,500 USDC (1st place: 7,500 USDC)

**Submissions:** 18

**Time Remaining:** 7d:20h:59m (as of fetch)

**Winner Announcement:** October 17, 2025

**Skills Needed:** Blockchain

**Contact:** <https://t.me/algopapi>

---

## About Star

**Imagine if Twitch, Kickstarter and the NASDAQ had a baby. That's star - a fundraising platform where founders raise capital in live, public token sales.**

Star was born in February (7 months ago). We were a bunch of serial builders who tried launching a token for an AI startup on pump.fun - long story short, it wasn't fun. So we decided to build a better platform where ambitious startups and founders could get funded.

In June we launched star with our own fundraiser and raised $450K in 48 hours, largely due to an experiment where we turned on a livestream. Since then, we've earned $200K in trading fees on our token and helped 1 team raise $350K (in a single hour). Our $STAR is worth about $3.5M at the moment and we hosted the first ever livestreamed fundraising event in crypto, which over 50,000 people tuned in to.

---

## Bounty: DAMM v2 Honorary Quote‑Only Fee Position + 24h Distribution Crank

**Goal:** Ship a small, standalone, Anchor‑compatible module we can import that:

- Creates and manages an "honorary" DAMM v2 LP position that is owned by our program (PDA) and accrues fees in the quote mint only.
- Provides a permissionless, once‑per‑24h crank that claims those quote fees and distributes them to investors pro‑rata to still‑locked amounts (from Streamflow), with the complement routed to the creator wallet.

### Hard requirements

- **Quote‑only fees:** The honorary position must accrue fees exclusively in the quote mint. If this cannot be guaranteed by pool/config parameters, the module must detect and fail without accepting base‑denominated fees.
- **Program ownership:** The fee position is owned by a program PDA (e.g., `InvestorFeePositionOwnerPda` with seeds `[VAULT_SEED, vault, "investor_fee_pos_owner"]`).
- **No dependency on any creator position:** This is an independent position solely for fee accrual in quote.

### Work package A — Initialize the honorary fee position (quote‑only)

- Create an empty DAMM v2 position owned by our PDA that, under the chosen pool/tick/price configuration, accrues only quote‑token fees.
- Validate pool token order and confirm which mint is the quote mint.
- Provide a deterministic preflight/validation step that rejects any config that could accrue base fees.

### Work package B — Permissionless 24h distribution crank (quote only)

- Crank can be called once per 24h window; supports pagination across multiple calls within the same day.
- On each crank:
  1. Claim fees from the honorary position via `cp-amm` into a program‑owned quote treasury ATA.
  2. Read still‑locked amounts per investor at the current timestamp from Streamflow (team will pass the investor page accounts and stream pubkeys).
  3. Compute investor share and distribute quote fees only:
     - Define:
       - `Y0` = total investor streamed allocation minted at TGE (stored/provided).
       - `locked_total(t)` = sum of still‑locked across investors at time t (from Streamflow).
       - `f_locked(t) = locked_total(t) / Y0` in [0, 1].
       - `eligible_investor_share_bps = min(investor_fee_share_bps, floor(f_locked(t) * 10000))`.
       - `investor_fee_quote = floor(claimed_quote * eligible_investor_share_bps / 10000)`.
       - Apply per‑day cap and dust threshold; carry remainder forward.
     - Distribute pro‑rata: `weight_i(t) = locked_i(t) / locked_total(t)`, payout `floor(investor_fee_quote * weight_i(t))`.
  4. After the final page of the day, route the remainder of that day's claimed quote fees to the creator's quote ATA.
- **Idempotent, resumable pagination:**
  - Track a daily window with `last_distribution_ts`, cumulative distributed, carry‑over, and pagination cursor.
  - Re‑running pages must not double‑pay. Safe to resume mid‑day after partial success.

### Inputs we will provide at integration time

- Creator wallet quote ATA (destination for remainder).
- Investor distribution set (paged): per‑investor Streamflow stream pubkey and investor quote ATA.
- Pool/program IDs and all `cp-amm` accounts/keys.
- `Y0` and policy config (`investor_fee_share_bps`, optional daily cap, `min_payout_lamports`).

### Required accounts and state (document clearly)

**For initialization:**

- `cp-amm` program + pool accounts/config; token vaults; system and token programs.
- `InvestorFeePositionOwnerPda` (program PDA) and the new position account(s).
- Verification of quote mint identity.

**For crank:**

- Honorary position + its owner PDA.
- Program quote treasury ATA (for pool's quote mint).
- Creator quote ATA.
- Streamflow program ID.
- Paged investor accounts: Streamflow stream pubkey and investor quote ATA.
- Policy PDA (fee share, caps, dust) and Progress PDA (last ts, daily spent, carry, cursor, day state).

### Protocol rules and invariants

- **24h gate:** First crank in a day requires `now >= last_distribution_ts + 86400`. Subsequent pages share the same "day".
- **Quote‑only enforcement:** If any base fees are observed or a claim returns non‑zero base, the crank must fail deterministically (no distribution).
- **Math:** Use floor on proportional math; enforce `min_payout_lamports`; carry dust to later pages/day; apply daily caps net of prior payouts.
- **In‑kind:** Distribute quote mint only; no price conversions.
- **Liveness:** Missing investor ATAs may be made if needed per policy with accounting and continuation; creator remainder must not be blocked.

### Acceptance criteria

**Honorary position:**

- Owned by program PDA; validated quote‑only accrual or clean rejection.

**Crank:**

- Claims quote fees, distributes to investors by still‑locked share, routes complement to creator on day close.
- Enforces 24h gating, supports pagination with idempotent retries, respects caps and dust handling.

**Tests (local validator/bankrun):**

- Initialize pool and honorary position; simulate quote fee accrual; run crank across multiple pages.
- Cases:
  - partial locks: investor payouts match weights within rounding tolerance; creator gets complement.
  - All unlocked: 100% to creator.
  - Dust and cap behavior: dust is carried; caps clamp payouts.
  - Base‑fee presence causes deterministic failure with no distribution.

**Quality:**

- Anchor‑compatible; no `unsafe`; deterministic seeds.
- Clear README with integration steps, account tables, error codes, and day/pagination semantics.
- Emit events: `HonoraryPositionInitialized`, `QuoteFeesClaimed`, `InvestorPayoutPage`, `CreatorPayoutDayClosed`.

### Deliverables

Public Git repo containing:

- The module/crate (Anchor‑compatible) with clear instruction interfaces and account requirements.
- Tests demonstrating end‑to‑end flows against `cp-amm` and Streamflow on a local validator.
- `README.md` documenting setup, wiring, PDAs, policies, and failure modes.

---
