// Meteora DAMM V2 / CP-AMM CPI Integration
//
// This module provides CPI wrappers for interacting with Meteora's
// Constant Product AMM (CP-AMM) program for position creation and fee claiming.
//
// Program ID: cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG
// Pool Authority: HLnpSz9h2S4hiLQ43rnSD9XkcUThA7B8hQMKmDaiTLcC

use anchor_lang::prelude::*;
use anchor_lang::solana_program;

/// Meteora CP-AMM Program ID
/// cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG
pub fn cp_amm_program_id() -> Pubkey {
    "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG".parse().unwrap()
}

/// Pool Authority (constant address used by all pools)
/// HLnpSz9h2S4hiLQ43rnSD9XkcUThA7B8hQMKmDaiTLcC
pub fn pool_authority() -> Pubkey {
    "HLnpSz9h2S4hiLQ43rnSD9XkcUThA7B8hQMKmDaiTLcC".parse().unwrap()
}

/// Event authority seed for Meteora program
pub const EVENT_AUTHORITY_SEED: &[u8] = b"__event_authority";

/// Position NFT account seed
pub const POSITION_NFT_ACCOUNT_SEED: &[u8] = b"position_nft_account";

/// Position account seed
pub const POSITION_SEED: &[u8] = b"position";

// Instruction discriminators (from IDL)
/// CreatePosition instruction discriminator
pub const CREATE_POSITION_IX: [u8; 8] = [48, 215, 197, 153, 96, 203, 180, 133];

/// ClaimPositionFee instruction discriminator
pub const CLAIM_POSITION_FEE_IX: [u8; 8] = [180, 38, 154, 17, 133, 33, 162, 211];

/// Account structure for CreatePosition CPI call
///
/// This instruction creates a new NFT-based position in a CP-AMM pool.
/// The position is owned by whoever holds the position NFT.
#[derive(Accounts)]
pub struct CreatePositionCPI<'info> {
    /// Owner of the position NFT (can be a PDA)
    /// CHECK: Can be any account, position controlled by NFT ownership
    pub owner: AccountInfo<'info>,

    /// Position NFT mint (must be signer - new keypair)
    /// CHECK: Must sign as mint authority
    pub position_nft_mint: Signer<'info>,

    /// Position NFT token account
    /// PDA: [b"position_nft_account", position_nft_mint]
    /// CHECK: Verified by Meteora program
    #[account(mut)]
    pub position_nft_account: AccountInfo<'info>,

    /// The CP-AMM pool
    /// CHECK: Verified by Meteora program
    #[account(mut)]
    pub pool: AccountInfo<'info>,

    /// Position data account
    /// PDA: [b"position", position_nft_mint]
    /// CHECK: Verified by Meteora program
    #[account(mut)]
    pub position: AccountInfo<'info>,

    /// Pool authority (constant address)
    /// CHECK: Must match POOL_AUTHORITY constant
    pub pool_authority: AccountInfo<'info>,

    /// Payer for account creation
    /// CHECK: Payer account
    #[account(mut)]
    pub payer: AccountInfo<'info>,

    /// Rent sysvar
    /// CHECK: Rent sysvar
    pub rent: AccountInfo<'info>,

    /// Token program
    /// CHECK: Token program
    pub token_program: AccountInfo<'info>,

    /// System program
    /// CHECK: System program
    pub system_program: AccountInfo<'info>,

    /// Event authority PDA
    /// Seeds: [b"__event_authority"]
    /// CHECK: Verified by seeds
    pub event_authority: AccountInfo<'info>,

    /// Meteora CP-AMM program
    /// CHECK: Must be CP_AMM_PROGRAM_ID
    pub program: AccountInfo<'info>,
}

/// Account structure for ClaimPositionFee CPI call
///
/// This instruction claims accrued fees from a position.
/// Fees are transferred to the owner's token accounts.
#[derive(Accounts)]
pub struct ClaimPositionFeeCPI<'info> {
    /// Pool authority (constant)
    /// CHECK: Must match POOL_AUTHORITY
    pub pool_authority: AccountInfo<'info>,

    /// The CP-AMM pool
    /// CHECK: Verified by Meteora program
    pub pool: AccountInfo<'info>,

    /// Position data account
    /// CHECK: Verified by Meteora program
    #[account(mut)]
    pub position: AccountInfo<'info>,

    /// Owner's token A account (destination)
    /// CHECK: Verified by Meteora program
    #[account(mut)]
    pub token_a_account: AccountInfo<'info>,

    /// Owner's token B account (destination)
    /// CHECK: Verified by Meteora program
    #[account(mut)]
    pub token_b_account: AccountInfo<'info>,

    /// Pool's token A vault (source)
    /// CHECK: Verified by Meteora program
    #[account(mut)]
    pub token_a_vault: AccountInfo<'info>,

    /// Pool's token B vault (source)
    /// CHECK: Verified by Meteora program
    #[account(mut)]
    pub token_b_vault: AccountInfo<'info>,

    /// Token A mint
    /// CHECK: Verified by Meteora program
    pub token_a_mint: AccountInfo<'info>,

    /// Token B mint
    /// CHECK: Verified by Meteora program
    pub token_b_mint: AccountInfo<'info>,

    /// Position NFT token account (for authority check)
    /// CHECK: Verified by Meteora program
    pub position_nft_account: AccountInfo<'info>,

    /// Owner of the position NFT (must sign)
    /// CHECK: Signer authority
    pub owner: AccountInfo<'info>,

    /// Token A program
    /// CHECK: Token program
    pub token_a_program: AccountInfo<'info>,

    /// Token B program
    /// CHECK: Token program
    pub token_b_program: AccountInfo<'info>,

    /// Event authority
    /// CHECK: Verified by seeds
    pub event_authority: AccountInfo<'info>,

    /// Meteora CP-AMM program
    /// CHECK: Must be CP_AMM_PROGRAM_ID
    pub program: AccountInfo<'info>,
}

