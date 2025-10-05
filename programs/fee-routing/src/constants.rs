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
///
/// This limit ensures transactions stay within Solana's constraints:
/// - Account limit: 64 accounts max (each investor = 2 accounts: stream + ATA)
/// - Compute budget: 200,000 CU default (can request up to 1.4M with compute budget instruction)
///
/// WARNING: 100 investors may exceed 200k CU budget and require compute budget request.
/// Each investor adds approximately:
/// - 1 Streamflow account deserialization (~5k CU)
/// - 1 token account deserialization (~2k CU)
/// - 1 token transfer CPI (~3k CU)
/// - Math calculations (~1k CU)
/// - Total: ~11k CU per investor
///
/// Estimated CU usage:
/// - 50 investors: ~550k CU (requires compute budget request)
/// - 75 investors: ~825k CU (requires compute budget request)
/// - 100 investors: ~1.1M CU (requires compute budget request)
///
/// RECOMMENDATION: Profile actual CU usage with anchor test --compute-units
/// and adjust this constant OR implement compute budget request in client code.
/// Consider starting with MAX_INVESTORS_PER_PAGE = 50 for safety.
pub const MAX_INVESTORS_PER_PAGE: usize = 100;
