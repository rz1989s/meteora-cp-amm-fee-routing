use anchor_lang::prelude::*;

#[event]
pub struct HonoraryPositionInitialized {
    pub position: Pubkey,
    pub owner_pda: Pubkey,
    pub quote_mint: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct QuoteFeesClaimed {
    pub amount: u64,
    pub timestamp: i64,
    pub distribution_day: u64,
}

#[event]
pub struct InvestorPayoutPage {
    pub page_index: u16,
    pub investors_paid: u16,
    pub total_distributed: u64,
    pub rounding_dust: u64,
    pub timestamp: i64,
}

#[event]
pub struct CreatorPayoutDayClosed {
    pub day: u64,
    pub creator_amount: u64,
    pub total_distributed_to_investors: u64,
    pub timestamp: i64,
}
