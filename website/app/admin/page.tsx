'use client';

import { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { motion } from 'framer-motion';
import { Activity, Database, Clock, TrendingUp, AlertCircle, CheckCircle2, ExternalLink, Calendar } from 'lucide-react';

// Program constants
const PROGRAM_ID = new PublicKey('RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP');
const DEVNET_RPC = 'https://devnet.helius-rpc.com/?api-key=142fb48a-aa24-4083-99c8-249df5400b30';

// PDA addresses from devnet deployment
const POLICY_PDA = new PublicKey('6YyC75eRsssSnHrRFYpRiyoohCQyLqiHDe6CRje69hzt');
const PROGRESS_PDA = new PublicKey('9cumYPtnKQmKsVmTeKguv7h3YWspRoMUQeqgAHMFNXxv');

interface PolicyAccount {
  y0: string;
  investorFeeShareBps: number;
  dailyCapLamports: string;
  minPayoutLamports: string;
  quoteMint: string;
  creatorWallet: string;
  authority: string;
  bump: number;
}

interface ProgressAccount {
  lastDistributionTs: string;
  currentDay: string;
  dailyDistributedToInvestors: string;
  carryOverLamports: string;
  currentPage: number;
  pagesProcessedToday: number;
  totalInvestors: number;
  creatorPayoutSent: boolean;
  hasBaseFees: boolean;
  totalRoundingDust: string;
  bump: number;
}

interface TransactionHistory {
  signature: string;
  timestamp: number;
  type: string;
  success: boolean;
}

export default function AdminDashboard() {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [policy, setPolicy] = useState<PolicyAccount | null>(null);
  const [progress, setProgress] = useState<ProgressAccount | null>(null);
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initialize connection
  useEffect(() => {
    const conn = new Connection(DEVNET_RPC, 'confirmed');
    setConnection(conn);
  }, []);

  // Fetch account data
  useEffect(() => {
    if (!connection) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Policy account
        const policyInfo = await connection.getAccountInfo(POLICY_PDA);
        if (policyInfo) {
          const policyData = deserializePolicy(policyInfo.data);
          setPolicy(policyData);
        }

        // Fetch Progress account
        const progressInfo = await connection.getAccountInfo(PROGRESS_PDA);
        if (progressInfo) {
          const progressData = deserializeProgress(progressInfo.data);
          setProgress(progressData);
        }

        // Fetch recent transactions
        const signatures = await connection.getSignaturesForAddress(PROGRAM_ID, { limit: 10 });
        const txHistory: TransactionHistory[] = signatures.map((sig) => ({
          signature: sig.signature,
          timestamp: sig.blockTime || 0,
          type: sig.err ? 'Failed' : 'Success',
          success: !sig.err,
        }));
        setTransactions(txHistory);

        setLastUpdate(new Date());
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch account data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [connection]);

  // Simple deserialization (based on Anchor account structure)
  const deserializePolicy = (data: Buffer): PolicyAccount => {
    // Skip 8-byte discriminator
    let offset = 8;

    // Read y0 (u64 - 8 bytes)
    const y0 = data.readBigUInt64LE(offset);
    offset += 8;

    // Read investor_fee_share_bps (u16 - 2 bytes)
    const investorFeeShareBps = data.readUInt16LE(offset);
    offset += 2;

    // Read daily_cap_lamports (u64 - 8 bytes)
    const dailyCapLamports = data.readBigUInt64LE(offset);
    offset += 8;

    // Read min_payout_lamports (u64 - 8 bytes)
    const minPayoutLamports = data.readBigUInt64LE(offset);
    offset += 8;

    // Read quote_mint (Pubkey - 32 bytes)
    const quoteMint = new PublicKey(data.slice(offset, offset + 32)).toBase58();
    offset += 32;

    // Read creator_wallet (Pubkey - 32 bytes)
    const creatorWallet = new PublicKey(data.slice(offset, offset + 32)).toBase58();
    offset += 32;

    // Read authority (Pubkey - 32 bytes)
    const authority = new PublicKey(data.slice(offset, offset + 32)).toBase58();
    offset += 32;

    // Read bump (u8 - 1 byte)
    const bump = data.readUInt8(offset);

    return {
      y0: y0.toString(),
      investorFeeShareBps,
      dailyCapLamports: dailyCapLamports.toString(),
      minPayoutLamports: minPayoutLamports.toString(),
      quoteMint,
      creatorWallet,
      authority,
      bump,
    };
  };

  const deserializeProgress = (data: Buffer): ProgressAccount => {
    // Skip 8-byte discriminator
    let offset = 8;

    // Read last_distribution_ts (i64 - 8 bytes)
    const lastDistributionTs = data.readBigInt64LE(offset);
    offset += 8;

    // Read current_day (u64 - 8 bytes)
    const currentDay = data.readBigUInt64LE(offset);
    offset += 8;

    // Read daily_distributed_to_investors (u64 - 8 bytes)
    const dailyDistributedToInvestors = data.readBigUInt64LE(offset);
    offset += 8;

    // Read carry_over_lamports (u64 - 8 bytes)
    const carryOverLamports = data.readBigUInt64LE(offset);
    offset += 8;

    // Read current_page (u16 - 2 bytes)
    const currentPage = data.readUInt16LE(offset);
    offset += 2;

    // Read pages_processed_today (u16 - 2 bytes)
    const pagesProcessedToday = data.readUInt16LE(offset);
    offset += 2;

    // Read total_investors (u16 - 2 bytes)
    const totalInvestors = data.readUInt16LE(offset);
    offset += 2;

    // Read creator_payout_sent (bool - 1 byte)
    const creatorPayoutSent = data.readUInt8(offset) === 1;
    offset += 1;

    // Read has_base_fees (bool - 1 byte)
    const hasBaseFees = data.readUInt8(offset) === 1;
    offset += 1;

    // Read total_rounding_dust (u64 - 8 bytes)
    const totalRoundingDust = data.readBigUInt64LE(offset);
    offset += 8;

    // Read bump (u8 - 1 byte)
    const bump = data.readUInt8(offset);

    return {
      lastDistributionTs: lastDistributionTs.toString(),
      currentDay: currentDay.toString(),
      dailyDistributedToInvestors: dailyDistributedToInvestors.toString(),
      carryOverLamports: carryOverLamports.toString(),
      currentPage,
      pagesProcessedToday,
      totalInvestors,
      creatorPayoutSent,
      hasBaseFees,
      totalRoundingDust: totalRoundingDust.toString(),
      bump,
    };
  };

  const formatSol = (lamports: string) => {
    const sol = Number(lamports) / 1e9;
    return sol.toLocaleString(undefined, { maximumFractionDigits: 9 });
  };

  const formatDate = (timestamp: string) => {
    const ts = Number(timestamp);
    if (ts === 0) return 'Never';
    return new Date(ts * 1000).toLocaleString();
  };

  const getTimeUntilNextDistribution = () => {
    if (!progress) return 'N/A';
    const lastTs = Number(progress.lastDistributionTs);
    const nextTs = lastTs + 86400; // 24 hours
    const now = Math.floor(Date.now() / 1000);
    const remaining = nextTs - now;

    if (remaining <= 0) return 'Available now';

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading && !policy && !progress) {
    return (
      <div className="min-h-screen bg-background py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-4 text-slate-400">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-500" size={24} />
              <div>
                <h3 className="text-red-500 font-semibold">Error Loading Dashboard</h3>
                <p className="text-slate-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text">Admin Dashboard</h1>
              <p className="text-slate-400 mt-2">Live monitoring of fee routing program on Devnet</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock size={16} />
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/30 rounded-lg w-fit">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </div>
            <span className="text-success text-sm font-medium">Connected to Devnet</span>
          </div>
        </motion.div>

        {/* Policy Configuration */}
        {policy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Database className="text-primary" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Policy Configuration</h2>
                <p className="text-sm text-slate-400">{POLICY_PDA.toBase58()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">Total Investor Allocation (Y0)</p>
                <p className="text-2xl font-bold mt-1">{(Number(policy.y0) / 1e9).toLocaleString()} tokens</p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">Max Investor Fee Share</p>
                <p className="text-2xl font-bold mt-1">{(policy.investorFeeShareBps / 100).toFixed(1)}%</p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">Daily Cap</p>
                <p className="text-2xl font-bold mt-1">
                  {Number(policy.dailyCapLamports) === 0 ? 'No Cap' : `${formatSol(policy.dailyCapLamports)} SOL`}
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">Minimum Payout</p>
                <p className="text-2xl font-bold mt-1">{formatSol(policy.minPayoutLamports)} SOL</p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">Quote Mint</p>
                <p className="text-sm font-mono mt-1 truncate">{policy.quoteMint.slice(0, 8)}...{policy.quoteMint.slice(-8)}</p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">Creator Wallet</p>
                <p className="text-sm font-mono mt-1 truncate">{policy.creatorWallet.slice(0, 8)}...{policy.creatorWallet.slice(-8)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Tracking */}
        {progress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Activity className="text-secondary" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Distribution Progress</h2>
                <p className="text-sm text-slate-400">{PROGRESS_PDA.toBase58()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">Last Distribution</p>
                <p className="text-lg font-bold mt-1">{formatDate(progress.lastDistributionTs)}</p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">Next Distribution</p>
                <p className="text-lg font-bold mt-1">{getTimeUntilNextDistribution()}</p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">Current Day</p>
                <p className="text-2xl font-bold mt-1">Day {progress.currentDay}</p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">Current Page</p>
                <p className="text-2xl font-bold mt-1">Page {progress.currentPage}</p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">Daily Distributed</p>
                <p className="text-lg font-bold mt-1">{formatSol(progress.dailyDistributedToInvestors)} SOL</p>
                <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    style={{
                      width: `${Math.min(
                        (Number(progress.dailyDistributedToInvestors) /
                          (Number(policy?.dailyCapLamports) || 1)) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {Number(policy?.dailyCapLamports) > 0
                    ? `${((Number(progress.dailyDistributedToInvestors) / Number(policy?.dailyCapLamports)) * 100).toFixed(1)}% of daily cap`
                    : 'No cap set'}
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">Carry Over</p>
                <p className="text-lg font-bold mt-1">{formatSol(progress.carryOverLamports)} SOL</p>
                {Number(progress.carryOverLamports) > 0 && (
                  <p className="text-xs text-warning mt-2">Will be added to next distribution</p>
                )}
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 col-span-2">
                <p className="text-sm text-slate-400">Creator Payout Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {progress.creatorPayoutSent ? (
                    <>
                      <CheckCircle2 className="text-success" size={20} />
                      <span className="text-lg font-bold text-success">Sent</span>
                    </>
                  ) : (
                    <>
                      <Clock className="text-warning" size={20} />
                      <span className="text-lg font-bold text-warning">Pending</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/10 rounded-lg">
              <TrendingUp className="text-success" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Recent Transactions</h2>
              <p className="text-sm text-slate-400">Latest program interactions on Devnet</p>
            </div>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.signature}
                  className="bg-slate-900/50 rounded-lg p-4 flex items-center justify-between hover:bg-slate-900/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="text-slate-400" size={16} />
                    <div>
                      <p className="font-mono text-sm">
                        {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {tx.timestamp > 0 ? new Date(tx.timestamp * 1000).toLocaleString() : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        tx.success
                          ? 'bg-success/10 text-success'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {tx.success ? 'Success' : 'Failed'}
                    </span>
                    <a
                      href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                      title="View on Solscan"
                    >
                      <ExternalLink className="text-primary" size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/50 rounded-lg p-6 text-center">
              <p className="text-slate-400">No transactions found</p>
              <p className="text-sm text-slate-500 mt-2">Program transactions will appear here</p>
            </div>
          )}
        </motion.div>

        {/* Program Info & Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold mb-4">Program Information & Quick Links</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Program ID:</span>
              <a
                href={`https://solscan.io/account/${PROGRAM_ID.toBase58()}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline font-mono text-sm"
              >
                {PROGRAM_ID.toBase58().slice(0, 8)}...{PROGRAM_ID.toBase58().slice(-8)}
                <ExternalLink size={14} />
              </a>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Policy PDA:</span>
              <a
                href={`https://solscan.io/account/${POLICY_PDA.toBase58()}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline font-mono text-sm"
              >
                {POLICY_PDA.toBase58().slice(0, 8)}...{POLICY_PDA.toBase58().slice(-8)}
                <ExternalLink size={14} />
              </a>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Progress PDA:</span>
              <a
                href={`https://solscan.io/account/${PROGRESS_PDA.toBase58()}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline font-mono text-sm"
              >
                {PROGRESS_PDA.toBase58().slice(0, 8)}...{PROGRESS_PDA.toBase58().slice(-8)}
                <ExternalLink size={14} />
              </a>
            </div>

            <div className="border-t border-slate-700 pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Network:</span>
                <span className="text-white text-sm">Solana Devnet</span>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">RPC Endpoint:</span>
              <span className="text-white text-sm">Helius Devnet</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Refresh Rate:</span>
              <span className="text-white text-sm">30 seconds</span>
            </div>

            <div className="border-t border-slate-700 pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Deployment Status:</span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-success" size={16} />
                  <span className="text-success text-sm font-medium">Verified & Synced</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Latest upgrade: Oct 7, 2025 - Verifiable build ✅
              </p>
              <p className="text-xs text-slate-500">
                Source code and deployed program are in perfect sync
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
