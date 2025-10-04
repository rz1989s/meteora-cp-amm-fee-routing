'use client';

import { motion } from 'framer-motion';
import { Box, GitBranch, Database, Boxes, Lock, Clock } from 'lucide-react';
import TabGroup from '@/components/TabGroup';
import CodeBlock from '@/components/CodeBlock';
import ProgressBar from '@/components/ProgressBar';

export default function TechnicalPage() {
  const architectureTab = (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Box className="text-primary" size={24} />
            <h3 className="text-xl font-bold">Two-Instruction Design</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-primary">1. initialize_position</h4>
              <p className="text-sm text-slate-300">
                Creates a quote-only honorary DAMM V2 position owned by program PDA.
                Validates pool configuration to ensure only quote token fees accrue.
              </p>
              <div className="mt-3 text-xs text-slate-400">
                <div className="flex justify-between py-1">
                  <span>Validation:</span>
                  <span className="text-success">Quote-only enforcement</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Ownership:</span>
                  <span className="text-success">PDA-controlled</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-secondary">2. distribute_fees</h4>
              <p className="text-sm text-slate-300">
                Permissionless 24h crank that claims fees from the pool and distributes
                them pro-rata to investors based on Streamflow locked amounts.
              </p>
              <div className="mt-3 text-xs text-slate-400">
                <div className="flex justify-between py-1">
                  <span>Frequency:</span>
                  <span className="text-success">Every 24 hours</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Pagination:</span>
                  <span className="text-success">Supported</span>
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
                  <div>• creator_payout_sent</div>
                </div>
              </div>
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
          title="lib.rs - Core Distribution Logic"
          language="rust"
          code={`// Compute locked fraction (0 to 1)
let total_locked = compute_total_locked(&streamflow_accounts);
let f_locked = total_locked as f64 / policy.y0 as f64;

// Eligible investor share (capped, basis points)
let eligible_investor_share_bps = std::cmp::min(
    policy.investor_fee_share_bps,
    (f_locked * 10000.0).floor() as u64
);

// Total allocated to investors this cycle
let investor_fee_quote = (claimed_quote as u128)
    .checked_mul(eligible_investor_share_bps as u128)
    .unwrap()
    .checked_div(10000)
    .unwrap() as u64;

// Per-investor weight and payout
for investor in investors {
    let weight = investor.locked as f64 / total_locked as f64;
    let payout = (investor_fee_quote as f64 * weight).floor() as u64;

    if payout >= policy.min_payout_lamports {
        transfer_tokens(investor.ata, payout)?;
    } else {
        progress.carry_over_lamports += payout;
    }
}`}
          githubLink="https://github.com/rz1989s/meteora-cp-amm-fee-routing/blob/main/programs/fee-routing/src/lib.rs"
        />
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">Quote-Only Validation</h3>
        <CodeBlock
          title="lib.rs - Position Initialization"
          language="rust"
          code={`pub fn initialize_position(ctx: Context<InitializePosition>) -> Result<()> {
    let pool = &ctx.accounts.pool;
    let policy = &ctx.accounts.policy;

    // Validate pool configuration ensures quote-only fees
    require!(
        pool.quote_mint == policy.quote_mint,
        ErrorCode::InvalidQuoteMint
    );

    // Verify tick range guarantees quote-only accrual
    validate_quote_only_position(
        pool.active_bin,
        ctx.accounts.lower_bin_id,
        ctx.accounts.upper_bin_id
    )?;

    // Create position via CPI to Meteora CP-AMM
    meteora_cp_amm::cpi::initialize_position(
        cpi_ctx,
        lower_bin_id,
        upper_bin_id,
        0, // quote-only, no base liquidity
    )?;

    emit!(HonoraryPositionInitialized {
        position: ctx.accounts.position.key(),
        pool: pool.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}`}
          githubLink="https://github.com/rz1989s/meteora-cp-amm-fee-routing/blob/main/programs/fee-routing/src/instructions/initialize_position.rs"
        />
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">Pagination Implementation</h3>
        <CodeBlock
          title="lib.rs - Idempotent Pagination"
          language="rust"
          code={`pub fn distribute_fees(
    ctx: Context<DistributeFees>,
    page_index: u32,
) -> Result<()> {
    let progress = &mut ctx.accounts.progress;
    let now = Clock::get()?.unix_timestamp;

    // 24-hour time gate
    require!(
        now >= progress.last_distribution_ts + DISTRIBUTION_WINDOW_SECONDS,
        ErrorCode::DistributionTooEarly
    );

    // New distribution cycle
    if now >= progress.last_distribution_ts + DISTRIBUTION_WINDOW_SECONDS * 2 {
        progress.current_day += 1;
        progress.current_page = 0;
        progress.daily_distributed_to_investors = 0;
        progress.creator_payout_sent = false;
    }

    // Prevent double-payment on same page
    require!(
        page_index == progress.current_page,
        ErrorCode::InvalidPageIndex
    );

    // Distribute to investors on this page
    distribute_to_investors_on_page(ctx, page_index)?;

    // Creator payout on final page
    if is_final_page && !progress.creator_payout_sent {
        let remainder = claimed_fees - progress.daily_distributed_to_investors;
        transfer_to_creator(remainder)?;
        progress.creator_payout_sent = true;
    }

    progress.current_page += 1;
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
                <ProgressBar value={100} color="success" label="Tests passing (17/17)" />
              </div>
              <div>
                <ProgressBar value={100} color="success" label="No unsafe code" />
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
