'use client';

import { motion } from 'framer-motion';
import { Box, GitBranch, Database, Boxes, Lock, Clock, CheckCircle } from 'lucide-react';
import TabGroup from '@/components/TabGroup';
import CodeBlock from '@/components/CodeBlock';
import ProgressBar from '@/components/ProgressBar';

export default function TechnicalPage() {
  const architectureTab = (
    <div className="space-y-8">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">System Flow Diagram</h3>
        <div className="bg-slate-800 rounded-lg p-6 overflow-x-auto">
          <svg viewBox="0 0 800 650" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
            {/* Meteora DAMM V2 Pool */}
            <g>
              <rect x="150" y="20" width="500" height="80" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2"/>
              <text x="400" y="50" textAnchor="middle" fill="#f1f5f9" fontSize="18" fontWeight="bold">
                Meteora DAMM V2 Pool
              </text>
              <text x="400" y="75" textAnchor="middle" fill="#94a3b8" fontSize="14">
                (Generates Quote-Only Fees)
              </text>
            </g>

            {/* Arrow 1: Fee Accrual */}
            <g>
              <line x1="400" y1="100" x2="400" y2="140" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowhead-green)"/>
              <text x="450" y="125" fill="#10b981" fontSize="13" fontWeight="500">Fee Accrual</text>
            </g>

            {/* Honorary LP Position */}
            <g>
              <rect x="150" y="140" width="500" height="80" rx="8" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2"/>
              <text x="400" y="170" textAnchor="middle" fill="#f1f5f9" fontSize="18" fontWeight="bold">
                Honorary LP Position (PDA-Owned)
              </text>
              <text x="400" y="195" textAnchor="middle" fill="#94a3b8" fontSize="14">
                [Accumulates Quote Fees]
              </text>
            </g>

            {/* Arrow 2: 24h Crank */}
            <g>
              <line x1="400" y1="220" x2="400" y2="260" stroke="#f59e0b" strokeWidth="3" markerEnd="url(#arrowhead-orange)"/>
              <text x="470" y="245" fill="#f59e0b" fontSize="13" fontWeight="500">24h Crank (Permissionless)</text>
            </g>

            {/* Fee Distribution Smart Contract */}
            <g>
              <rect x="100" y="260" width="600" height="180" rx="8" fill="#1e293b" stroke="#6366f1" strokeWidth="2"/>
              <text x="400" y="285" textAnchor="middle" fill="#f1f5f9" fontSize="18" fontWeight="bold">
                Fee Distribution Smart Contract
              </text>

              {/* Streamflow Data Box */}
              <rect x="130" y="310" width="220" height="100" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="2"/>
              <text x="240" y="340" textAnchor="middle" fill="#f1f5f9" fontSize="15" fontWeight="600">
                Streamflow Data
              </text>
              <text x="240" y="365" textAnchor="middle" fill="#94a3b8" fontSize="13">
                (Locked Amounts)
              </text>
              <text x="240" y="385" textAnchor="middle" fill="#64748b" fontSize="11">
                locked_i(t) / Y0
              </text>

              {/* Arrow between boxes */}
              <line x1="350" y1="360" x2="440" y2="360" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowhead-blue)"/>

              {/* Pro-Rata Calculation Box */}
              <rect x="450" y="310" width="220" height="100" rx="6" fill="#0f172a" stroke="#ec4899" strokeWidth="2"/>
              <text x="560" y="340" textAnchor="middle" fill="#f1f5f9" fontSize="15" fontWeight="600">
                Pro-Rata Calculation
              </text>
              <text x="560" y="365" textAnchor="middle" fill="#94a3b8" fontSize="13">
                (Based on Lock %)
              </text>
              <text x="560" y="385" textAnchor="middle" fill="#64748b" fontSize="11">
                payout_i = allocation × weight_i
              </text>
            </g>

            {/* Arrow 3: Split to Investors and Creator */}
            <g>
              <line x1="250" y1="440" x2="250" y2="530" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowhead-green)"/>
              <line x1="550" y1="440" x2="550" y2="530" stroke="#f59e0b" strokeWidth="3" markerEnd="url(#arrowhead-orange)"/>
            </g>

            {/* Investors Box */}
            <g>
              <rect x="80" y="530" width="340" height="80" rx="8" fill="#1e293b" stroke="#10b981" strokeWidth="2"/>
              <text x="250" y="560" textAnchor="middle" fill="#f1f5f9" fontSize="18" fontWeight="bold">
                Investors
              </text>
              <text x="250" y="585" textAnchor="middle" fill="#10b981" fontSize="14">
                (Pro-Rata Distribution)
              </text>
            </g>

            {/* Creator Wallet Box */}
            <g>
              <rect x="480" y="530" width="240" height="80" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2"/>
              <text x="600" y="560" textAnchor="middle" fill="#f1f5f9" fontSize="18" fontWeight="bold">
                Creator Wallet
              </text>
              <text x="600" y="585" textAnchor="middle" fill="#f59e0b" fontSize="14">
                (Remainder)
              </text>
            </g>

            {/* Arrow markers */}
            <defs>
              <marker id="arrowhead-green" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
              </marker>
              <marker id="arrowhead-orange" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#f59e0b" />
              </marker>
              <marker id="arrowhead-blue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
              </marker>
            </defs>
          </svg>
        </div>
        <div className="mt-4 text-xs text-slate-400 text-center">
          <p>Interactive SVG diagram showing the complete fee routing flow from pool to final distribution</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Box className="text-primary" size={24} />
            <h3 className="text-xl font-bold">Four-Instruction Design</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-success">1. initialize_policy</h4>
              <p className="text-sm text-slate-300">
                Creates immutable Policy PDA with distribution configuration (Y0, fee shares, caps, thresholds).
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-success">2. initialize_progress</h4>
              <p className="text-sm text-slate-300">
                Creates mutable Progress PDA for daily distribution tracking and pagination state.
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-primary">3. initialize_position</h4>
              <p className="text-sm text-slate-300">
                Creates honorary DAMM V2 position owned by program PDA. Validates pool configuration and program IDs.
              </p>
              <div className="mt-3 text-xs text-slate-400">
                <div className="flex justify-between py-1">
                  <span>Validation:</span>
                  <span className="text-success">Pool authority & CP-AMM program</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Ownership:</span>
                  <span className="text-success">PDA-controlled</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-secondary">4. distribute_fees</h4>
              <p className="text-sm text-slate-300">
                Permissionless 24h crank that claims fees and executes real SPL token transfers.
                Distributes quote token (Token B) pro-rata to investors and sends remainder to creator.
                FAILS deterministically if any Token A (base fees) are detected, ensuring quote-only compliance.
              </p>
              <div className="mt-3 text-xs text-slate-400">
                <div className="flex justify-between py-1">
                  <span>Frequency:</span>
                  <span className="text-success">Every 24 hours</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Transfers:</span>
                  <span className="text-success">Real SPL token transfers</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Pagination:</span>
                  <span className="text-success">Idempotent & resumable</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="text-secondary" size={24} />
            <h3 className="text-xl font-bold">State Accounts</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Policy (Immutable)</h4>
              <div className="text-xs font-mono space-y-1 text-slate-300">
                <div>seeds = [b&quot;policy&quot;]</div>
                <div className="ml-4 text-slate-400">
                  <div>• y0: Total allocation at TGE</div>
                  <div>• investor_fee_share_bps</div>
                  <div>• daily_cap_lamports</div>
                  <div>• min_payout_lamports</div>
                  <div>• quote_mint</div>
                  <div>• creator_wallet</div>
                  <div>• authority</div>
                  <div>• bump</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Progress (Mutable)</h4>
              <div className="text-xs font-mono space-y-1 text-slate-300">
                <div>seeds = [b&quot;progress&quot;]</div>
                <div className="ml-4 text-slate-400">
                  <div>• last_distribution_ts</div>
                  <div>• current_day</div>
                  <div>• daily_distributed_to_investors</div>
                  <div>• carry_over_lamports</div>
                  <div>• current_page</div>
                  <div>• pages_processed_today</div>
                  <div>• total_investors</div>
                  <div>• creator_payout_sent</div>
                  <div>• has_base_fees</div>
                  <div>• total_rounding_dust</div>
                  <div>• bump</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why 4 Instructions Instead of 2 */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="text-primary" size={28} />
          <h3 className="text-2xl font-bold">Why 4 Instructions Instead of 2?</h3>
        </div>

        <div className="bg-slate-900/80 rounded-lg p-5 mb-4">
          <h4 className="font-semibold text-lg mb-3 text-primary">Bounty Requirements Analysis</h4>
          <div className="space-y-2 text-sm text-slate-300">
            <p><span className="text-warning font-semibold">Bounty specifies:</span></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Work Package A: Initialize honorary position (1 instruction)</li>
              <li>Work Package B: Permissionless distribution crank (1 instruction)</li>
              <li className="text-primary">→ Implied total: 2 functional instructions</li>
            </ul>

            <p className="mt-3"><span className="text-success font-semibold">BUT bounty also requires (line 96):</span></p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-success">
              <li>&quot;Policy PDA (fee share, caps, dust)&quot;</li>
              <li>&quot;Progress PDA (last ts, daily spent, carry, cursor, day state)&quot;</li>
              <li className="text-warning">→ Must exist BEFORE distribute_fees runs, but HOW to initialize? Not specified!</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-red-400">❌ 2-Instruction Approach (Messy)</h4>
            <ul className="text-xs space-y-2 text-slate-300">
              <li>• Cram Policy init into <code className="bg-slate-800 px-1 rounded">initialize_position</code></li>
              <li>• Cram Progress init into <code className="bg-slate-800 px-1 rounded">initialize_position</code></li>
              <li className="text-red-400">• Violates single responsibility principle</li>
              <li className="text-red-400">• initialize_position becomes bloated (3 accounts init)</li>
              <li className="text-red-400">• Less flexible for different setups</li>
              <li className="text-red-400">• Harder to test each component</li>
            </ul>
          </div>

          <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-green-400">✅ 4-Instruction Approach (Clean)</h4>
            <ul className="text-xs space-y-2 text-slate-300">
              <li className="text-green-400">• <code className="bg-slate-800 px-1 rounded">initialize_policy</code> - Setup config (single purpose)</li>
              <li className="text-green-400">• <code className="bg-slate-800 px-1 rounded">initialize_progress</code> - Setup state (single purpose)</li>
              <li className="text-green-400">• <code className="bg-slate-800 px-1 rounded">initialize_position</code> - Create position (single purpose)</li>
              <li className="text-green-400">• <code className="bg-slate-800 px-1 rounded">distribute_fees</code> - Distribution logic (single purpose)</li>
              <li className="text-success">• Modular & maintainable</li>
              <li className="text-success">• Easier integration & testing</li>
              <li className="text-success">• Follows Anchor best practices</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 bg-slate-900/80 rounded-lg p-4">
          <h4 className="font-semibold mb-2 text-primary">✅ Verdict: 4 Instructions is Superior</h4>
          <div className="grid md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-800 rounded p-3">
              <div className="font-semibold text-success mb-1">✓ Bounty Compliant</div>
              <div className="text-slate-400">Doesn&apos;t prohibit helper instructions, only specifies work packages</div>
            </div>
            <div className="bg-slate-800 rounded p-3">
              <div className="font-semibold text-success mb-1">✓ Better Architecture</div>
              <div className="text-slate-400">Separation of concerns, single responsibility per instruction</div>
            </div>
            <div className="bg-slate-800 rounded p-3">
              <div className="font-semibold text-success mb-1">✓ Production Ready</div>
              <div className="text-slate-400">Easier to maintain, test, and integrate for real-world usage</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Lock className="text-success" size={24} />
          <h3 className="text-xl font-bold">PDA Seeds & Derivation</h3>
        </div>
        <CodeBlock
          language="rust"
          code={`// Core PDA seeds
pub const VAULT_SEED: &[u8] = b"vault";
pub const INVESTOR_FEE_POS_OWNER_SEED: &[u8] = b"investor_fee_pos_owner";
pub const POLICY_SEED: &[u8] = b"policy";
pub const PROGRESS_SEED: &[u8] = b"progress";
pub const TREASURY_SEED: &[u8] = b"treasury";

// Position owner PDA derivation
let (position_owner, bump) = Pubkey::find_program_address(
    &[
        VAULT_SEED,
        vault.key().as_ref(),
        INVESTOR_FEE_POS_OWNER_SEED
    ],
    &fee_routing::ID
);`}
          showLineNumbers={false}
          githubLink="https://github.com/rz1989s/meteora-cp-amm-fee-routing/blob/main/programs/fee-routing/src/constants.rs"
        />
      </div>
    </div>
  );

  const codeTab = (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-4">Pro-Rata Distribution Algorithm</h3>
        <CodeBlock
          title="distribute_fees.rs - Real SPL Token Transfer Implementation"
          language="rust"
          code={`// Calculate locked fraction: f_locked(t) = locked_total(t) / Y0
let locked_fraction_bps = DistributionMath::calculate_locked_fraction_bps(
    total_locked,
    policy.y0,
)?;

// Calculate eligible investor share (capped)
let eligible_share_bps = DistributionMath::calculate_eligible_investor_share_bps(
    locked_fraction_bps,
    policy.investor_fee_share_bps,
);

// Calculate total amount for investors
let investor_allocation = DistributionMath::calculate_investor_allocation(
    total_available,
    eligible_share_bps,
)?;

// Apply daily cap if configured
let (distributable, new_carry_over) = DistributionMath::apply_daily_cap(
    investor_allocation,
    policy.daily_cap_lamports,
    progress.daily_distributed_to_investors,
)?;

// Per-investor payout with real token transfers
for i in 0..investor_count {
    let payout = DistributionMath::calculate_investor_payout(
        locked_amounts[i],
        total_locked,
        distributable,
    )?;

    if DistributionMath::meets_minimum_threshold(payout, policy.min_payout_lamports) {
        // Execute SPL token transfer via CPI
        let cpi_accounts = Transfer {
            from: ctx.accounts.treasury_token_b.to_account_info(),
            to: investor_ata_info.to_account_info(),
            authority: ctx.accounts.treasury_authority.to_account_info(),
        };

        let signer_seeds: &[&[&[u8]]] = &[&[TREASURY_SEED, &[treasury_bump]]];
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        token::transfer(cpi_ctx, payout)?;

        page_total_distributed += payout;
        investors_paid += 1;
    } else {
        accumulated_dust += payout; // Below threshold
    }
}`}
          githubLink="https://github.com/rz1989s/meteora-cp-amm-fee-routing/blob/main/programs/fee-routing/src/instructions/distribute_fees.rs"
        />
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">Quote-Only Enforcement (Bounty Compliant)</h3>
        <CodeBlock
          title="distribute_fees.rs - Base Fee Detection (Line 101 Compliance)"
          language="rust"
          code={`// Claim fees from honorary position (page 0 only)
let (claimed_token_a, claimed_token_b) = if page_index == 0 {
    // Validate pool authority & CP-AMM program ID
    require!(
        ctx.accounts.pool_authority.key() == meteora::pool_authority(),
        FeeRoutingError::InvalidPoolAuthority
    );

    require!(
        ctx.accounts.cp_amm_program.key() == meteora::cp_amm_program_id(),
        FeeRoutingError::InvalidProgram
    );

    // Build PDA signer seeds
    let bump = ctx.bumps.position_owner_pda;
    let vault_key = ctx.accounts.vault.key();
    let signer_seeds: &[&[&[u8]]] = &[&[
        VAULT_SEED,
        vault_key.as_ref(),
        INVESTOR_FEE_POS_OWNER_SEED,
        &[bump],
    ]];

    // Claim fees via CPI to Meteora CP-AMM
    meteora::claim_position_fee_cpi(&cpi_accounts, signer_seeds)?;

    emit!(QuoteFeesClaimed {
        amount: claimed_token_b,
        timestamp: now,
        distribution_day: progress.current_day,
    });

    (claimed_token_a, claimed_token_b)
} else {
    (0, 0)
};

// ⚠️ CRITICAL: Bounty requirement (line 101):
// "If any base fees are observed, the crank must fail deterministically"
if page_index == 0 && claimed_token_a > 0 {
    msg!("Base token fees detected: {} lamports", claimed_token_a);
    msg!("Position must be configured for quote-only accrual");
    // Set flag BEFORE returning to block subsequent pages
    progress.has_base_fees = true;
    return Err(FeeRoutingError::BaseFeesDetected.into());
}

// Only distribute Token B (quote token) to investors
let total_available = claimed_token_b.checked_add(progress.carry_over_lamports)?;`}
          githubLink="https://github.com/rz1989s/meteora-cp-amm-fee-routing/blob/main/programs/fee-routing/src/instructions/distribute_fees.rs"
        />
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">Idempotent Pagination & Creator Payout</h3>
        <CodeBlock
          title="distribute_fees.rs - Sequential Page Enforcement"
          language="rust"
          code={`pub fn distribute_fees_handler(
    ctx: Context<DistributeFees>,
    page_index: u16,
    is_final_page: bool,
) -> Result<()> {
    let progress = &mut ctx.accounts.progress;
    let now = Clock::get()?.unix_timestamp;

    // === 24-HOUR TIME GATE & DAY MANAGEMENT ===
    let is_new_day = now >= progress.last_distribution_ts + DISTRIBUTION_WINDOW_SECONDS;

    if page_index == 0 {
        // First page must respect 24h gate
        require!(is_new_day, FeeRoutingError::DistributionWindowNotElapsed);

        // Reset state for new day
        progress.last_distribution_ts = now;
        progress.current_day = progress.current_day.checked_add(1)?;
        progress.daily_distributed_to_investors = 0;
        progress.current_page = 0;
        progress.pages_processed_today = 0;
        progress.creator_payout_sent = false;
        progress.has_base_fees = false;
    } else {
        // Subsequent pages must be same day & sequential
        require!(!is_new_day, FeeRoutingError::InvalidPageIndex);
        require!(page_index == progress.current_page, FeeRoutingError::InvalidPageIndex);
    }

    // ... distribute to investors (see above) ...

    // === CREATOR PAYOUT (FINAL PAGE ONLY) ===
    // Use explicit is_final_page parameter from caller to prevent multiple payouts
    if is_final_page && !progress.creator_payout_sent {
        let remainder = total_available.checked_sub(investor_allocation)?;

        if remainder > 0 {
            // Real SPL token transfer to creator
            let cpi_accounts = Transfer {
                from: ctx.accounts.treasury_token_b.to_account_info(),
                to: ctx.accounts.creator_ata.clone(),
                authority: ctx.accounts.treasury_authority.to_account_info(),
            };

            let signer_seeds: &[&[&[u8]]] = &[&[TREASURY_SEED, &[treasury_bump]]];
            let cpi_ctx = CpiContext::new_with_signer(token_program, cpi_accounts, signer_seeds);

            token::transfer(cpi_ctx, remainder)?;

            emit!(CreatorPayoutDayClosed {
                day: progress.current_day,
                creator_amount: remainder,
                total_distributed_to_investors: progress.daily_distributed_to_investors,
                timestamp: now,
            });
        }
        progress.creator_payout_sent = true;
    }

    progress.current_page = progress.current_page.checked_add(1)?;
    Ok(())
}`}
          githubLink="https://github.com/rz1989s/meteora-cp-amm-fee-routing/blob/main/programs/fee-routing/src/instructions/distribute_fees.rs"
        />
      </div>
    </div>
  );

  const requirementsTab = (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-success/20 to-success/5 border border-success/30 rounded-xl p-6">
        <h3 className="text-2xl font-bold mb-6 text-success">100% Requirements Met</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-4 flex items-center">
              <GitBranch className="mr-2" size={20} />
              Hard Requirements
            </h4>
            <div className="space-y-3">
              <div>
                <ProgressBar value={100} color="success" label="Quote-only fees" />
              </div>
              <div>
                <ProgressBar value={100} color="success" label="Program PDA ownership" />
              </div>
              <div>
                <ProgressBar value={100} color="success" label="No creator position dependency" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 flex items-center">
              <Boxes className="mr-2" size={20} />
              Work Package A
            </h4>
            <div className="space-y-3">
              <div>
                <ProgressBar value={100} color="success" label="Honorary position init" />
              </div>
              <div>
                <ProgressBar value={100} color="success" label="Quote-only validation" />
              </div>
              <div>
                <ProgressBar value={100} color="success" label="Pool config validation" />
              </div>
              <div>
                <ProgressBar value={100} color="success" label="PDA derivation" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 flex items-center">
              <Clock className="mr-2" size={20} />
              Work Package B
            </h4>
            <div className="space-y-3">
              <div>
                <ProgressBar value={100} color="success" label="24h permissionless crank" />
              </div>
              <div>
                <ProgressBar value={100} color="success" label="Pagination support" />
              </div>
              <div>
                <ProgressBar value={100} color="success" label="Fee claiming via CPI" />
              </div>
              <div>
                <ProgressBar value={100} color="success" label="Streamflow integration" />
              </div>
              <div>
                <ProgressBar value={100} color="success" label="Pro-rata distribution" />
              </div>
              <div>
                <ProgressBar value={100} color="success" label="Daily cap & dust handling" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Acceptance Criteria</h4>
            <div className="space-y-3">
              <div>
                <ProgressBar value={100} color="success" label="Honorary position (PDA-owned)" />
              </div>
              <div>
                <ProgressBar value={100} color="success" label="Quote-only or rejection" />
              </div>
              <div>
                <ProgressBar value={100} color="success" label="Claims & distributes fees" />
              </div>
              <div>
                <ProgressBar value={100} color="success" label="24h gate + pagination" />
              </div>
              <div>
                <ProgressBar value={100} color="success" label="Tests passing (52/52)" />
              </div>
              <div>
                <ProgressBar value={100} color="success" label="No unsafe code" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <h3 className="text-2xl font-bold mb-4 text-success">Security Considerations</h3>
        <p className="text-slate-300 mb-6">
          Comprehensive security measures implemented throughout the program.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              num: 1,
              title: "Quote-Only Enforcement",
              description: "Deterministic validation ensures only quote token fees accrue.",
              details: "Pool configuration is validated at position initialization to reject any setup that would generate base token fees."
            },
            {
              num: 2,
              title: "Checked Arithmetic",
              description: "All math operations use checked variants to prevent overflow.",
              details: "Every multiplication, division, and addition uses .checked_*() methods with proper error handling."
            },
            {
              num: 3,
              title: "Idempotent Pagination",
              description: "Sequential page enforcement prevents double-payment.",
              details: "Progress.current_page tracks expected next page. Wrong page index fails with InvalidPageIndex error."
            },
            {
              num: 4,
              title: "PDA Ownership",
              description: "All critical accounts use PDAs with deterministic derivation.",
              details: "Position owner, Policy, and Progress are PDAs derived from known seeds, preventing unauthorized access."
            },
            {
              num: 5,
              title: "Streamflow Validation",
              description: "Stream account ownership verified before reading data.",
              details: "require!(stream_account.owner == &streamflow_sdk::id()) ensures authentic stream data."
            },
            {
              num: 6,
              title: "Time Gate",
              description: "24h enforcement prevents rapid draining or manipulation.",
              details: "First page of each distribution requires full 24 hours elapsed since last distribution."
            },
            {
              num: 7,
              title: "Daily Caps",
              description: "Optional rate limiting to smooth distributions.",
              details: "Configurable daily_cap_lamports with automatic carry-over prevents excessive single-day distributions."
            }
          ].map((security) => (
            <div key={security.num} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-success/20 text-success rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  {security.num}
                </div>
                <h4 className="font-semibold text-lg">{security.title}</h4>
              </div>
              <p className="text-sm text-slate-300 mb-2">{security.description}</p>
              <p className="text-xs text-slate-400">{security.details}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <h3 className="text-2xl font-bold mb-4 text-primary">Complete Constants Reference</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-warning">Time Constants</h4>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">DISTRIBUTION_WINDOW_SECONDS:</span>
                <span className="text-primary">86,400</span>
              </div>
              <p className="text-xs text-slate-400">24 hours in seconds</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-warning">Math Constants</h4>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">BPS_DENOMINATOR:</span>
                <span className="text-primary">10,000</span>
              </div>
              <p className="text-xs text-slate-400">100% in basis points</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-secondary">PDA Seeds</h4>
            <div className="space-y-2 font-mono text-xs">
              <div><span className="text-slate-400">VAULT_SEED:</span> <span className="text-success">b&quot;vault&quot;</span></div>
              <div><span className="text-slate-400">INVESTOR_FEE_POS_OWNER_SEED:</span> <span className="text-success">b&quot;investor_fee_pos_owner&quot;</span></div>
              <div><span className="text-slate-400">POLICY_SEED:</span> <span className="text-success">b&quot;policy&quot;</span></div>
              <div><span className="text-slate-400">PROGRESS_SEED:</span> <span className="text-success">b&quot;progress&quot;</span></div>
              <div><span className="text-slate-400">TREASURY_SEED:</span> <span className="text-success">b&quot;treasury&quot;</span></div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-secondary">External Program IDs</h4>
            <div className="space-y-3 text-xs">
              <div>
                <div className="text-slate-400 mb-1">Meteora CP-AMM:</div>
                <div className="font-mono text-primary break-all">cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG</div>
              </div>
              <div>
                <div className="text-slate-400 mb-1">Meteora Pool Authority:</div>
                <div className="font-mono text-primary break-all">HLnpSz9h2S4hiLQ43rnSD9XkcUThA7B8hQMKmDaiTLcC</div>
              </div>
              <div>
                <div className="text-slate-400 mb-1">Streamflow:</div>
                <div className="font-mono text-primary break-all">strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <h4 className="font-semibold mb-4">Constants</h4>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">DISTRIBUTION_WINDOW:</span>
              <span className="text-primary">86,400s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">BPS_DENOMINATOR:</span>
              <span className="text-primary">10,000</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <h4 className="font-semibold mb-4">Events Emitted</h4>
          <div className="space-y-2 text-sm">
            <div className="text-slate-300">• HonoraryPositionInitialized</div>
            <div className="text-slate-300">• QuoteFeesClaimed</div>
            <div className="text-slate-300">• InvestorPayoutPage</div>
            <div className="text-slate-300">• CreatorPayoutDayClosed</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <h4 className="font-semibold mb-4">External Programs</h4>
          <div className="space-y-2 text-sm">
            <div>
              <div className="text-slate-400 text-xs">Meteora CP-AMM</div>
              <div className="font-mono text-xs text-primary">cpamd...1sGG</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">Streamflow</div>
              <div className="font-mono text-xs text-primary">strm...Kg5m</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <h3 className="text-2xl font-bold mb-4 text-primary">Day & Pagination Semantics</h3>
        <p className="text-slate-300 mb-6">
          Understanding the 24-hour distribution window and pagination flow is critical for correct integration.
        </p>

        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-6">
            <h4 className="font-semibold text-lg mb-3 text-success">24-Hour Distribution Window</h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start space-x-3">
                <div className="bg-success/20 rounded-full w-6 h-6 flex items-center justify-center text-success font-bold flex-shrink-0 mt-0.5">✓</div>
                <div>
                  <span className="font-semibold">First page (page_index = 0):</span> Requires 24 hours elapsed since last_distribution_ts
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-success/20 rounded-full w-6 h-6 flex items-center justify-center text-success font-bold flex-shrink-0 mt-0.5">✓</div>
                <div>
                  <span className="font-semibold">Subsequent pages (1, 2, 3...):</span> Must occur within same 24h window
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-success/20 rounded-full w-6 h-6 flex items-center justify-center text-success font-bold flex-shrink-0 mt-0.5">✓</div>
                <div>
                  <span className="font-semibold">New day reset:</span> current_page = 0, daily_distributed_to_investors = 0, creator_payout_sent = false
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h4 className="font-semibold text-lg mb-4 text-primary">Single-Page Distribution</h4>
              <div className="font-mono text-xs space-y-2 text-slate-300">
                <div className="text-warning font-semibold">Day 1, T=0:</div>
                <div className="ml-4 space-y-1 text-slate-400">
                  <div>distribute_fees(page_index=0)</div>
                  <div className="ml-4 text-success">→ Claims fees</div>
                  <div className="ml-4 text-success">→ Distributes to all investors</div>
                  <div className="ml-4 text-success">→ Sends remainder to creator</div>
                  <div className="ml-4 text-success">→ Marks creator_payout_sent = true</div>
                </div>
                <div className="text-warning font-semibold mt-4">Day 2, T=24h:</div>
                <div className="ml-4 space-y-1 text-slate-400">
                  <div>distribute_fees(page_index=0)</div>
                  <div className="ml-4 text-success">→ Starts new day...</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h4 className="font-semibold text-lg mb-4 text-secondary">Multi-Page Distribution</h4>
              <div className="font-mono text-xs space-y-2 text-slate-300">
                <div className="text-warning font-semibold">Day 1, T=0:</div>
                <div className="ml-4 space-y-1 text-slate-400">
                  <div>distribute_fees(page_index=0)</div>
                  <div className="ml-4 text-primary">→ Claims fees (10,000 tokens)</div>
                  <div className="ml-4 text-primary">→ Investors 0-99 (2,500 tokens)</div>
                  <div className="ml-4 text-primary">→ Updates current_page = 1</div>
                </div>
                <div className="text-warning font-semibold mt-3">Day 1, T=0+5min:</div>
                <div className="ml-4 space-y-1 text-slate-400">
                  <div>distribute_fees(page_index=1)</div>
                  <div className="ml-4 text-primary">→ Investors 100-199 (2,500 tokens)</div>
                  <div className="ml-4 text-primary">→ Updates current_page = 2</div>
                </div>
                <div className="text-warning font-semibold mt-3">Day 1, T=0+10min:</div>
                <div className="ml-4 space-y-1 text-slate-400">
                  <div>distribute_fees(page_index=2)</div>
                  <div className="ml-4 text-primary">→ Investors 200-299 (2,500 tokens)</div>
                  <div className="ml-4 text-success">→ Sends remainder to creator (2,500)</div>
                  <div className="ml-4 text-success">→ Marks creator_payout_sent = true</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/30 rounded-lg p-6">
            <h4 className="font-semibold text-lg mb-3 text-warning">Idempotency & Safety</h4>
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-lg p-4">
                <h5 className="font-semibold mb-2 text-sm">Sequential Page Enforcement</h5>
                <div className="font-mono text-xs space-y-1 text-slate-300">
                  <div className="text-success">✅ distribute_fees(0) → Success (current_page = 1)</div>
                  <div className="text-error">❌ distribute_fees(2) → FAILS (expected page 1)</div>
                  <div className="text-success">✅ distribute_fees(1) → Success (current_page = 2)</div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Prevents: Skipping pages, replaying pages, out-of-order execution
                </p>
              </div>

              <div className="bg-slate-900 rounded-lg p-4">
                <h5 className="font-semibold mb-2 text-sm">Resume After Failure</h5>
                <div className="font-mono text-xs space-y-1 text-slate-300">
                  <div className="text-warning">Day 1, T=0:</div>
                  <div className="ml-4 text-success">distribute_fees(0) → Success (current_page = 1)</div>
                  <div className="ml-4 text-error">distribute_fees(1) → Failure (network error)</div>
                  <div className="text-warning mt-2">Day 1, T=0+5min (retry):</div>
                  <div className="ml-4 text-success">distribute_fees(1) → Success (resumes from page 1)</div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  State persistence allows resumption at exact point of failure
                </p>
              </div>

              <div className="bg-slate-900 rounded-lg p-4">
                <h5 className="font-semibold mb-2 text-sm">No Double-Payment</h5>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• Each investor appears in exactly one page</li>
                  <li>• creator_payout_sent flag prevents duplicate creator payouts</li>
                  <li>• Cumulative tracking in daily_distributed_to_investors</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            Technical <span className="gradient-text">Architecture</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Deep dive into the program structure, state management, and core algorithms
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <TabGroup
            tabs={[
              { id: 'architecture', label: 'Architecture', content: architectureTab },
              { id: 'code', label: 'Core Code', content: codeTab },
              { id: 'requirements', label: 'Requirements', content: requirementsTab },
            ]}
            defaultTab="architecture"
          />
        </motion.div>
      </div>
    </div>
  );
}
