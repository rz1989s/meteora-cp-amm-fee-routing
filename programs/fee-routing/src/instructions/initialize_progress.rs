use anchor_lang::prelude::*;
use crate::{
    constants::*,
    state::Progress,
};

#[derive(Accounts)]
pub struct InitializeProgress<'info> {
    /// Authority that can initialize the progress (typically the creator)
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Progress PDA to be initialized
    #[account(
        init,
        payer = authority,
        space = Progress::LEN,
        seeds = [PROGRESS_SEED],
        bump
    )]
    pub progress: Account<'info, Progress>,

    /// System program
    pub system_program: Program<'info, System>,
}

pub fn initialize_progress_handler(ctx: Context<InitializeProgress>) -> Result<()> {
    let progress = &mut ctx.accounts.progress;

    // Initialize with default values
    progress.last_distribution_ts = 0;
    progress.current_day = 0;
    progress.daily_distributed_to_investors = 0;
    progress.carry_over_lamports = 0;
    progress.current_page = 0;
    progress.pages_processed_today = 0;
    progress.total_investors = 0;
    progress.creator_payout_sent = false;
    progress.bump = ctx.bumps.progress;

    msg!("Progress initialized successfully");

    Ok(())
}
