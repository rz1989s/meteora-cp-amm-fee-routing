/// Seed for vault-related PDAs
pub const VAULT_SEED: &[u8] = b"vault";

/// Seed for investor fee position owner PDA
pub const INVESTOR_FEE_POS_OWNER_SEED: &[u8] = b"investor_fee_pos_owner";

/// Seed for policy configuration PDA
pub const POLICY_SEED: &[u8] = b"policy";

/// Seed for distribution progress tracking PDA
pub const PROGRESS_SEED: &[u8] = b"progress";

/// Seed for program quote treasury
pub const TREASURY_SEED: &[u8] = b"treasury";

/// Seconds in 24 hours
pub const DISTRIBUTION_WINDOW_SECONDS: i64 = 86_400;

/// Basis points denominator (10000 = 100%)
pub const BPS_DENOMINATOR: u64 = 10_000;

/// Maximum investors per page during distribution
/// This limit ensures transactions stay within Solana's account limit
/// and compute budget. Adjust based on gas profiling.
pub const MAX_INVESTORS_PER_PAGE: usize = 100;
