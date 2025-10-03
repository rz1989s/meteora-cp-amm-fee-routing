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

pub fn handler(ctx: Context<DistributeFees>, page_index: u16) -> Result<()> {
    let policy = &ctx.accounts.policy;
    let progress = &mut ctx.accounts.progress;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;

    // TODO: Implement distribution logic
    // 1. Check 24h gate for first page of new day
    // 2. Claim fees from honorary position (quote only)
    // 3. Read locked amounts from Streamflow for investors
    // 4. Calculate eligible_investor_share_bps based on f_locked(t)
    // 5. Distribute pro-rata to investors (handle dust, caps)
    // 6. On final page, route remainder to creator
    // 7. Update progress state
    // 8. Emit appropriate events

    Ok(())
}
