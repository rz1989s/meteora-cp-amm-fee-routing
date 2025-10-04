'use client';

import { motion } from 'framer-motion';
import { Book, Terminal, AlertTriangle, FileCode, Rocket, Settings } from 'lucide-react';
import TabGroup from '@/components/TabGroup';
import CodeBlock from '@/components/CodeBlock';

export default function DocumentationPage() {
  const quickStartTab = (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Rocket className="text-primary" size={24} />
          <h3 className="text-2xl font-bold">Quick Start Guide</h3>
        </div>
        <p className="text-slate-300 mb-6">
          Get the program up and running in minutes. Follow these steps to build and test locally.
        </p>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 text-lg">1. Prerequisites</h4>
            <CodeBlock
              language="bash"
              code={`# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install AVM (Anchor Version Manager)
cargo install --git https://github.com/coral-xyz/anchor avm --force

# Install Anchor 0.31.1
avm install 0.31.1
avm use 0.31.1

# Install Node dependencies
npm install -g yarn
yarn --version`}
              showLineNumbers={false}
            />
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-lg">2. Clone & Setup</h4>
            <CodeBlock
              language="bash"
              code={`# Clone the repository
git clone https://github.com/rz1989s/meteora-cp-amm-fee-routing.git
cd meteora-cp-amm-fee-routing

# Install project dependencies
npm install

# Verify Anchor installation
anchor --version  # Should show: anchor-cli 0.31.1`}
              showLineNumbers={false}
            />
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-lg">3. Build the Program</h4>
            <CodeBlock
              language="bash"
              code={`# Build with Anchor (recommended)
anchor build

# Alternative: Build with cargo-build-sbf
cargo build-sbf

# Expected output:
# ✓ Compiling fee-routing v0.1.0
# ✓ Finished release profile [optimized]
# ✓ Binary: target/deploy/fee_routing.so (316KB)`}
              showLineNumbers={false}
            />
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-lg">4. Run Tests</h4>
            <CodeBlock
              language="bash"
              code={`# Run all tests (integration + unit)
anchor test

# Run only unit tests
cargo test --manifest-path programs/fee-routing/Cargo.toml --lib

# Run integration tests without rebuild
anchor test --skip-build

# Expected output:
# ✓ 17 passing (29ms)
# ✓ 0 failing`}
              showLineNumbers={false}
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="text-secondary" size={24} />
          <h3 className="text-xl font-bold">Configuration</h3>
        </div>
        <p className="text-slate-300 mb-4">
          Ensure your environment is properly configured. If anchor --version shows wrong version:
        </p>
        <CodeBlock
          language="bash"
          code={`# Add AVM to PATH
export PATH="$HOME/.avm/bin:$PATH"

# Make it permanent (zsh)
echo 'export PATH="$HOME/.avm/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Make it permanent (bash)
echo 'export PATH="$HOME/.avm/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
anchor --version  # Should now show: anchor-cli 0.31.1`}
          showLineNumbers={false}
        />
      </div>
    </div>
  );

  const apiTab = (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FileCode className="text-primary" size={24} />
          <h3 className="text-2xl font-bold">Program Instructions</h3>
        </div>

        <div className="space-y-8">
          <div>
            <h4 className="text-xl font-semibold mb-4 text-primary">initialize_position</h4>
            <p className="text-slate-300 mb-4">
              Creates an honorary quote-only LP position in the specified Meteora DAMM V2 pool.
              The position is owned by a program PDA and will accrue fees automatically.
            </p>

            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <h5 className="font-semibold mb-3">Accounts</h5>
              <div className="space-y-2 text-sm font-mono">
                <div className="grid grid-cols-3 gap-4 pb-2 border-b border-slate-700 text-slate-400">
                  <span>Name</span>
                  <span>Mutability</span>
                  <span>Signer</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-2">
                  <span>policy</span>
                  <span className="text-slate-400">read-only</span>
                  <span className="text-slate-400">no</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-2">
                  <span>pool</span>
                  <span className="text-slate-400">read-only</span>
                  <span className="text-slate-400">no</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-2">
                  <span>position</span>
                  <span className="text-warning">mutable</span>
                  <span className="text-slate-400">no</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-2">
                  <span>position_owner</span>
                  <span className="text-slate-400">read-only</span>
                  <span className="text-slate-400">no (PDA)</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-2">
                  <span>creator</span>
                  <span className="text-slate-400">read-only</span>
                  <span className="text-success">yes</span>
                </div>
              </div>
            </div>

            <CodeBlock
              title="Example Usage (TypeScript)"
              language="typescript"
              code={`const [policyPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("policy")],
  program.programId
);

const [positionOwner] = PublicKey.findProgramAddressSync(
  [Buffer.from("vault"), vault.toBuffer(), Buffer.from("investor_fee_pos_owner")],
  program.programId
);

await program.methods
  .initializePosition()
  .accounts({
    policy: policyPda,
    pool: poolPubkey,
    position: positionPubkey,
    positionOwner: positionOwner,
    creator: creator.publicKey,
    meteoraProgram: METEORA_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .signers([creator])
  .rpc();`}
            />
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-4 text-secondary">distribute_fees</h4>
            <p className="text-slate-300 mb-4">
              Permissionless instruction that claims accumulated fees from the honorary position
              and distributes them pro-rata to investors. Supports pagination for large investor lists.
            </p>

            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <h5 className="font-semibold mb-3">Parameters</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-slate-900 rounded">
                  <span className="font-mono">page_index</span>
                  <span className="text-slate-400">u32 - Current pagination page (0-indexed)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <h5 className="font-semibold mb-3">Remaining Accounts</h5>
              <p className="text-xs text-slate-400 mb-2">
                Pass alternating pairs of Streamflow stream account and investor token account:
              </p>
              <div className="space-y-1 text-sm font-mono">
                <div className="text-slate-300">[stream_0, investor_ata_0, stream_1, investor_ata_1, ...]</div>
              </div>
            </div>

            <CodeBlock
              title="Example Usage (TypeScript)"
              language="typescript"
              code={`const [progressPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("progress")],
  program.programId
);

// Build remaining accounts array
const remainingAccounts = investors.flatMap((inv) => [
  { pubkey: inv.streamAccount, isSigner: false, isWritable: false },
  { pubkey: inv.tokenAccount, isSigner: false, isWritable: true },
]);

await program.methods
  .distributeFees(0) // page_index = 0
  .accounts({
    policy: policyPda,
    progress: progressPda,
    pool: poolPubkey,
    position: positionPubkey,
    positionOwner: positionOwner,
    vault: vaultPubkey,
    meteoraProgram: METEORA_PROGRAM_ID,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .remainingAccounts(remainingAccounts)
  .rpc();`}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const errorsTab = (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="text-warning" size={24} />
          <h3 className="text-2xl font-bold">Error Codes</h3>
        </div>

        <div className="space-y-4">
          {[
            {
              code: '6000',
              name: 'InvalidQuoteMint',
              description: 'The pool quote mint does not match the policy quote mint',
              solution: 'Verify that the pool uses the correct quote token specified in the policy',
            },
            {
              code: '6001',
              name: 'BaseFeesNotAllowed',
              description: 'Pool configuration would generate base token fees (not quote-only)',
              solution: 'Choose a different pool or adjust position parameters to ensure quote-only fees',
            },
            {
              code: '6002',
              name: 'DistributionTooEarly',
              description: '24-hour time gate not met since last distribution',
              solution: 'Wait until at least 24 hours have passed since the last distribution',
            },
            {
              code: '6003',
              name: 'InvalidPageIndex',
              description: 'Page index does not match expected current page in Progress state',
              solution: 'Call distribute_fees with the correct page_index (check Progress.current_page)',
            },
            {
              code: '6004',
              name: 'DailyCapExceeded',
              description: 'Distribution would exceed the configured daily cap',
              solution: 'Excess fees are carried over to the next day automatically',
            },
            {
              code: '6005',
              name: 'InvalidStreamflowAccount',
              description: 'Provided Streamflow account ownership or data is invalid',
              solution: 'Ensure all Streamflow accounts are valid and owned by the Streamflow program',
            },
            {
              code: '6006',
              name: 'ArithmeticOverflow',
              description: 'Arithmetic operation would overflow',
              solution: 'This is a safety check. Contact the program administrator if encountered.',
            },
          ].map((error, idx) => (
            <motion.div
              key={error.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-slate-800 border border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-lg">{error.name}</h4>
                  <span className="text-sm text-slate-400 font-mono">Error Code: {error.code}</span>
                </div>
                <span className="px-3 py-1 bg-error/20 text-error rounded-full text-sm font-semibold">
                  Error
                </span>
              </div>
              <p className="text-slate-300 mb-2">{error.description}</p>
              <div className="bg-slate-900 rounded p-3 mt-3">
                <span className="text-xs text-success font-semibold">Solution:</span>
                <p className="text-sm text-slate-300 mt-1">{error.solution}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const eventsTab = (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Terminal className="text-secondary" size={24} />
          <h3 className="text-2xl font-bold">Program Events</h3>
        </div>
        <p className="text-slate-300 mb-6">
          All state changes emit events for off-chain tracking and monitoring.
        </p>

        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-3 text-primary">HonoraryPositionInitialized</h4>
            <p className="text-sm text-slate-300 mb-3">
              Emitted when a new honorary position is created successfully.
            </p>
            <CodeBlock
              language="rust"
              code={`pub struct HonoraryPositionInitialized {
    pub position: Pubkey,
    pub pool: Pubkey,
    pub timestamp: i64,
}`}
              showLineNumbers={false}
            />
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-3 text-success">QuoteFeesClaimed</h4>
            <p className="text-sm text-slate-300 mb-3">
              Emitted when fees are claimed from the Meteora pool.
            </p>
            <CodeBlock
              language="rust"
              code={`pub struct QuoteFeesClaimed {
    pub position: Pubkey,
    pub amount_claimed: u64,
    pub timestamp: i64,
}`}
              showLineNumbers={false}
            />
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-3 text-secondary">InvestorPayoutPage</h4>
            <p className="text-sm text-slate-300 mb-3">
              Emitted for each page of investor distributions. Contains detailed payout information.
            </p>
            <CodeBlock
              language="rust"
              code={`pub struct InvestorPayoutPage {
    pub page_index: u32,
    pub num_investors: u32,
    pub total_paid_this_page: u64,
    pub recipients: Vec<Pubkey>,
    pub amounts: Vec<u64>,
    pub timestamp: i64,
}`}
              showLineNumbers={false}
            />
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-3 text-warning">CreatorPayoutDayClosed</h4>
            <p className="text-sm text-slate-300 mb-3">
              Emitted when creator receives the remainder and daily cycle closes.
            </p>
            <CodeBlock
              language="rust"
              code={`pub struct CreatorPayoutDayClosed {
    pub day: u64,
    pub creator_payout: u64,
    pub total_distributed_to_investors: u64,
    pub total_claimed: u64,
    pub timestamp: i64,
}`}
              showLineNumbers={false}
            />
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
            <span className="gradient-text">Documentation</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Complete guides, API reference, and troubleshooting resources
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <TabGroup
            tabs={[
              { id: 'quickstart', label: 'Quick Start', content: quickStartTab },
              { id: 'api', label: 'API Reference', content: apiTab },
              { id: 'errors', label: 'Error Codes', content: errorsTab },
              { id: 'events', label: 'Events', content: eventsTab },
            ]}
            defaultTab="quickstart"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/30 rounded-xl p-8 text-center"
        >
          <Book className="mx-auto mb-4 text-primary" size={48} />
          <h3 className="text-2xl font-bold mb-2">Need More Information?</h3>
          <p className="text-slate-300 mb-6">
            The full README.md contains 1,063 lines of comprehensive documentation covering
            architecture, implementation details, testing strategies, and deployment guides.
          </p>
          <a
            href="https://github.com/rz1989s/meteora-cp-amm-fee-routing#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-primary rounded-lg font-semibold hover:bg-primary/80 transition-all"
          >
            Read Full README on GitHub
          </a>
        </motion.div>
      </div>
    </div>
  );
}