/// Helper function to invoke CreatePosition via CPI
pub fn create_position_cpi<'info>(
    accounts: &CreatePositionCPI<'info>,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    // Build account metas
    let account_metas = vec![
        AccountMeta::new_readonly(accounts.owner.key(), false),
        AccountMeta::new(accounts.position_nft_mint.key(), true),
        AccountMeta::new(accounts.position_nft_account.key(), false),
        AccountMeta::new(accounts.pool.key(), false),
        AccountMeta::new(accounts.position.key(), false),
        AccountMeta::new_readonly(accounts.pool_authority.key(), false),
        AccountMeta::new(accounts.payer.key(), true),
        AccountMeta::new_readonly(accounts.rent.to_account_info().key(), false),
        AccountMeta::new_readonly(accounts.token_program.key(), false),
        AccountMeta::new_readonly(accounts.system_program.key(), false),
        AccountMeta::new_readonly(accounts.event_authority.key(), false),
        AccountMeta::new_readonly(accounts.program.key(), false),
    ];

    // Build instruction data (discriminator + no arguments)
    let instruction_data = CREATE_POSITION_IX.to_vec();

    // Build instruction
    let instruction = solana_program::instruction::Instruction {
        program_id: cp_amm_program_id(),
        accounts: account_metas,
        data: instruction_data,
    };

    // Build account infos
    let account_infos = vec![
        accounts.owner.to_account_info(),
        accounts.position_nft_mint.to_account_info(),
        accounts.position_nft_account.to_account_info(),
        accounts.pool.to_account_info(),
        accounts.position.to_account_info(),
        accounts.pool_authority.to_account_info(),
        accounts.payer.to_account_info(),
        accounts.rent.to_account_info(),
        accounts.token_program.to_account_info(),
        accounts.system_program.to_account_info(),
        accounts.event_authority.to_account_info(),
        accounts.program.to_account_info(),
    ];

    // Invoke CPI
    solana_program::program::invoke_signed(&instruction, &account_infos, signer_seeds)?;

    Ok(())
}

/// Helper function to invoke ClaimPositionFee via CPI
pub fn claim_position_fee_cpi<'info>(
    accounts: &ClaimPositionFeeCPI<'info>,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    // Build account metas
    let account_metas = vec![
        AccountMeta::new_readonly(accounts.pool_authority.key(), false),
        AccountMeta::new_readonly(accounts.pool.key(), false),
        AccountMeta::new(accounts.position.key(), false),
        AccountMeta::new(accounts.token_a_account.key(), false),
        AccountMeta::new(accounts.token_b_account.key(), false),
        AccountMeta::new(accounts.token_a_vault.key(), false),
        AccountMeta::new(accounts.token_b_vault.key(), false),
        AccountMeta::new_readonly(accounts.token_a_mint.key(), false),
        AccountMeta::new_readonly(accounts.token_b_mint.key(), false),
        AccountMeta::new_readonly(accounts.position_nft_account.key(), false),
        AccountMeta::new_readonly(accounts.owner.key(), true),
        AccountMeta::new_readonly(accounts.token_a_program.key(), false),
        AccountMeta::new_readonly(accounts.token_b_program.key(), false),
        AccountMeta::new_readonly(accounts.event_authority.key(), false),
        AccountMeta::new_readonly(accounts.program.key(), false),
    ];

    // Build instruction data (discriminator + no arguments)
    let instruction_data = CLAIM_POSITION_FEE_IX.to_vec();

    // Build instruction
    let instruction = solana_program::instruction::Instruction {
        program_id: cp_amm_program_id(),
        accounts: account_metas,
        data: instruction_data,
    };

    // Build account infos
    let account_infos = vec![
        accounts.pool_authority.to_account_info(),
        accounts.pool.to_account_info(),
        accounts.position.to_account_info(),
        accounts.token_a_account.to_account_info(),
        accounts.token_b_account.to_account_info(),
        accounts.token_a_vault.to_account_info(),
        accounts.token_b_vault.to_account_info(),
        accounts.token_a_mint.to_account_info(),
        accounts.token_b_mint.to_account_info(),
        accounts.position_nft_account.to_account_info(),
        accounts.owner.to_account_info(),
        accounts.token_a_program.to_account_info(),
        accounts.token_b_program.to_account_info(),
        accounts.event_authority.to_account_info(),
        accounts.program.to_account_info(),
    ];

    // Invoke CPI
    solana_program::program::invoke_signed(&instruction, &account_infos, signer_seeds)?;

    Ok(())
}
