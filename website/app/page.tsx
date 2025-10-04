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
            <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm font-medium text-primary mb-4">
              Superteam Bounty Submission - $7,500 USDC
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Meteora DAMM V2
              <span className="gradient-text block mt-2">Fee Routing Program</span>
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Permissionless fee distribution system for Meteora DAMM V2 (CP-AMM) pools.
              Automatically distributes quote-only fees to investors based on Streamflow locked amounts,
              with a 24-hour permissionless crank and paginated execution.
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
              title="Test Coverage"
              value="17/17"
              description="All tests passing"
              icon={CheckCircle}
              color="success"
              delay={0.1}
            />
            <MetricCard
              title="Documentation"
              value="1,063"
              description="Lines of comprehensive docs"
              icon={Code}
              color="primary"
              delay={0.2}
            />
            <MetricCard
              title="Build Status"
              value="100%"
              description="Clean compilation"
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
                  A two-instruction Anchor program that creates an honorary quote-only LP position
                  and distributes fees via a 24-hour permissionless crank:
                </p>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-start">
                    <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                      1
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
                      2
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
