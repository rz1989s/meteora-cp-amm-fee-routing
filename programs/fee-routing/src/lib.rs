use anchor_lang::prelude::*;

declare_id!("RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce");

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod math;
pub mod meteora;
pub mod state;

use instructions::*;

#[program]
pub mod fee_routing {
    use super::*;

    /// Initialize the honorary fee position (quote-only)
    pub fn initialize_position(ctx: Context<InitializePosition>) -> Result<()> {
        initialize_position_handler(ctx)
    }

    /// Permissionless 24h distribution crank (supports pagination)
    pub fn distribute_fees(
        ctx: Context<DistributeFees>,
        page_index: u16,
    ) -> Result<()> {
        distribute_fees_handler(ctx, page_index)
    }
}
