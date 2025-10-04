use anchor_lang::prelude::*;

#[error_code]
pub enum FeeRoutingError {
    #[msg("Position must accrue fees in quote mint only")]
    BaseFeesNotAllowed,

    #[msg("Distribution can only be called once per 24 hour window")]
    DistributionWindowNotElapsed,

    #[msg("Invalid page index for current distribution day")]
    InvalidPageIndex,

    #[msg("Investor payout below minimum threshold")]
    PayoutBelowMinimum,

    #[msg("Daily distribution cap exceeded")]
    DailyCapExceeded,

    #[msg("Arithmetic overflow in fee calculation")]
    ArithmeticOverflow,

    #[msg("Invalid quote mint provided")]
    InvalidQuoteMint,

    #[msg("Total locked amount exceeds Y0")]
    LockedExceedsTotal,

    #[msg("All pages for current day already processed")]
    AllPagesProcessed,

    #[msg("Creator payout already sent for this day")]
    CreatorPayoutAlreadySent,

    #[msg("Invalid Streamflow account provided")]
    InvalidStreamflowAccount,

    #[msg("Invalid pool authority provided")]
    InvalidPoolAuthority,

    #[msg("Invalid program ID provided")]
    InvalidProgram,

    #[msg("Invalid treasury authority")]
    InvalidTreasuryAuthority,

    #[msg("Base token fees detected - position must be quote-only")]
    BaseFeesDetected,
}
