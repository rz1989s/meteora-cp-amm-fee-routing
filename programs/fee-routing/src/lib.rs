use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

#[program]
pub mod fee_routing {
    use super::*;

    /// Initialize the honorary fee position (quote-only)
    pub fn initialize_position(ctx: Context<InitializePosition>) -> Result<()> {
        instructions::initialize_position::handler(ctx)
    }

    /// Permissionless 24h distribution crank (supports pagination)
    pub fn distribute_fees(
        ctx: Context<DistributeFees>,
        page_index: u16,
    ) -> Result<()> {
        instructions::distribute_fees::handler(ctx, page_index)
    }
}
