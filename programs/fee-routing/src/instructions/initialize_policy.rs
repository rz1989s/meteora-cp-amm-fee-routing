use anchor_lang::prelude::*;
use crate::{
    constants::*,
    state::Policy,
};

#[derive(Accounts)]
pub struct InitializePolicy<'info> {
    /// Authority that can initialize the policy (typically the creator)
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Policy PDA to be initialized
    #[account(
        init,
        payer = authority,
        space = Policy::LEN,
        seeds = [POLICY_SEED],
        bump
    )]
    pub policy: Account<'info, Policy>,

    /// System program
    pub system_program: Program<'info, System>,
}

pub fn initialize_policy_handler(
    ctx: Context<InitializePolicy>,
    y0: u64,
    investor_fee_share_bps: u16,
    daily_cap_lamports: u64,
    min_payout_lamports: u64,
    quote_mint: Pubkey,
    creator_wallet: Pubkey,
) -> Result<()> {
    let policy = &mut ctx.accounts.policy;

    policy.y0 = y0;
    policy.investor_fee_share_bps = investor_fee_share_bps;
    policy.daily_cap_lamports = daily_cap_lamports;
    policy.min_payout_lamports = min_payout_lamports;
    policy.quote_mint = quote_mint;
    policy.creator_wallet = creator_wallet;
    policy.authority = ctx.accounts.authority.key();
    policy.bump = ctx.bumps.policy;

    msg!("Policy initialized successfully");
    msg!("Y0: {}", y0);
    msg!("Investor Fee Share BPS: {}", investor_fee_share_bps);
    msg!("Quote Mint: {}", quote_mint);
    msg!("Creator Wallet: {}", creator_wallet);

    Ok(())
}
