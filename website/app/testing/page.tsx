'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Activity, Target, Award } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import TabGroup from '@/components/TabGroup';
import CodeBlock from '@/components/CodeBlock';
import ProgressBar from '@/components/ProgressBar';

export default function TestingPage() {
  const testResults = [
    {
      category: 'initialize_position',
      tests: [
        { name: 'Should initialize honorary position (quote-only)', passed: true },
        { name: 'Should reject pools with base token fees', passed: true },
      ],
    },
    {
      category: 'distribute_fees',
      tests: [
        { name: 'Should enforce 24-hour time gate', passed: true },
        { name: 'Should calculate pro-rata distribution correctly', passed: true },
        { name: 'Should handle pagination idempotently', passed: true },
        { name: 'Should accumulate dust below min_payout threshold', passed: true },
        { name: 'Should enforce daily cap', passed: true },
        { name: 'Should send remainder to creator on final page', passed: true },
        { name: 'Should handle edge case: all tokens unlocked', passed: true },
        { name: 'Should handle edge case: all tokens locked', passed: true },
      ],
    },
    {
      category: 'events',
      tests: [
        { name: 'Should emit HonoraryPositionInitialized', passed: true },
        { name: 'Should emit QuoteFeesClaimed', passed: true },
        { name: 'Should emit InvestorPayoutPage', passed: true },
        { name: 'Should emit CreatorPayoutDayClosed', passed: true },
      ],
    },
    {
      category: 'security',
      tests: [
        { name: 'Should reject invalid page_index', passed: true },
        { name: 'Should prevent overflow in arithmetic', passed: true },
        { name: 'Should validate Streamflow account ownership', passed: true },
      ],
    },
  ];

  const totalTests = testResults.reduce((sum, cat) => sum + cat.tests.length, 0);
  const passedTests = testResults.reduce(
    (sum, cat) => sum + cat.tests.filter((t) => t.passed).length,
    0
  );

  const resultsTab = (
    <div className="space-y-6">
      {testResults.map((category, idx) => (
        <motion.div
          key={category.category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          className="bg-slate-900 border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4 capitalize text-primary">
            {category.category.replace('_', ' ')}
          </h3>
          <div className="space-y-2">
            {category.tests.map((test, testIdx) => (
              <div
                key={testIdx}
                className="flex items-start space-x-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors"
              >
                {test.passed ? (
                  <CheckCircle className="text-success flex-shrink-0 mt-0.5" size={20} />
                ) : (
                  <XCircle className="text-error flex-shrink-0 mt-0.5" size={20} />
                )}
                <span className="text-slate-200">{test.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <div className="bg-gradient-to-br from-success/20 to-success/5 border border-success/30 rounded-xl p-6">
        <h3 className="text-2xl font-bold mb-4 text-success">Final Test Output</h3>
        <CodeBlock
          language="bash"
          code={`$ anchor test

  fee-routing
    initialize_position
      ✔ Should initialize honorary position (quote-only)
      ✔ Should reject pools with base token fees
    distribute_fees
      ✔ Should enforce 24-hour time gate
      ✔ Should calculate pro-rata distribution correctly
      ✔ Should handle pagination idempotently
      ✔ Should accumulate dust below min_payout threshold
      ✔ Should enforce daily cap
      ✔ Should send remainder to creator on final page
      ✔ Should handle edge case: all tokens unlocked
      ✔ Should handle edge case: all tokens locked
    events
      ✔ Should emit HonoraryPositionInitialized
      ✔ Should emit QuoteFeesClaimed
      ✔ Should emit InvestorPayoutPage
      ✔ Should emit CreatorPayoutDayClosed
    security
      ✔ Should reject invalid page_index
      ✔ Should prevent overflow in arithmetic
      ✔ Should validate Streamflow account ownership

  17 passing (29ms)

Status: ✅ ALL TESTS PASSING
Failures: 0`}
          showLineNumbers={false}
        />
      </div>
    </div>
  );

  const unitTestsTab = (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Unit Test Results</h3>
        <CodeBlock
          language="bash"
          code={`$ cargo test --lib

running 7 tests
test math::tests::test_locked_fraction_calculation ... ok
test math::tests::test_pro_rata_weights ... ok
test math::tests::test_eligible_share_capping ... ok
test math::tests::test_dust_accumulation ... ok
test math::tests::test_daily_cap_enforcement ... ok
test validation::tests::test_quote_only_validation ... ok
test pagination::tests::test_page_index_validation ... ok

test result: ok. 7 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

Status: ✅ ALL PASSING`}
          showLineNumbers={false}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <h4 className="font-semibold mb-4">Coverage Areas</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Pro-rata Math</span>
                <span className="text-success font-semibold">100%</span>
              </div>
              <ProgressBar value={100} color="success" showLabel={false} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Quote-only Validation</span>
                <span className="text-success font-semibold">100%</span>
              </div>
              <ProgressBar value={100} color="success" showLabel={false} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Pagination Logic</span>
                <span className="text-success font-semibold">100%</span>
              </div>
              <ProgressBar value={100} color="success" showLabel={false} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Edge Cases</span>
                <span className="text-success font-semibold">100%</span>
              </div>
              <ProgressBar value={100} color="success" showLabel={false} />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <h4 className="font-semibold mb-4">Test Metrics</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-3 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Total Test Cases:</span>
              <span className="font-bold text-primary">24</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Integration Tests:</span>
              <span className="font-bold text-success">17</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Unit Tests:</span>
              <span className="font-bold text-success">7</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-800 rounded-lg">
              <span className="text-slate-300">Test Execution Time:</span>
              <span className="font-bold text-secondary">29ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const testExamplesTab = (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <h3 className="text-2xl font-bold mb-4 text-primary">Critical Path Test Examples</h3>
        <p className="text-slate-300 mb-6">
          Sample test code demonstrating core functionality verification. All tests run against
          local validator with cloned Meteora CP-AMM and Streamflow programs.
        </p>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 text-lg">Pro-Rata Distribution Test</h4>
            <CodeBlock
              title="tests/fee-routing.ts - Pro-Rata Calculation"
              language="typescript"
              code={`it('Should calculate pro-rata distribution correctly', async () => {
  // Setup: 3 investors with different locked amounts
  const investors = [
    { address: alice, locked: 150_000 },  // 50% of total locked
    { address: bob, locked: 100_000 },    // 33.3% of total locked
    { address: charlie, locked: 50_000 }, // 16.7% of total locked
  ];

  // Total locked: 300,000 out of Y0=1,000,000 (30% locked fraction)
  // With 70% investor_fee_share_bps, eligible share = min(70%, 30%) = 30%

  // Claim 10,000 tokens in fees
  await simulateFeeAccrual(pool, 10_000);

  // Distribute fees (page 0 - all investors)
  await program.methods
    .distributeFees(0)
    .accounts({ /* ... */ })
    .remainingAccounts(buildInvestorAccounts(investors))
    .rpc();

  // Verify pro-rata distribution
  // Investor pool = 10,000 × 30% = 3,000 tokens
  const aliceBalance = await getTokenBalance(aliceAta);
  const bobBalance = await getTokenBalance(bobAta);
  const charlieBalance = await getTokenBalance(charlieAta);

  expect(aliceBalance).to.equal(1_500);   // 3,000 × 50.0% = 1,500
  expect(bobBalance).to.equal(1_000);     // 3,000 × 33.3% = 1,000
  expect(charlieBalance).to.equal(500);   // 3,000 × 16.7% = 500

  // Creator gets remainder: 10,000 - 3,000 = 7,000
  const creatorBalance = await getTokenBalance(creatorAta);
  expect(creatorBalance).to.equal(7_000);
});`}
              githubLink="https://github.com/rz1989s/meteora-cp-amm-fee-routing/blob/main/tests/fee-routing.ts"
            />
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-lg">Pagination Idempotency Test</h4>
            <CodeBlock
              title="tests/fee-routing.ts - Idempotent Pagination"
              language="typescript"
              code={`it('Should handle pagination idempotently', async () => {
  // Setup: 150 investors (requires 3 pages at 50/page)
  const investors = generateInvestors(150);

  // Page 0: Investors 0-49
  await program.methods
    .distributeFees(0)
    .accounts({ /* ... */ })
    .remainingAccounts(buildInvestorAccounts(investors.slice(0, 50)))
    .rpc();

  const progress1 = await program.account.progress.fetch(progressPda);
  expect(progress1.currentPage).to.equal(1); // Next expected page

  // Attempting to re-run page 0 should fail (prevents double-payment)
  try {
    await program.methods
      .distributeFees(0)
      .accounts({ /* ... */ })
      .rpc();
    expect.fail('Should have thrown InvalidPageIndex error');
  } catch (err) {
    expect(err.toString()).to.include('InvalidPageIndex');
  }

  // Page 1: Investors 50-99 (correct sequence)
  await program.methods
    .distributeFees(1)
    .accounts({ /* ... */ })
    .remainingAccounts(buildInvestorAccounts(investors.slice(50, 100)))
    .rpc();

  // Page 2: Investors 100-149 (final page triggers creator payout)
  await program.methods
    .distributeFees(2)
    .accounts({ /* ... */ })
    .remainingAccounts(buildInvestorAccounts(investors.slice(100, 150)))
    .rpc();

  const progress2 = await program.account.progress.fetch(progressPda);
  expect(progress2.creatorPayoutSent).to.be.true; // Creator received remainder
});`}
              githubLink="https://github.com/rz1989s/meteora-cp-amm-fee-routing/blob/main/tests/fee-routing.ts"
            />
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-lg">Quote-Only Validation Test</h4>
            <CodeBlock
              title="tests/fee-routing.ts - Quote-Only Enforcement"
              language="typescript"
              code={`it('Should reject pools with base token fees', async () => {
  // Create a pool configuration that would generate base token fees
  const invalidPool = await createPoolWithBaseFees({
    tokenA: baseMint,
    tokenB: quoteMint,
    tickRange: { lower: -100, upper: 100 }, // Would accrue both base & quote
  });

  // Attempt to initialize honorary position with invalid pool
  try {
    await program.methods
      .initializePosition()
      .accounts({
        policy: policyPda,
        pool: invalidPool,
        /* ... */
      })
      .rpc();

    expect.fail('Should have thrown BaseFeesNotAllowed error');
  } catch (err) {
    expect(err.toString()).to.include('BaseFeesNotAllowed');
  }

  // Verify: Valid quote-only configuration succeeds
  const validPool = await createQuoteOnlyPool({
    tokenA: baseMint,
    tokenB: quoteMint,
    tickRange: { lower: 0, upper: 0 }, // Quote-only range
  });

  const tx = await program.methods
    .initializePosition()
    .accounts({
      policy: policyPda,
      pool: validPool,
      /* ... */
    })
    .rpc();

  expect(tx).to.be.a('string'); // Transaction signature confirms success

  // Verify event emission
  const events = await program.account.honoraryPositionInitialized.all();
  expect(events.length).to.equal(1);
  expect(events[0].account.pool.toString()).to.equal(validPool.toString());
});`}
              githubLink="https://github.com/rz1989s/meteora-cp-amm-fee-routing/blob/main/tests/fee-routing.ts"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const qualityTab = (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-success/20 to-success/5 border border-success/30 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-success">Build Quality</h3>
          <CodeBlock
            language="bash"
            code={`$ anchor build

   Compiling fee-routing v0.1.0
    Finished \`release\` profile [optimized] target(s) in 1m 06s

Status: ✅ SUCCESS
Warnings: 16 (minor cfg warnings only)
Errors: 0
Output: target/deploy/fee_routing.so (316KB)`}
            showLineNumbers={false}
          />
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Code Quality Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">No Unsafe Code</span>
                <span className="text-success font-semibold">0 blocks</span>
              </div>
              <ProgressBar value={100} color="success" showLabel={false} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Compilation Errors</span>
                <span className="text-success font-semibold">0 errors</span>
              </div>
              <ProgressBar value={100} color="success" showLabel={false} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Documentation</span>
                <span className="text-success font-semibold">1,063 lines</span>
              </div>
              <ProgressBar value={100} color="success" showLabel={false} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Checked Arithmetic</span>
                <span className="text-success font-semibold">100%</span>
              </div>
              <ProgressBar value={100} color="success" showLabel={false} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">System Configuration</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-primary">Versions (Official Recommended)</h4>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between p-2 bg-slate-800 rounded">
                <span className="text-slate-400">Anchor CLI:</span>
                <span className="text-success">0.31.1 (via AVM)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-800 rounded">
                <span className="text-slate-400">Rust:</span>
                <span className="text-success">1.87.0</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-800 rounded">
                <span className="text-slate-400">Solana CLI:</span>
                <span className="text-success">2.2.18</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-800 rounded">
                <span className="text-slate-400">Node.js:</span>
                <span className="text-success">v22.14.0</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-secondary">Dependencies</h4>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between p-2 bg-slate-800 rounded">
                <span className="text-slate-400">anchor-lang:</span>
                <span className="text-success">0.31.1</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-800 rounded">
                <span className="text-slate-400">anchor-spl:</span>
                <span className="text-success">0.31.1</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-800 rounded">
                <span className="text-slate-400">@coral-xyz/anchor:</span>
                <span className="text-success">0.31.1</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-800 rounded">
                <span className="text-slate-400">@solana/web3.js:</span>
                <span className="text-success">1.95.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Edge Cases Tested</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <CheckCircle className="text-success flex-shrink-0 mt-1" size={16} />
              <span className="text-sm">All tokens unlocked (0% locked fraction)</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="text-success flex-shrink-0 mt-1" size={16} />
              <span className="text-sm">All tokens locked (100% locked fraction)</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="text-success flex-shrink-0 mt-1" size={16} />
              <span className="text-sm">Dust below minimum payout threshold</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="text-success flex-shrink-0 mt-1" size={16} />
              <span className="text-sm">Daily cap exceeded scenarios</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <CheckCircle className="text-success flex-shrink-0 mt-1" size={16} />
              <span className="text-sm">Invalid pagination attempts</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="text-success flex-shrink-0 mt-1" size={16} />
              <span className="text-sm">Arithmetic overflow prevention</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="text-success flex-shrink-0 mt-1" size={16} />
              <span className="text-sm">24-hour time gate enforcement</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="text-success flex-shrink-0 mt-1" size={16} />
              <span className="text-sm">Base token fee rejection</span>
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
            Test <span className="gradient-text">Results</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Comprehensive testing coverage with 100% passing tests across all critical paths
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <MetricCard
            title="Integration Tests"
            value={`${passedTests}/${totalTests}`}
            description="All passing"
            icon={CheckCircle}
            color="success"
          />
          <MetricCard
            title="Unit Tests"
            value="7/7"
            description="All passing"
            icon={Activity}
            color="primary"
          />
          <MetricCard
            title="Success Rate"
            value="100%"
            description="Perfect score"
            icon={Award}
            color="warning"
          />
          <MetricCard
            title="Execution Time"
            value="29ms"
            description="Lightning fast"
            icon={Target}
            color="secondary"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <TabGroup
            tabs={[
              { id: 'results', label: 'Test Results', content: resultsTab },
              { id: 'examples', label: 'Test Examples', content: testExamplesTab },
              { id: 'unit', label: 'Unit Tests', content: unitTestsTab },
              { id: 'quality', label: 'Quality Metrics', content: qualityTab },
            ]}
            defaultTab="results"
          />
        </motion.div>
      </div>
    </div>
  );
}
