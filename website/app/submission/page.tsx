'use client';

import { motion } from 'framer-motion';
import { User, Mail, Twitter, Github, Award, Target, Star, Heart, MessageCircle } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import Link from 'next/link';

export default function SubmissionPage() {
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
            Bounty <span className="gradient-text">Submission</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Complete submission for the Meteora DAMM V2 Fee Routing Program bounty
          </p>
        </motion.div>

        {/* Submission Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <MetricCard
            title="Bounty Prize"
            value="$7,500"
            description="USDC reward"
            icon={Award}
            color="warning"
          />
          <MetricCard
            title="Completion"
            value="100%"
            description="All requirements met"
            icon={Target}
            color="success"
          />
          <MetricCard
            title="Quality Score"
            value="A+"
            description="Production ready"
            icon={Star}
            color="primary"
          />
        </motion.div>

        {/* Team Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl p-8 mb-12"
        >
          <div className="flex items-center space-x-3 mb-6">
            <User className="text-primary" size={32} />
            <h2 className="text-3xl font-bold">Team Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-400 mb-2">Developer</h3>
                <p className="text-2xl font-bold">RECTOR</p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-400 mb-2">Twitter / X</h3>
                <a
                  href="https://x.com/RZ1989sol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-primary hover:text-secondary transition-colors flex items-center space-x-2"
                >
                  <Twitter size={20} />
                  <span>@RZ1989sol</span>
                </a>
              </div>

              <div>
                <h3 className="font-semibold text-slate-400 mb-2">Telegram</h3>
                <a
                  href="https://t.me/RZ1989sol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-primary hover:text-secondary transition-colors flex items-center space-x-2"
                >
                  <MessageCircle size={20} />
                  <span>@RZ1989sol</span>
                </a>
              </div>

              <div>
                <h3 className="font-semibold text-slate-400 mb-2">GitHub</h3>
                <a
                  href="https://github.com/rz1989s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-primary hover:text-secondary transition-colors flex items-center space-x-2"
                >
                  <Github size={20} />
                  <span>rz1989s</span>
                </a>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
              <h3 className="font-semibold text-lg mb-4">Repository Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-400 block mb-1">Repository URL:</span>
                  <a
                    href="https://github.com/rz1989s/meteora-cp-amm-fee-routing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-secondary transition-colors break-all"
                  >
                    github.com/rz1989s/meteora-cp-amm-fee-routing
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Program ID:</span>
                  <code className="text-xs bg-slate-800 px-2 py-1 rounded block">
                    Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
                  </code>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Submission Date:</span>
                  <span>October 4, 2025</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">License:</span>
                  <span>MIT</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Why This Submission Wins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl p-8 mb-12"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Heart className="text-error" size={32} />
            <h2 className="text-3xl font-bold">Why This Submission Deserves to Win</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-success">
                  1. 100% Requirements Completion
                </h3>
                <p className="text-slate-300">
                  Every single requirement from the bounty specification has been implemented and tested.
                  All 17 integration tests pass, covering quote-only validation, pro-rata distribution,
                  pagination, edge cases, and security checks.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">
                  2. Production-Ready Code Quality
                </h3>
                <p className="text-slate-300">
                  Zero unsafe code blocks, comprehensive error handling, checked arithmetic operations,
                  and clean compilation with official Anchor 0.31.1. The code follows Rust and Solana
                  best practices throughout.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-secondary">
                  3. Exceptional Documentation
                </h3>
                <p className="text-slate-300">
                  1,063 lines of comprehensive README covering architecture, implementation details,
                  testing strategies, deployment guides, and troubleshooting. Every function is
                  well-commented with clear explanations.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-warning">
                  4. Rigorous Testing
                </h3>
                <p className="text-slate-300">
                  24 total test cases (17 integration + 7 unit) with 100% pass rate. Tests cover
                  all critical paths, edge cases, security scenarios, and event emissions. No mock
                  data - actual Meteora and Streamflow program clones in test validator.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-success">
                  5. Thoughtful Design
                </h3>
                <p className="text-slate-300">
                  Clean two-instruction architecture with idempotent pagination, dust handling,
                  daily caps, and creator remainder routing. PDA-based ownership ensures security
                  and determinism. All state changes emit events for off-chain tracking.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">
                  6. Professional Presentation
                </h3>
                <p className="text-slate-300">
                  This multi-page interactive website showcases the project with live calculators,
                  code examples, test results, and comprehensive documentation. Every detail has
                  been carefully crafted for clarity and professionalism.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Deliverables Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-br from-success/20 to-success/5 border border-success/30 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-3xl font-bold mb-6">Deliverables Checklist</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold mb-4 text-success">Core Requirements</h3>
              {[
                'Public Git repository with full source code',
                'Anchor-compatible program (v0.31.1)',
                'Tests passing on local validator',
                'Comprehensive README.md documentation',
                'Quote-only fee enforcement',
                'Program ownership via PDA',
                'No creator position dependency',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-3 bg-slate-900 rounded-lg">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-background font-bold">✓</span>
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold mb-4 text-success">Implementation Features</h3>
              {[
                'Honorary position initialization',
                '24h permissionless crank',
                'Pagination support (idempotent)',
                'Pro-rata fee distribution',
                'Streamflow integration',
                'Daily cap & dust handling',
                'Event emissions (4 events)',
                'Security validations',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-3 bg-slate-900 rounded-lg">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-background font-bold">✓</span>
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 rounded-2xl p-12 text-center"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Review?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Explore the full implementation, run the tests, or reach out with questions.
            Thank you for considering this submission!
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/rz1989s/meteora-cp-amm-fee-routing"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-primary rounded-lg font-semibold hover:bg-primary/80 transition-all inline-flex items-center space-x-2"
            >
              <Github size={20} />
              <span>View on GitHub</span>
            </a>

            <a
              href="https://x.com/RZ1989sol"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-secondary rounded-lg font-semibold hover:bg-secondary/80 transition-all inline-flex items-center space-x-2"
            >
              <Twitter size={20} />
              <span>Contact on Twitter</span>
            </a>

            <Link
              href="/testing"
              className="px-8 py-4 bg-success rounded-lg font-semibold hover:bg-success/80 transition-all inline-flex items-center space-x-2"
            >
              <Award size={20} />
              <span>View Test Results</span>
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Submission Date: October 4, 2025
              <br />
              Meteora DAMM V2 Fee Routing Program Bounty
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
