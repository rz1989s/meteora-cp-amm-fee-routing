'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Users, Coins, TrendingUp } from 'lucide-react';

interface Investor {
  name: string;
  locked: number;
}

export default function FeeCalculator() {
  const [claimedFees, setClaimedFees] = useState(10000);
  const [investorShareBps, setInvestorShareBps] = useState(7000);
  const [y0] = useState(1000000);
  const [investors] = useState<Investor[]>([
    { name: 'Alice', locked: 150000 },
    { name: 'Bob', locked: 100000 },
    { name: 'Charlie', locked: 50000 },
  ]);

  const totalLocked = investors.reduce((sum, inv) => sum + inv.locked, 0);
  const fLocked = totalLocked / y0;
  const eligibleShareBps = Math.min(investorShareBps, Math.floor(fLocked * 10000));
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
    </motion.div>
  );
}
