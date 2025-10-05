'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Users, Coins, TrendingUp, ChevronDown } from 'lucide-react';

interface Investor {
  name: string;
  locked: number;
}

export default function FeeCalculator() {
  const [claimedFees, setClaimedFees] = useState(10000);
  const [investorShareBps, setInvestorShareBps] = useState(7000);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [y0] = useState(1000000);
  const [investors] = useState<Investor[]>([
    { name: 'Alice', locked: 150000 },
    { name: 'Bob', locked: 100000 },
    { name: 'Charlie', locked: 50000 },
  ]);

  const totalLocked = investors.reduce((sum, inv) => sum + inv.locked, 0);
  const fLocked = totalLocked / y0;
  const maxEligibleBps = Math.floor(fLocked * 10000);
  const eligibleShareBps = Math.min(investorShareBps, maxEligibleBps);
  const isCapped = investorShareBps > maxEligibleBps;
  const investorFeeQuote = Math.floor((claimedFees * eligibleShareBps) / 10000);
  const creatorFee = claimedFees - investorFeeQuote;

  const investorPayouts = investors.map(inv => ({
    ...inv,
    weight: inv.locked / totalLocked,
    payout: Math.floor(investorFeeQuote * (inv.locked / totalLocked)),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-slate-900 rounded-2xl border border-slate-700 p-8"
    >
      <div className="flex items-center space-x-3 mb-6">
        <Calculator className="text-primary" size={32} />
        <h2 className="text-2xl font-bold">Live Fee Distribution Calculator</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Controls */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Claimed Fees (USDC)
            </label>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={claimedFees}
              onChange={(e) => setClaimedFees(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-sm text-slate-400 mt-1">
              <span>$1,000</span>
              <span className="font-bold text-primary text-lg">
                ${claimedFees.toLocaleString()}
              </span>
              <span>$50,000</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Investor Fee Share (basis points)
            </label>
            <input
              type="range"
              min="5000"
              max="9000"
              step="500"
              value={investorShareBps}
              onChange={(e) => setInvestorShareBps(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-secondary"
            />
            <div className="flex justify-between text-sm text-slate-400 mt-1">
              <span>50%</span>
              <span className="font-bold text-secondary text-lg">
                {(investorShareBps / 100).toFixed(0)}%
                {isCapped && (
                  <span className="text-xs text-yellow-400 ml-2">
                    (capped → {(eligibleShareBps / 100).toFixed(0)}%)
                  </span>
                )}
              </span>
              <span>90%</span>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center space-x-2 mb-3">
              <Users size={20} className="text-secondary" />
              <h3 className="font-semibold">Mock Investors (STAR Token)</h3>
            </div>
            <div className="space-y-2 text-sm">
              {investors.map((inv) => (
                <div key={inv.name} className="flex justify-between text-slate-300">
                  <span>{inv.name}</span>
                  <span className="font-mono">{inv.locked.toLocaleString()} locked</span>
                </div>
              ))}
              <div className="border-t border-slate-700 pt-2 mt-2 flex justify-between font-semibold">
                <span>Total Locked</span>
                <span className="text-primary">{totalLocked.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Total at TGE (Y0)</span>
                <span>{y0.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Coins size={20} className="text-primary" />
              <h3 className="font-semibold">Calculation Steps</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Locked Fraction (f):</span>
                <span className="font-mono text-primary">{(fLocked * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Eligible Share:</span>
                <span className="font-mono text-primary">{eligibleShareBps} bps</span>
              </div>
              {isCapped && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded px-2 py-1 text-xs text-yellow-400">
                  ⚠️ Capped at {maxEligibleBps} bps (locked fraction limit)
                </div>
              )}
              <div className="border-t border-primary/30 pt-2 mt-2 flex justify-between font-semibold">
                <span>Investor Pool:</span>
                <span className="text-primary">${investorFeeQuote.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-success/20 to-success/5 border border-success/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp size={20} className="text-success" />
              <h3 className="font-semibold">Pro-Rata Distribution</h3>
            </div>
            <div className="space-y-3">
              {investorPayouts.map((inv) => (
                <div key={inv.name} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{inv.name}</span>
                    <span className="text-success font-bold">
                      ${inv.payout.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-success h-full rounded-full transition-all duration-500"
                      style={{ width: `${inv.weight * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400">
                    Weight: {(inv.weight * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Creator Remainder:</span>
              <span className="text-secondary font-bold text-xl">
                ${creatorFee.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Sent to creator wallet on final pagination page
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700">
        <p className="text-sm text-slate-400 text-center">
          Interactive demonstration of pro-rata fee distribution algorithm.
          All values update in real-time as you adjust the sliders.
        </p>
      </div>

      {/* Expandable Explanation Section */}
      <div className="mt-6">
        <button
          onClick={() => setIsExplanationOpen(!isExplanationOpen)}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg hover:border-amber-500/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍕</span>
            <div className="text-left">
              <h3 className="font-semibold text-amber-400">Why the Cap? Simple Explanation</h3>
              <p className="text-xs text-slate-400">Understanding the locked fraction limit</p>
            </div>
          </div>
          <ChevronDown
            className={`text-amber-400 transition-transform duration-300 ${
              isExplanationOpen ? 'rotate-180' : ''
            }`}
            size={20}
          />
        </button>

        <AnimatePresence>
          {isExplanationOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-slate-800/50 border-x border-b border-amber-500/30 rounded-b-lg space-y-4">
                {/* Pizza Analogy */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-amber-400 flex items-center gap-2">
                    🍕 The Pizza Restaurant Analogy
                  </h4>
                  <p className="text-sm text-slate-300">
                    Imagine you and 9 friends <strong>co-own a pizza restaurant</strong>.
                    Each person owns <strong>10% of the restaurant</strong> (total: 100%).
                  </p>
                  <p className="text-sm text-slate-300">
                    <strong>Restaurant rule:</strong> &quot;Your share of monthly profits = your current ownership %&quot;
                  </p>
                  <p className="text-sm text-slate-300">
                    After 6 months, 7 friends <strong>sold their ownership and left</strong> (they got cash, they&apos;re out!).
                    Only you + 2 friends still own the restaurant (<strong>30% total ownership</strong>).
                  </p>
                </div>

                {/* Comparison Table */}
                <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700">
                  <h5 className="text-sm font-semibold text-amber-400 mb-3">Without Cap vs With Cap:</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-red-500/10 border border-red-500/30 rounded">
                      <span className="text-red-400">❌ Without Cap (Unfair):</span>
                      <span className="text-slate-300">Friends who left still get 70% of profits!</span>
                    </div>
                    <div className="flex justify-between p-2 bg-green-500/10 border border-green-500/30 rounded">
                      <span className="text-green-400">✅ With Cap (Fair):</span>
                      <span className="text-slate-300">Friends who left get 0%, you get profits based on 30% ownership</span>
                    </div>
                  </div>
                </div>

                {/* Multiple Scenarios */}
                <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700">
                  <h5 className="text-sm font-semibold text-amber-400 mb-3">📊 Different Scenarios (Restaurant Ownership → Fee Distribution):</h5>
                  <div className="space-y-3 text-sm">
                    {/* Scenario 1: Original (30%) */}
                    <div className="p-3 bg-slate-800/50 border border-slate-600 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-amber-300 font-semibold">Scenario 1: 3 friends stay</span>
                        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded">30% ownership</span>
                      </div>
                      <p className="text-slate-400 text-xs mb-2">You + 2 friends keep 10% each = 30% total ownership</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Investors get:</span>
                          <span className="text-amber-400 font-mono">min(80%, 30%) = 30%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Creator gets:</span>
                          <span className="text-secondary font-mono font-semibold">70%</span>
                        </div>
                      </div>
                    </div>

                    {/* Scenario 2: 2 friends (20%) */}
                    <div className="p-3 bg-slate-800/50 border border-slate-600 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-orange-300 font-semibold">Scenario 2: Only 2 friends stay</span>
                        <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">20% ownership</span>
                      </div>
                      <p className="text-slate-400 text-xs mb-2">Only you + 1 friend keep 10% each = 20% total ownership</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Investors get:</span>
                          <span className="text-orange-400 font-mono">min(80%, 20%) = 20%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Creator gets:</span>
                          <span className="text-secondary font-mono font-semibold">80%</span>
                        </div>
                      </div>
                    </div>

                    {/* Scenario 3: 3 friends but half sold (15%) */}
                    <div className="p-3 bg-slate-800/50 border border-slate-600 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-yellow-300 font-semibold">Scenario 3: 3 friends but sold half</span>
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">15% ownership</span>
                      </div>
                      <p className="text-slate-400 text-xs mb-2">3 friends each sold half, now 5% each = 15% total ownership</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Investors get:</span>
                          <span className="text-yellow-400 font-mono">min(80%, 15%) = 15%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Creator gets:</span>
                          <span className="text-secondary font-mono font-semibold">85%</span>
                        </div>
                      </div>
                    </div>

                    {/* Scenario 4: All sold (0%) */}
                    <div className="p-3 bg-slate-800/50 border border-slate-600 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-slate-300 font-semibold">Scenario 4: Everyone sold</span>
                        <span className="text-xs bg-slate-500/20 text-slate-300 px-2 py-1 rounded">0% ownership</span>
                      </div>
                      <p className="text-slate-400 text-xs mb-2">All 10 friends sold their shares = 0% total ownership</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Investors get:</span>
                          <span className="text-slate-400 font-mono">min(80%, 0%) = 0%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Creator gets:</span>
                          <span className="text-secondary font-mono font-semibold">100% 🎉</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real Numbers */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-primary mb-3">Applied to Fee Distribution:</h5>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex justify-between">
                      <span>• Day 1 (100% locked):</span>
                      <span className="font-mono text-primary">Investors get up to {(investorShareBps / 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Month 6 (30% locked):</span>
                      <span className="font-mono text-amber-400">Investors get max 30% (capped!)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Year 1 (0% locked):</span>
                      <span className="font-mono text-secondary">Creator gets 100%</span>
                    </div>
                  </div>
                </div>

                {/* Simple Rule */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-sm text-amber-200 text-center font-semibold">
                    💡 Simple Rule: &quot;You can&apos;t claim restaurant profits after selling your ownership!&quot;
                  </p>
                  <p className="text-xs text-slate-400 text-center mt-2">
                    Your fee rewards = Your current commitment level
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
