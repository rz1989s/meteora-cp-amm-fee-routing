use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::{
    constants::*,
    errors::FeeRoutingError,
    events::{QuoteFeesClaimed, InvestorPayoutPage, CreatorPayoutDayClosed},
    meteora,
    state::{Policy, Progress},
};

#[derive(Accounts)]
pub struct DistributeFees<'info> {
    /// Permissionless caller
    pub caller: Signer<'info>,

    #[account(
        seeds = [POLICY_SEED],
        bump = policy.bump,
    )]
    pub policy: Account<'info, Policy>,

    #[account(
        mut,
        seeds = [PROGRESS_SEED],
        bump = progress.bump,
    )]
    pub progress: Account<'info, Progress>,

    /// CHECK: Position owner PDA
    #[account(
        seeds = [VAULT_SEED, vault.key().as_ref(), INVESTOR_FEE_POS_OWNER_SEED],
        bump
    )]
    pub position_owner_pda: AccountInfo<'info>,

    /// CHECK: Vault reference
    pub vault: AccountInfo<'info>,

    // ===== Meteora CP-AMM Fee Claiming Accounts =====

    /// Pool authority (constant address)
    /// CHECK: Must match pool_authority()
    pub pool_authority: AccountInfo<'info>,

    /// The CP-AMM pool
    /// CHECK: Validated by Meteora program
    pub pool: AccountInfo<'info>,

    /// Position data account
    /// CHECK: Validated by Meteora program
    #[account(mut)]
    pub position: AccountInfo<'info>,

    /// Position NFT token account
    /// CHECK: Validated by Meteora program
    pub position_nft_account: AccountInfo<'info>,

    /// Treasury authority PDA (can sign for treasury token accounts)
    /// CHECK: PDA that owns treasury token accounts
    #[account(
        seeds = [TREASURY_SEED],
        bump
    )]
    pub treasury_authority: AccountInfo<'info>,

    /// Program's treasury token A account (destination for claimed fees)
    /// CHECK: Token account owned by treasury authority
    #[account(mut)]
    pub treasury_token_a: AccountInfo<'info>,

    /// Program's treasury token B account (destination for claimed fees)
    /// CHECK: Token account owned by treasury authority
    #[account(mut)]
    pub treasury_token_b: AccountInfo<'info>,

    /// Pool's token A vault (source)
    /// CHECK: Validated by Meteora program
    #[account(mut)]
    pub pool_token_a_vault: AccountInfo<'info>,

    /// Pool's token B vault (source)
    /// CHECK: Validated by Meteora program
    #[account(mut)]
    pub pool_token_b_vault: AccountInfo<'info>,

    /// Token A mint
    /// CHECK: Token mint
    pub token_a_mint: AccountInfo<'info>,

    /// Token B mint (quote mint)
    /// CHECK: Should match policy.quote_mint
    pub token_b_mint: AccountInfo<'info>,

    /// Token A program
    /// CHECK: Token program
    pub token_a_program: AccountInfo<'info>,

    /// Token B program
    /// CHECK: Token program
    pub token_b_program: AccountInfo<'info>,

    /// Event authority for Meteora program
    /// CHECK: Event authority PDA
    pub event_authority: AccountInfo<'info>,

    /// Meteora CP-AMM program
    /// CHECK: Must match cp_amm_program_id()
    pub cp_amm_program: AccountInfo<'info>,

    // ===== Other Accounts =====

    /// Creator quote ATA (for remainder distribution)
    /// CHECK: Creator's token account
    #[account(mut)]
    pub creator_ata: AccountInfo<'info>,

    /// Streamflow program
    /// CHECK: Streamflow program ID
    pub streamflow_program: AccountInfo<'info>,

    /// Token program for transfers
    pub token_program: Program<'info, Token>,

    // Remaining accounts:
    // - Investor accounts (alternating: stream_pubkey, investor_ata)
}

