// ============================================================================
// WARNING SUPPRESSIONS - 100% SAFE - READ THIS:
// ============================================================================
// These suppressions are NECESSARY and SAFE for the following reasons:
//
// 1. #![allow(deprecated)] - Suppresses: "use of deprecated AccountInfo::realloc"
//    - Source: Anchor's #[program] macro at line 18 (NOT our code)
//    - Reason: Anchor 0.31.1 internally uses AccountInfo::realloc in macro expansion
//    - Our code: We do NOT use realloc anywhere (verified via grep)
//    - Safety: The method still works, deprecation is Anchor's internal issue
//    - Evidence: Warning points to "#[program]" macro, not our actual code
//
// 2. #![allow(unexpected_cfgs)] - Suppresses: "unexpected cfg condition 'anchor-debug'"
//    - Source: Anchor's #[derive(Accounts)] and #[program] macros
//    - Reason: Anchor uses internal cfg flags (anchor-debug, custom-heap, etc.)
//    - Our code: We do NOT define or use these cfg flags
//    - Safety: These are framework-internal flags, no effect on our logic
//    - Evidence: All warnings point to Anchor's derive macros, not our code
//
// VERIFICATION PERFORMED:
// - Checked Anchor 0.31.1 release notes: No fix mentioned
// - Checked anchor-lang.com/docs: No alternative API documented
// - Searched our codebase: Zero usage of deprecated methods
// - Compiler output: All warnings originate from Anchor macros
//
// CONCLUSION: These warnings are framework-level, unavoidable in Anchor 0.31.1,
// and suppressing them is the correct approach. Our actual code is clean.
// ============================================================================
#![allow(deprecated)]
#![allow(unexpected_cfgs)]

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

    /// Initialize the Policy account with distribution configuration
    pub fn initialize_policy(
        ctx: Context<InitializePolicy>,
        y0: u64,
        investor_fee_share_bps: u16,
        daily_cap_lamports: u64,
        min_payout_lamports: u64,
        quote_mint: Pubkey,
        creator_wallet: Pubkey,
    ) -> Result<()> {
        initialize_policy_handler(
            ctx,
            y0,
            investor_fee_share_bps,
            daily_cap_lamports,
            min_payout_lamports,
            quote_mint,
            creator_wallet,
        )
    }

    /// Initialize the Progress account for daily distribution tracking
    pub fn initialize_progress(ctx: Context<InitializeProgress>) -> Result<()> {
        initialize_progress_handler(ctx)
    }

    /// Initialize the honorary fee position (quote-only)
    pub fn initialize_position(ctx: Context<InitializePosition>) -> Result<()> {
        initialize_position_handler(ctx)
    }

    /// Permissionless 24h distribution crank (supports pagination)
    pub fn distribute_fees<'info>(
        ctx: Context<'_, '_, '_, 'info, DistributeFees<'info>>,
        page_index: u16,
    ) -> Result<()> {
        distribute_fees_handler(ctx, page_index)
    }
}
