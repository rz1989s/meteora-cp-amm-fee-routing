use anchor_lang::prelude::*;
use crate::{constants::*, errors::FeeRoutingError, events::HonoraryPositionInitialized};

#[derive(Accounts)]
pub struct InitializePosition<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: PDA that will own the honorary position
    #[account(
        seeds = [VAULT_SEED, vault.key().as_ref(), INVESTOR_FEE_POS_OWNER_SEED],
        bump
    )]
    pub position_owner_pda: AccountInfo<'info>,

    /// CHECK: Vault account reference
    pub vault: AccountInfo<'info>,

    /// CHECK: The honorary position account to be created
    #[account(mut)]
    pub position: AccountInfo<'info>,

    /// CHECK: Quote mint validation happens in handler
    pub quote_mint: AccountInfo<'info>,

    /// CHECK: Meteora CP-AMM program
    pub cp_amm_program: AccountInfo<'info>,

    /// CHECK: Pool account
    pub pool: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializePosition>) -> Result<()> {
    // TODO: Implement position initialization logic
    // 1. Validate pool token order and confirm quote mint
    // 2. Create empty DLMM v2 position owned by PDA
    // 3. Validate position will only accrue quote fees
    // 4. Emit HonoraryPositionInitialized event

    emit!(HonoraryPositionInitialized {
        position: ctx.accounts.position.key(),
        owner_pda: ctx.accounts.position_owner_pda.key(),
        quote_mint: ctx.accounts.quote_mint.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