pub fn distribute_fees_handler<'info>(
    ctx: Context<'_, '_, '_, 'info, DistributeFees<'info>>,
    page_index: u16,
    is_final_page: bool,
) -> Result<()> {
    let policy = &ctx.accounts.policy;
    let progress = &mut ctx.accounts.progress;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;

    // === 1. ACCOUNT OWNERSHIP VALIDATION ===
    // Validate treasury token accounts are owned by treasury authority
    {
        let treasury_token_a_data = ctx.accounts.treasury_token_a.try_borrow_data()?;
        let treasury_account_a = TokenAccount::try_deserialize(&mut &treasury_token_a_data[..])?;
        require!(
            treasury_account_a.owner == ctx.accounts.treasury_authority.key(),
            FeeRoutingError::InvalidAccountOwnership
        );

        // Validate token A mint matches pool's token A mint
        require!(
            treasury_account_a.mint == ctx.accounts.token_a_mint.key(),
            FeeRoutingError::InvalidQuoteMint // Reuse error for mint mismatch
        );
    }

    {
        let treasury_token_b_data = ctx.accounts.treasury_token_b.try_borrow_data()?;
        let treasury_account_b = TokenAccount::try_deserialize(&mut &treasury_token_b_data[..])?;
        require!(
            treasury_account_b.owner == ctx.accounts.treasury_authority.key(),
            FeeRoutingError::InvalidAccountOwnership
        );

        // Validate quote mint matches policy
        require!(
            treasury_account_b.mint == policy.quote_mint,
            FeeRoutingError::InvalidQuoteMint
        );
    }

    // Validate creator ATA ownership
    {
        let creator_ata_data = ctx.accounts.creator_ata.try_borrow_data()?;
        let creator_account = TokenAccount::try_deserialize(&mut &creator_ata_data[..])?;
        require!(
            creator_account.owner == policy.creator_wallet,
            FeeRoutingError::InvalidAccountOwnership
        );
        require!(
            creator_account.mint == policy.quote_mint,
            FeeRoutingError::InvalidQuoteMint
        );
    }

    // === 2. TIME GATE & DAY MANAGEMENT ===
    let is_new_day = now >= progress.last_distribution_ts + DISTRIBUTION_WINDOW_SECONDS;

    if page_index == 0 {
        // First page must respect 24h gate
        require!(is_new_day, FeeRoutingError::DistributionWindowNotElapsed);
    } else {
        // Subsequent pages must be same day
        require!(!is_new_day, FeeRoutingError::InvalidPageIndex);
        require!(page_index == progress.current_page, FeeRoutingError::InvalidPageIndex);
    }

    // === 3. CLAIM FEES FROM HONORARY POSITION ===
    // CRITICAL: Claim fees and validate BEFORE updating state to prevent state corruption if tx fails
    // Only claim on first page to get fresh fee total
    let (_claimed_token_a, claimed_token_b) = if page_index == 0 {
        // Get balances before claiming
        let balance_a_before = {
            let data = ctx.accounts.treasury_token_a.try_borrow_data()?;
            let account = TokenAccount::try_deserialize(&mut &data[..])?;
            account.amount
        };
        let balance_b_before = {
            let data = ctx.accounts.treasury_token_b.try_borrow_data()?;
            let account = TokenAccount::try_deserialize(&mut &data[..])?;
            account.amount
        };

        // Validate pool authority
        require!(
            ctx.accounts.pool_authority.key() == meteora::pool_authority(),
            FeeRoutingError::InvalidPoolAuthority
        );

        // Validate CP-AMM program
        require!(
            ctx.accounts.cp_amm_program.key() == meteora::cp_amm_program_id(),
            FeeRoutingError::InvalidProgram
        );

        // Build CPI accounts for claim_position_fee
        let cpi_accounts = meteora::ClaimPositionFeeCPI {
            pool_authority: ctx.accounts.pool_authority.to_account_info(),
            pool: ctx.accounts.pool.to_account_info(),
            position: ctx.accounts.position.to_account_info(),
            token_a_account: ctx.accounts.treasury_token_a.to_account_info(),
            token_b_account: ctx.accounts.treasury_token_b.to_account_info(),
            token_a_vault: ctx.accounts.pool_token_a_vault.to_account_info(),
            token_b_vault: ctx.accounts.pool_token_b_vault.to_account_info(),
            token_a_mint: ctx.accounts.token_a_mint.to_account_info(),
            token_b_mint: ctx.accounts.token_b_mint.to_account_info(),
            position_nft_account: ctx.accounts.position_nft_account.to_account_info(),
            owner: ctx.accounts.position_owner_pda.to_account_info(),
            token_a_program: ctx.accounts.token_a_program.to_account_info(),
            token_b_program: ctx.accounts.token_b_program.to_account_info(),
            event_authority: ctx.accounts.event_authority.to_account_info(),
            program: ctx.accounts.cp_amm_program.to_account_info(),
        };

        // Get PDA bump for signing
        let bump = ctx.bumps.position_owner_pda;
        let vault_key = ctx.accounts.vault.key();
        let signer_seeds: &[&[&[u8]]] = &[&[
            VAULT_SEED,
            vault_key.as_ref(),
            INVESTOR_FEE_POS_OWNER_SEED,
            &[bump],
        ]];

        // Claim fees via CPI
        meteora::claim_position_fee_cpi(&cpi_accounts, signer_seeds)?;

        // Get balances after claiming (CPI updates the accounts)
        let balance_a_after = {
            let data = ctx.accounts.treasury_token_a.try_borrow_data()?;
            let account = TokenAccount::try_deserialize(&mut &data[..])?;
            account.amount
        };
        let balance_b_after = {
            let data = ctx.accounts.treasury_token_b.try_borrow_data()?;
            let account = TokenAccount::try_deserialize(&mut &data[..])?;
            account.amount
        };

        // Calculate claimed amounts
        let claimed_a = balance_a_after.checked_sub(balance_a_before)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;
        let claimed_b = balance_b_after.checked_sub(balance_b_before)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;

        emit!(QuoteFeesClaimed {
            amount: claimed_b, // Token B is quote token
            timestamp: now,
            distribution_day: progress.current_day,
        });

        msg!("Fees claimed - Token A: {}, Token B (quote): {}", claimed_a, claimed_b);

        // Bounty requirement (line 101): "If any base fees are observed or a claim returns
        // non-zero base, the crank must fail deterministically (no distribution)"
        // CRITICAL: Check BEFORE state updates to prevent corruption if tx fails
        if claimed_a > 0 {
            msg!("Base token fees detected: {} lamports", claimed_a);
            msg!("Position must be configured for quote-only accrual");
            // Set flag BEFORE returning to block subsequent pages
            progress.has_base_fees = true;
            return Err(FeeRoutingError::BaseFeesDetected.into());
        }

        // Base fee check passed - NOW safe to update state for new day
        progress.last_distribution_ts = now;
        progress.current_day = progress.current_day.checked_add(1)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;
        progress.daily_distributed_to_investors = 0;
        progress.current_page = 0;
        progress.pages_processed_today = 0;
        progress.creator_payout_sent = false;
        progress.has_base_fees = false; // No base fees detected, safe to proceed

        (claimed_a, claimed_b)
    } else {
        // Subsequent pages don't claim, just distribute remaining
        // Check if base fees were detected on page 0
        require!(
            !progress.has_base_fees,
            FeeRoutingError::BaseFeesDetected
        );
        (0, 0)
    };

    // Add carry-over from previous cycles
    // We only distribute quote token (token B) to investors
    let total_available = claimed_token_b
        .checked_add(progress.carry_over_lamports)
        .ok_or(FeeRoutingError::ArithmeticOverflow)?;

    // === 4. PARSE INVESTOR ACCOUNTS FROM REMAINING ===
    let remaining_accounts = &ctx.remaining_accounts;
    require!(
        remaining_accounts.len() % 2 == 0,
        FeeRoutingError::InvalidPageIndex
    );

    let investor_count = remaining_accounts.len() / 2;

    // Validate investor count doesn't exceed maximum
    require!(
        investor_count <= MAX_INVESTORS_PER_PAGE,
        FeeRoutingError::TooManyInvestors
    );

    let mut locked_amounts: Vec<u64> = Vec::with_capacity(investor_count);
    let mut total_locked: u64 = 0;

    // Read locked amounts from Streamflow accounts
    for i in 0..investor_count {
        let stream_account = &remaining_accounts[i * 2];
        let investor_ata = &remaining_accounts[i * 2 + 1];

        // Validate stream account owner is Streamflow program
        require!(
            stream_account.owner == &streamflow_sdk::id(),
            FeeRoutingError::InvalidStreamflowAccount
        );

        // Deserialize Streamflow Contract account
        // Note: Streamflow Contract accounts do NOT have an 8-byte discriminator
        // They use borsh serialization directly. The deserialization will fail
        // if the account is not a valid Contract (acts as validation).
        let contract_data = stream_account.try_borrow_data()?;

        // Additional validation: Check minimum account size
        // Streamflow Contract accounts are typically 500+ bytes
        require!(
            contract_data.len() >= 400,
            FeeRoutingError::InvalidStreamflowAccount
        );

        let contract = streamflow_sdk::state::Contract::try_from_slice(&contract_data)?;

        // Note: We validate the quote mint through the investor's ATA below
        // This is sufficient since the investor ATA must match the policy quote mint
        // and the Streamflow contract must distribute to this ATA

        // Validate investor ATA
        {
            let investor_ata_data = investor_ata.try_borrow_data()?;
            let investor_token_account = TokenAccount::try_deserialize(&mut &investor_ata_data[..])?;
            require!(
                investor_token_account.mint == policy.quote_mint,
                FeeRoutingError::InvalidQuoteMint
            );
        }

        // Calculate locked amount:
        // locked = net_amount_deposited - (vested_available + cliff_available)
        let now_u64 = now as u64; // Streamflow methods expect u64 timestamp
        let vested = contract.vested_available(now_u64);
        let cliff = contract.cliff_available(now_u64);

        let unlocked = vested
            .checked_add(cliff)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;

        let locked = contract.ix.net_amount_deposited
            .checked_sub(unlocked)
            .unwrap_or(0); // If fully vested, locked = 0

        locked_amounts.push(locked);
        total_locked = total_locked
            .checked_add(locked)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;
    }

    // === 5. CALCULATE PRO-RATA DISTRIBUTION ===
    use crate::math::DistributionMath;

    // Calculate locked fraction: f_locked(t) = locked_total(t) / Y0
    let locked_fraction_bps = DistributionMath::calculate_locked_fraction_bps(
        total_locked,
        policy.y0,
    )?;

    // Calculate eligible investor share (capped)
    let eligible_share_bps = DistributionMath::calculate_eligible_investor_share_bps(
        locked_fraction_bps,
        policy.investor_fee_share_bps,
    );

    // Calculate total amount for investors
    let investor_allocation = DistributionMath::calculate_investor_allocation(
        total_available,
        eligible_share_bps,
    )?;

    // Apply daily cap if configured
    let (distributable, new_carry_over) = DistributionMath::apply_daily_cap(
        investor_allocation,
        policy.daily_cap_lamports,
        progress.daily_distributed_to_investors,
    )?;

    // === 6. DISTRIBUTE TO INVESTORS ===
    let mut page_total_distributed = 0u64;
    let mut investors_paid = 0u16;
    let mut accumulated_dust = 0u64;
    let mut rounding_dust_this_page = 0u64;

    // Track total theoretical allocation to compare against actual distribution
    let mut total_theoretical_payout = 0u64;

    for i in 0..investor_count {
        let investor_locked = locked_amounts[i];

        // Calculate this investor's payout (floor division creates rounding dust)
        let payout = DistributionMath::calculate_investor_payout(
            investor_locked,
            total_locked,
            distributable,
        )?;

        total_theoretical_payout = total_theoretical_payout
            .checked_add(payout)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;

        // Check minimum threshold
        if DistributionMath::meets_minimum_threshold(payout, policy.min_payout_lamports) {
            // Access investor ATA directly from remaining_accounts
            let investor_ata_info = &remaining_accounts[i * 2 + 1];

            // Execute token transfer via CPI
            let cpi_accounts = Transfer {
                from: ctx.accounts.treasury_token_b.to_account_info(),
                to: investor_ata_info.to_account_info(),
                authority: ctx.accounts.treasury_authority.to_account_info(),
            };

            let treasury_bump = ctx.bumps.treasury_authority;
            let signer_seeds: &[&[&[u8]]] = &[&[
                TREASURY_SEED,
                &[treasury_bump],
            ]];

            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

            token::transfer(cpi_ctx, payout)?;

            page_total_distributed = page_total_distributed
                .checked_add(payout)
                .ok_or(FeeRoutingError::ArithmeticOverflow)?;
            investors_paid = investors_paid.checked_add(1)
                .ok_or(FeeRoutingError::ArithmeticOverflow)?;
        } else {
            // Below threshold - accumulate as dust
            accumulated_dust = accumulated_dust
                .checked_add(payout)
                .ok_or(FeeRoutingError::ArithmeticOverflow)?;
        }
    }

    // Calculate rounding dust: difference between distributable and sum of floor'd payouts
    // This tracks the "lost" lamports due to integer division rounding
    //
    // ROUNDING DUST STRATEGY:
    // Floor division (a/b) in pro-rata distribution creates remainder lamports that cannot
    // be distributed fairly. These lamports are NOT lost - they remain in the treasury.
    //
    // Example: 1000 lamports distributed to 3 investors (333, 333, 333) = 999 distributed
    // Rounding dust: 1000 - 999 = 1 lamport remains in treasury
    //
    // IMPORTANT: Rounding dust is NEVER distributed to any party. It accumulates in:
    // - progress.total_rounding_dust (tracked for transparency/auditing)
    // - treasury_token_b account (physically held, can be rescued by admin later)
    //
    // This design ensures:
    // 1. No party receives unfair advantage from rounding
    // 2. Dust is transparent and auditable
    // 3. Dust can be recovered via future governance/rescue mechanism
    // 4. Math is deterministic and verifiable
    if distributable > total_theoretical_payout {
        rounding_dust_this_page = distributable
            .checked_sub(total_theoretical_payout)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;
    }

    // === 7. UPDATE PROGRESS STATE ===
    progress.daily_distributed_to_investors = progress.daily_distributed_to_investors
        .checked_add(page_total_distributed)
        .ok_or(FeeRoutingError::ArithmeticOverflow)?;

    progress.carry_over_lamports = accumulated_dust
        .checked_add(new_carry_over)
        .ok_or(FeeRoutingError::ArithmeticOverflow)?;

    // Track lifetime rounding dust for transparency (audit trail only, never redistributed)
    progress.total_rounding_dust = progress.total_rounding_dust
        .checked_add(rounding_dust_this_page)
        .ok_or(FeeRoutingError::ArithmeticOverflow)?;

    progress.current_page = progress.current_page.checked_add(1)
        .ok_or(FeeRoutingError::ArithmeticOverflow)?;
    progress.pages_processed_today = progress.pages_processed_today.checked_add(1)
        .ok_or(FeeRoutingError::ArithmeticOverflow)?;

    emit!(InvestorPayoutPage {
        page_index,
        investors_paid,
        total_distributed: page_total_distributed,
        rounding_dust: rounding_dust_this_page,
        timestamp: now,
    });

    // === 8. CREATOR PAYOUT (FINAL PAGE ONLY) ===
    // Use explicit is_final_page parameter from caller to prevent multiple payouts
    if is_final_page && !progress.creator_payout_sent {
        // Calculate remainder: total claimed minus investor allocation
        let remainder = total_available
            .checked_sub(investor_allocation)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;

        if remainder > 0 {
            // Transfer remainder to creator (Token B / quote token)
            let cpi_accounts = Transfer {
                from: ctx.accounts.treasury_token_b.to_account_info(),
                to: ctx.accounts.creator_ata.clone(),
                authority: ctx.accounts.treasury_authority.to_account_info(),
            };

            let treasury_bump = ctx.bumps.treasury_authority;
            let signer_seeds: &[&[&[u8]]] = &[&[
                TREASURY_SEED,
                &[treasury_bump],
            ]];

            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
                signer_seeds,
            );

            token::transfer(cpi_ctx, remainder)?;

            emit!(CreatorPayoutDayClosed {
                day: progress.current_day,
                creator_amount: remainder,
                total_distributed_to_investors: progress.daily_distributed_to_investors,
                timestamp: now,
            });
        }

        progress.creator_payout_sent = true;
    }

    Ok(())
}
