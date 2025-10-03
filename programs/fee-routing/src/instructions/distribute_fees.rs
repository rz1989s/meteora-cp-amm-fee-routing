use anchor_lang::prelude::*;
use crate::{
    constants::*,
    errors::FeeRoutingError,
    events::{QuoteFeesClaimed, InvestorPayoutPage, CreatorPayoutDayClosed},
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

    /// CHECK: Honorary position
    pub position: AccountInfo<'info>,

    /// CHECK: Program quote treasury ATA
    #[account(mut)]
    pub treasury: AccountInfo<'info>,

    /// CHECK: Creator quote ATA
    #[account(mut)]
    pub creator_ata: AccountInfo<'info>,

    /// CHECK: Meteora CP-AMM program
    pub cp_amm_program: AccountInfo<'info>,

    /// CHECK: Streamflow program
    pub streamflow_program: AccountInfo<'info>,

    // Remaining accounts:
    // - Investor accounts (alternating: stream_pubkey, investor_ata)
}

pub fn distribute_fees_handler(ctx: Context<DistributeFees>, page_index: u16) -> Result<()> {
    let policy = &ctx.accounts.policy;
    let progress = &mut ctx.accounts.progress;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;

    // === 1. TIME GATE & DAY MANAGEMENT ===
    let is_new_day = now >= progress.last_distribution_ts + DISTRIBUTION_WINDOW_SECONDS;

    if page_index == 0 {
        // First page must respect 24h gate
        require!(is_new_day, FeeRoutingError::DistributionWindowNotElapsed);

        // Reset state for new day
        progress.last_distribution_ts = now;
        progress.current_day = progress.current_day.checked_add(1)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;
        progress.daily_distributed_to_investors = 0;
        progress.current_page = 0;
        progress.pages_processed_today = 0;
        progress.creator_payout_sent = false;
    } else {
        // Subsequent pages must be same day
        require!(!is_new_day, FeeRoutingError::InvalidPageIndex);
        require!(page_index == progress.current_page, FeeRoutingError::InvalidPageIndex);
    }

    // === 2. CLAIM FEES FROM HONORARY POSITION ===
    // Only claim on first page to get fresh fee total
    let claimed_fees = if page_index == 0 {
        // TODO: CPI call to Meteora CP-AMM claim_position_fee
        // let cpi_accounts = MeteoraClaimFee {
        //     position: ctx.accounts.position.to_account_info(),
        //     position_owner: ctx.accounts.position_owner_pda.to_account_info(),
        //     treasury: ctx.accounts.treasury.to_account_info(),
        //     quote_mint: policy.quote_mint.to_account_info(),
        //     ...
        // };
        // let seeds = &[
        //     VAULT_SEED,
        //     ctx.accounts.vault.key().as_ref(),
        //     INVESTOR_FEE_POS_OWNER_SEED,
        //     &[bump]
        // ];
        // let signer_seeds = &[&seeds[..]];
        // let cpi_ctx = CpiContext::new_with_signer(
        //     ctx.accounts.cp_amm_program.to_account_info(),
        //     cpi_accounts,
        //     signer_seeds
        // );
        // let claimed = meteora_cp_amm::cpi::claim_fee(cpi_ctx)?;

        // For now, simulate by reading treasury balance
        // In production, this would return the actual claimed amount
        let claimed_amount = 0u64; // TODO: Get from CPI response

        emit!(QuoteFeesClaimed {
            amount: claimed_amount,
            timestamp: now,
            distribution_day: progress.current_day,
        });

        claimed_amount
    } else {
        // Subsequent pages don't claim, just distribute remaining
        0
    };

    // Add carry-over from previous cycles
    let total_available = claimed_fees
        .checked_add(progress.carry_over_lamports)
        .ok_or(FeeRoutingError::ArithmeticOverflow)?;

    // === 3. PARSE INVESTOR ACCOUNTS FROM REMAINING ===
    let remaining_accounts = &ctx.remaining_accounts;
    require!(
        remaining_accounts.len() % 2 == 0,
        FeeRoutingError::InvalidPageIndex
    );

    let investor_count = remaining_accounts.len() / 2;
    let mut locked_amounts: Vec<u64> = Vec::with_capacity(investor_count);
    let mut total_locked: u64 = 0;

    // Read locked amounts from Streamflow accounts
    for i in 0..investor_count {
        let _stream_account = &remaining_accounts[i * 2];

        // TODO: Deserialize Streamflow stream account and extract locked amount
        // This requires Streamflow program interface/IDL
        // let stream = Stream::try_deserialize(&mut &stream_account.data.borrow()[..])?;
        // let locked = stream.get_locked_amount(now)?;

        // For now, placeholder - in production would read from Streamflow
        let locked = 0u64; // TODO: Read from Streamflow account

        locked_amounts.push(locked);
        total_locked = total_locked
            .checked_add(locked)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;
    }

    // === 4. CALCULATE PRO-RATA DISTRIBUTION ===
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

    // === 5. DISTRIBUTE TO INVESTORS ===
    let mut page_total_distributed = 0u64;
    let mut investors_paid = 0u16;
    let mut accumulated_dust = 0u64;

    for i in 0..investor_count {
        let _investor_ata = &remaining_accounts[i * 2 + 1];
        let investor_locked = locked_amounts[i];

        // Calculate this investor's payout
        let payout = DistributionMath::calculate_investor_payout(
            investor_locked,
            total_locked,
            distributable,
        )?;

        // Check minimum threshold
        if DistributionMath::meets_minimum_threshold(payout, policy.min_payout_lamports) {
            // TODO: Execute token transfer via CPI
            // let cpi_accounts = Transfer {
            //     from: ctx.accounts.treasury.to_account_info(),
            //     to: investor_ata.to_account_info(),
            //     authority: treasury_authority.to_account_info(),
            // };
            // let cpi_ctx = CpiContext::new_with_signer(...);
            // token::transfer(cpi_ctx, payout)?;

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

    // === 6. UPDATE PROGRESS STATE ===
    progress.daily_distributed_to_investors = progress.daily_distributed_to_investors
        .checked_add(page_total_distributed)
        .ok_or(FeeRoutingError::ArithmeticOverflow)?;

    progress.carry_over_lamports = accumulated_dust
        .checked_add(new_carry_over)
        .ok_or(FeeRoutingError::ArithmeticOverflow)?;

    progress.current_page = progress.current_page.checked_add(1)
        .ok_or(FeeRoutingError::ArithmeticOverflow)?;
    progress.pages_processed_today = progress.pages_processed_today.checked_add(1)
        .ok_or(FeeRoutingError::ArithmeticOverflow)?;

    emit!(InvestorPayoutPage {
        page_index,
        investors_paid,
        total_distributed: page_total_distributed,
        timestamp: now,
    });

    // === 7. CREATOR PAYOUT (FINAL PAGE ONLY) ===
    // This is a simplified check - in production, caller would signal final page
    // or we'd track total investor count in Policy
    let is_final_page = true; // TODO: Determine based on total investors vs pages

    if is_final_page && !progress.creator_payout_sent {
        // Calculate remainder: total claimed minus investor allocation
        let remainder = total_available
            .checked_sub(investor_allocation)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;

        if remainder > 0 {
            // TODO: Transfer remainder to creator
            // let cpi_accounts = Transfer {
            //     from: ctx.accounts.treasury.to_account_info(),
            //     to: ctx.accounts.creator_ata.to_account_info(),
            //     authority: treasury_authority.to_account_info(),
            // };
            // token::transfer(cpi_ctx, remainder)?;

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
