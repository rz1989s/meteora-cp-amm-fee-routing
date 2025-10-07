'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Code, Zap, Shield, Github } from 'lucide-react';
import Link from 'next/link';
import MetricCard from '@/components/MetricCard';
import FeeCalculator from '@/components/FeeCalculator';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-background py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm font-medium text-primary">
                Superteam Bounty Submission - $7,500 USDC
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/30 rounded-full text-sm font-medium text-success animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                Live on Devnet - Program ID: RECt...3WP
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Meteora DAMM V2
              <span className="gradient-text block mt-2">Fee Routing Program</span>
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Production-ready permissionless fee distribution system for Meteora DAMM V2 (CP-AMM) pools.
              Fully implemented with real SPL token transfers, distributing quote fees to investors based on
              Streamflow locked amounts, with 24-hour permissionless crank and complete state management.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/technical"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-lg font-semibold hover:shadow-xl transition-all hover:scale-105"
              >
                View Technical Details
                <ArrowRight className="ml-2" size={20} />
              </Link>

              <a
                href="https://github.com/rz1989s/meteora-cp-amm-fee-routing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-slate-800 border border-slate-700 rounded-lg font-semibold hover:bg-slate-700 transition-all"
              >
                <Github className="mr-2" size={20} />
                View Repository
              </a>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16"
          >
            <MetricCard
              title="Implementation"
              value="100%"
              description="All features complete"
              icon={CheckCircle}
              color="success"
              delay={0.1}
            />
            <MetricCard
              title="Token Transfers"
              value="Live"
              description="Real SPL transfers implemented"
              icon={Code}
              color="primary"
              delay={0.2}
            />
            <MetricCard
              title="Build Size"
              value="371 KB"
              description="Optimized binary"
              icon={Zap}
              color="warning"
              delay={0.3}
            />
            <MetricCard
              title="Security"
              value="0"
              description="Unsafe code blocks"
              icon={Shield}
              color="secondary"
              delay={0.4}
            />
          </motion.div>

          {/* Deployment Verification Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 bg-gradient-to-r from-success/10 via-primary/10 to-secondary/10 border border-success/30 rounded-2xl p-8"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">🚀 Deployed on Solana Devnet</h3>
              <p className="text-slate-300">
                Live deployment with vanity addresses - 100% verifiable on-chain
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                <h4 className="text-sm font-semibold text-primary mb-3">Program ID (Vanity)</h4>
                <code className="text-success font-mono text-sm break-all block mb-4">
                  RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP
                </code>
                <a
                  href="https://solscan.io/account/RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP?cluster=devnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:text-secondary transition-colors text-sm"
                >
                  View on Solscan →
                </a>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                <h4 className="text-sm font-semibold text-secondary mb-3">Deployer Wallet (Vanity)</h4>
                <code className="text-success font-mono text-sm break-all block mb-4">
                  RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b
                </code>
                <a
                  href="https://solscan.io/account/RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b?cluster=devnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:text-secondary transition-colors text-sm"
                >
                  View on Solscan →
                </a>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/admin"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
              >
                🔴 Live Admin Dashboard →
              </Link>
              <Link
                href="/documentation#deployment"
                className="inline-flex items-center px-6 py-3 bg-slate-800 border border-slate-700 rounded-lg font-semibold hover:bg-slate-700 transition-all text-sm"
              >
                View Full Deployment Details →
              </Link>
            </div>
          </motion.div>

          {/* Triple-Bundle Testing Excellence Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 bg-gradient-to-br from-success/10 via-primary/10 to-secondary/10 border border-primary/30 rounded-2xl p-8"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">🏆 Triple-Bundle Testing Strategy</h3>
              <p className="text-slate-300">
                Most submissions test locally only. We test locally, E2E, AND live on devnet.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-success/30">
                <div className="text-success font-bold text-2xl mb-1">22/22</div>
                <div className="text-sm text-slate-300 mb-1">Local Integration</div>
                <div className="text-xs text-slate-400">Core logic + full SDK integration</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-primary/30">
                <div className="text-primary font-bold text-2xl mb-1">15/15</div>
                <div className="text-sm text-slate-300 mb-1">E2E Integration</div>
                <div className="text-xs text-slate-400">Hybrid testing with mock data</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-secondary/30">
                <div className="text-secondary font-bold text-2xl mb-1">10/10</div>
                <div className="text-sm text-slate-300 mb-1">Live Devnet</div>
                <div className="text-xs text-slate-400">Production verification</div>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-block bg-gradient-to-r from-success via-primary to-secondary rounded-full p-[2px]">
                <div className="bg-slate-900 rounded-full px-6 py-2">
                  <span className="font-bold text-lg gradient-text">54/54 Total Tests Passing</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-3">
                Including 7 Rust unit tests for mathematical validation
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                href="/testing"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-success to-primary rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
              >
                View All Test Results →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">The Challenge</h2>
              <div className="space-y-4 text-slate-300">
                <p>
                  Meteora DAMM V2 pools generate trading fees that need to be distributed fairly
                  among investors based on their locked token amounts in Streamflow contracts.
                </p>
                <p>
                  The distribution must be:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <CheckCircle className="text-success mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Quote-only (no base token fees)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-success mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Pro-rata based on locked amounts</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-success mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Permissionless (anyone can trigger)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="text-success mr-2 mt-1 flex-shrink-0" size={20} />
                    <span>Paginated for large investor lists</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Solution</h2>
              <div className="space-y-4 text-slate-300">
                <p>
                  A four-instruction Anchor program that creates an honorary quote-only LP position
                  and distributes fees via a 24-hour permissionless crank:
                </p>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-start">
                    <div className="bg-success/20 text-success rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">initialize_policy</h3>
                      <p className="text-sm text-slate-400">
                        Creates immutable Policy PDA with distribution configuration
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-success/20 text-success rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">initialize_progress</h3>
                      <p className="text-sm text-slate-400">
                        Creates mutable Progress PDA for daily distribution tracking
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">initialize_position</h3>
                      <p className="text-sm text-slate-400">
                        Creates PDA-owned honorary position, validates quote-only configuration
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-secondary/20 text-secondary rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">distribute_fees</h3>
                      <p className="text-sm text-slate-400">
                        Claims fees, calculates pro-rata shares, distributes with pagination support
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Calculator Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">See It In Action</h2>
            <p className="text-xl text-slate-300">
              Interactive demonstration of the pro-rata fee distribution algorithm
            </p>
          </motion.div>

          <FeeCalculator />

          {/* Pro-Rata Formula Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 bg-slate-900 border border-slate-700 rounded-xl p-8"
          >
            <h3 className="text-2xl font-bold mb-6">Mathematical Model</h3>

            <div className="space-y-6">
              <div className="bg-slate-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4 text-primary">Distribution Formula</h4>
                <div className="font-mono text-sm space-y-3 text-slate-300">
                  <div>
                    <span className="text-slate-400">1. Locked fraction (0 to 1):</span>
                    <div className="ml-4 mt-1">f_locked(t) = locked_total(t) / Y0</div>
                  </div>

                  <div>
                    <span className="text-slate-400">2. Eligible investor share (capped, basis points 0-10000):</span>
                    <div className="ml-4 mt-1">eligible_share_bps = min(investor_fee_share_bps, floor(f_locked(t) × 10000))</div>
                  </div>

                  <div>
                    <span className="text-slate-400">3. Total allocated to investors:</span>
                    <div className="ml-4 mt-1">investor_allocation = floor(claimed_quote × eligible_share_bps / 10000)</div>
                  </div>

                  <div>
                    <span className="text-slate-400">4. Per-investor weight:</span>
                    <div className="ml-4 mt-1">weight_i(t) = locked_i(t) / locked_total(t)</div>
                  </div>

                  <div>
                    <span className="text-slate-400">5. Per-investor payout (floor rounding):</span>
                    <div className="ml-4 mt-1">payout_i = floor(investor_allocation × weight_i(t))</div>
                    <div className="ml-4 mt-1 text-xs text-slate-400">IF payout_i &lt; min_payout_lamports: payout_i = 0 (accumulate as dust)</div>
                  </div>

                  <div>
                    <span className="text-slate-400">6. Creator remainder:</span>
                    <div className="ml-4 mt-1">creator_amount = claimed_quote - sum(payout_i)</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-lg p-6">
                <h4 className="font-semibold mb-4 text-primary">Worked Example</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3 text-sm">
                    <div className="bg-slate-900 rounded p-3">
                      <div className="text-slate-400 text-xs mb-1">Policy Configuration:</div>
                      <div className="font-mono text-xs space-y-1">
                        <div>Y0 = 1,000,000 tokens</div>
                        <div>investor_fee_share_bps = 7000 (70%)</div>
                        <div>daily_cap_lamports = 0 (no cap)</div>
                        <div>min_payout_lamports = 1,000</div>
                      </div>
                    </div>

                    <div className="bg-slate-900 rounded p-3">
                      <div className="text-slate-400 text-xs mb-1">Distribution Event:</div>
                      <div className="font-mono text-xs">
                        claimed_quote = 10,000 tokens
                      </div>
                    </div>

                    <div className="bg-slate-900 rounded p-3">
                      <div className="text-slate-400 text-xs mb-1">Investor States (Streamflow):</div>
                      <div className="font-mono text-xs space-y-1">
                        <div>Investor A: locked = 200,000</div>
                        <div>Investor B: locked = 150,000</div>
                        <div>Investor C: locked = 100,000</div>
                        <div className="text-primary">locked_total = 450,000</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="bg-slate-900 rounded p-3">
                      <div className="text-success text-xs font-semibold mb-2">Calculation Steps:</div>
                      <div className="font-mono text-xs space-y-2">
                        <div>
                          <div className="text-slate-400">1. f_locked:</div>
                          <div className="ml-4">450,000 / 1,000,000 = 0.45 (45%)</div>
                        </div>

                        <div>
                          <div className="text-slate-400">2. eligible_share_bps:</div>
                          <div className="ml-4">min(7000, floor(0.45 × 10000))</div>
                          <div className="ml-4">= min(7000, 4500) = 4500 bps</div>
                        </div>

                        <div>
                          <div className="text-slate-400">3. investor_allocation:</div>
                          <div className="ml-4">floor(10,000 × 4500 / 10000)</div>
                          <div className="ml-4 text-primary">= 4,500 tokens</div>
                        </div>

                        <div>
                          <div className="text-slate-400">4. Individual payouts:</div>
                          <div className="ml-4">Alice: floor(4,500 × 0.4444) = 2,000 ✅</div>
                          <div className="ml-4">Bob: floor(4,500 × 0.3333) = 1,500 ✅</div>
                          <div className="ml-4">Charlie: floor(4,500 × 0.2222) = 1,000 ✅</div>
                        </div>

                        <div>
                          <div className="text-slate-400">5. Creator remainder:</div>
                          <div className="ml-4 text-success">10,000 - 4,500 = 5,500 tokens</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-y border-primary/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Explore?</h2>
            <p className="text-xl text-slate-300 mb-8">
              Dive into the technical implementation, review comprehensive test results,
              or check out the complete documentation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/technical"
                className="px-8 py-4 bg-primary rounded-lg font-semibold hover:bg-primary/80 transition-all"
              >
                Technical Architecture
              </Link>
              <Link
                href="/testing"
                className="px-8 py-4 bg-success rounded-lg font-semibold hover:bg-success/80 transition-all"
              >
                Test Results
              </Link>
              <Link
                href="/documentation"
                className="px-8 py-4 bg-secondary rounded-lg font-semibold hover:bg-secondary/80 transition-all"
              >
                Documentation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
