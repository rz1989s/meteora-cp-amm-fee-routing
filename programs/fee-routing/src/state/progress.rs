use anchor_lang::prelude::*;

#[account]
pub struct Progress {
    /// Timestamp of last distribution start
    pub last_distribution_ts: i64,

    /// Current distribution day counter
    pub current_day: u64,

    /// Total distributed to investors in current day
    pub daily_distributed_to_investors: u64,

    /// Carry-over dust from previous pages/days
    pub carry_over_lamports: u64,

    /// Current page cursor (0-indexed)
    pub current_page: u16,

    /// Total pages processed in current day
    pub pages_processed_today: u16,

    /// Total investors in distribution set (for validation)
    pub total_investors: u16,

    /// Whether creator payout sent for current day
    pub creator_payout_sent: bool,

    /// Flag to track if base fees were detected on page 0
    pub has_base_fees: bool,

    /// Total rounding dust accumulated over lifetime (for transparency)
    pub total_rounding_dust: u64,

    /// Bump seed for PDA derivation
    pub bump: u8,
}

impl Progress {
    pub const LEN: usize = 8 + // discriminator
        8 + // last_distribution_ts
        8 + // current_day
        8 + // daily_distributed_to_investors
        8 + // carry_over_lamports
        2 + // current_page
        2 + // pages_processed_today
        2 + // total_investors
        1 + // creator_payout_sent
        1 + // has_base_fees
        8 + // total_rounding_dust
        1; // bump
}
