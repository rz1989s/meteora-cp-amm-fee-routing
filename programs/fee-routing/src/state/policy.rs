use anchor_lang::prelude::*;

#[account]
pub struct Policy {
    /// Total investor allocation at TGE
    pub y0: u64,

    /// Investor fee share in basis points (max 10000 = 100%)
    pub investor_fee_share_bps: u16,

    /// Optional daily cap in lamports (0 = no cap)
    pub daily_cap_lamports: u64,

    /// Minimum payout threshold in lamports
    pub min_payout_lamports: u64,

    /// Quote mint address
    pub quote_mint: Pubkey,

    /// Creator wallet for remainder payouts
    pub creator_wallet: Pubkey,

    /// Authority that can update policy
    pub authority: Pubkey,

    /// Bump seed for PDA derivation
    pub bump: u8,
}

impl Policy {
    pub const LEN: usize = 8 + // discriminator
        8 + // y0
        2 + // investor_fee_share_bps
        8 + // daily_cap_lamports
        8 + // min_payout_lamports
        32 + // quote_mint
        32 + // creator_wallet
        32 + // authority
        1; // bump
}
