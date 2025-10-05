use anchor_lang::prelude::*;
use crate::{constants::BPS_DENOMINATOR, errors::FeeRoutingError};

/// Pro-rata distribution calculation utilities
pub struct DistributionMath;

impl DistributionMath {
    /// Calculate locked fraction: f_locked(t) = locked_total(t) / Y0
    /// Returns basis points (0-10000 = 0%-100%)
    pub fn calculate_locked_fraction_bps(
        locked_total: u64,
        y0: u64,
    ) -> Result<u64> {
        require!(y0 > 0, FeeRoutingError::ArithmeticOverflow);

        if locked_total == 0 {
            return Ok(0);
        }

        // Guard against locked_total exceeding Y0
        if locked_total > y0 {
            return err!(FeeRoutingError::LockedExceedsTotal);
        }

        // Calculate fraction in basis points: (locked_total * 10000) / Y0
        let numerator = (locked_total as u128)
            .checked_mul(BPS_DENOMINATOR as u128)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;

        let fraction_bps = numerator
            .checked_div(y0 as u128)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;

        Ok(fraction_bps as u64)
    }

    /// Calculate eligible investor share (capped at max configured share)
    /// eligible_investor_share_bps = min(investor_fee_share_bps, floor(f_locked(t) * 10000))
    pub fn calculate_eligible_investor_share_bps(
        locked_fraction_bps: u64,
        max_investor_fee_share_bps: u16,
    ) -> u64 {
        locked_fraction_bps.min(max_investor_fee_share_bps as u64)
    }

    /// Calculate total fees allocated to investors
    /// investor_fee_quote = floor(claimed_quote * eligible_investor_share_bps / 10000)
    pub fn calculate_investor_allocation(
        claimed_quote: u64,
        eligible_share_bps: u64,
    ) -> Result<u64> {
        let numerator = (claimed_quote as u128)
            .checked_mul(eligible_share_bps as u128)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;

        let allocation = numerator
            .checked_div(BPS_DENOMINATOR as u128)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;

        Ok(allocation as u64)
    }

    /// Calculate per-investor payout based on their locked amount
    /// weight_i(t) = locked_i(t) / locked_total(t)
    /// payout_i = floor(investor_fee_quote * weight_i(t))
    pub fn calculate_investor_payout(
        investor_locked: u64,
        total_locked: u64,
        investor_allocation: u64,
    ) -> Result<u64> {
        require!(total_locked > 0, FeeRoutingError::ArithmeticOverflow);

        if investor_locked == 0 {
            return Ok(0);
        }

        // Calculate: (investor_allocation * investor_locked) / total_locked
        let numerator = (investor_allocation as u128)
            .checked_mul(investor_locked as u128)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;

        let payout = numerator
            .checked_div(total_locked as u128)
            .ok_or(FeeRoutingError::ArithmeticOverflow)?;

        Ok(payout as u64)
    }

    /// Apply daily cap to total distribution
    /// Returns (amount_to_distribute, carry_over_to_next_day)
    pub fn apply_daily_cap(
        total_available: u64,
        daily_cap: u64,
        already_distributed_today: u64,
    ) -> Result<(u64, u64)> {
        // If no cap (0), distribute everything
        if daily_cap == 0 {
            return Ok((total_available, 0));
        }

        let remaining_cap = daily_cap
            .checked_sub(already_distributed_today)
            .unwrap_or(0);

        if total_available <= remaining_cap {
            // Can distribute everything
            Ok((total_available, 0))
        } else {
            // Hit cap, carry over excess
            let carry_over = total_available
                .checked_sub(remaining_cap)
                .ok_or(FeeRoutingError::ArithmeticOverflow)?;
            Ok((remaining_cap, carry_over))
        }
    }

    /// Check if payout meets minimum threshold
    pub fn meets_minimum_threshold(
        payout: u64,
        min_threshold: u64,
    ) -> bool {
        payout >= min_threshold
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_locked_fraction_calculation() {
        // 50% locked
        let result = DistributionMath::calculate_locked_fraction_bps(5000, 10000).unwrap();
        assert_eq!(result, 5000); // 50% = 5000 bps

        // 100% locked
        let result = DistributionMath::calculate_locked_fraction_bps(10000, 10000).unwrap();
        assert_eq!(result, 10000); // 100% = 10000 bps

        // 0% locked
        let result = DistributionMath::calculate_locked_fraction_bps(0, 10000).unwrap();
        assert_eq!(result, 0);

        // 25% locked
        let result = DistributionMath::calculate_locked_fraction_bps(2500, 10000).unwrap();
        assert_eq!(result, 2500);
    }

    #[test]
    fn test_eligible_share_with_cap() {
        // Locked fraction below cap
        let result = DistributionMath::calculate_eligible_investor_share_bps(3000, 5000);
        assert_eq!(result, 3000);

        // Locked fraction above cap
        let result = DistributionMath::calculate_eligible_investor_share_bps(8000, 5000);
        assert_eq!(result, 5000);

        // Locked fraction equals cap
        let result = DistributionMath::calculate_eligible_investor_share_bps(5000, 5000);
        assert_eq!(result, 5000);
    }

    #[test]
    fn test_investor_allocation() {
        // 50% share of 10000 tokens = 5000
        let result = DistributionMath::calculate_investor_allocation(10000, 5000).unwrap();
        assert_eq!(result, 5000);

        // 25% share of 10000 tokens = 2500
        let result = DistributionMath::calculate_investor_allocation(10000, 2500).unwrap();
        assert_eq!(result, 2500);

        // 100% share
        let result = DistributionMath::calculate_investor_allocation(10000, 10000).unwrap();
        assert_eq!(result, 10000);
    }

    #[test]
    fn test_investor_payout() {
        // Investor with 30% of locked tokens gets 30% of allocation
        let result = DistributionMath::calculate_investor_payout(3000, 10000, 5000).unwrap();
        assert_eq!(result, 1500);

        // Investor with 50% of locked tokens
        let result = DistributionMath::calculate_investor_payout(5000, 10000, 5000).unwrap();
        assert_eq!(result, 2500);

        // Investor with 0 locked tokens
        let result = DistributionMath::calculate_investor_payout(0, 10000, 5000).unwrap();
        assert_eq!(result, 0);
    }

    #[test]
    fn test_daily_cap_application() {
        // No cap (0 = unlimited)
        let (distribute, carry) = DistributionMath::apply_daily_cap(10000, 0, 0).unwrap();
        assert_eq!(distribute, 10000);
        assert_eq!(carry, 0);

        // Within cap
        let (distribute, carry) = DistributionMath::apply_daily_cap(5000, 10000, 0).unwrap();
        assert_eq!(distribute, 5000);
        assert_eq!(carry, 0);

        // Exceeds cap
        let (distribute, carry) = DistributionMath::apply_daily_cap(15000, 10000, 0).unwrap();
        assert_eq!(distribute, 10000);
        assert_eq!(carry, 5000);

        // With partial distribution already done
        let (distribute, carry) = DistributionMath::apply_daily_cap(8000, 10000, 3000).unwrap();
        assert_eq!(distribute, 7000); // Only 7000 left in cap
        assert_eq!(carry, 1000);
    }

    #[test]
    fn test_minimum_threshold() {
        assert!(DistributionMath::meets_minimum_threshold(1000, 500));
        assert!(DistributionMath::meets_minimum_threshold(500, 500));
        assert!(!DistributionMath::meets_minimum_threshold(499, 500));
        assert!(!DistributionMath::meets_minimum_threshold(0, 1));
    }
}
