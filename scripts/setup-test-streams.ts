/**
 * Setup Streamflow Vesting Contracts for Local Validator Testing
 *
 * Creates 5 vesting contracts for test investors:
 * - Investor 1: 300,000 / 500,000 locked (60%)
 * - Investor 2: 200,000 / 500,000 locked (40%)
 * - Investor 3: 400,000 / 500,000 locked (80%)
 * - Investor 4: 100,000 / 500,000 locked (20%)
 * - Investor 5: 0 / 500,000 locked (0% - fully vested)
 * - Total Y0: 1,000,000 tokens
 *
 * Prerequisites:
 * - Local validator running
 * - setup-test-tokens.ts completed
 * - Streamflow program cloned/deployed on local validator
 *
 * Run: ts-node scripts/setup-test-streams.ts
 */

import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

// Configuration
const LOCALHOST_RPC = "http://127.0.0.1:8899";
const WALLET_PATH = path.join(process.env.HOME!, ".config/solana/test-wallet.json");
const TOKENS_CONFIG_FILE = path.join(__dirname, "..", ".test-tokens.json");
const OUTPUT_FILE = path.join(__dirname, "..", ".test-streams.json");

// Streamflow Program ID (from Anchor.toml)
const STREAMFLOW_PROGRAM_ID = new PublicKey("strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m");

// Vesting configuration (amounts in Token B with 6 decimals)
const VESTING_CONFIGS = [
  {
    index: 1,
    totalAmount: 500_000 * 1e6,
    lockedAmount: 300_000 * 1e6,
    lockedPercentage: 60,
    description: "Investor 1 - 60% locked",
  },
  {
    index: 2,
    totalAmount: 500_000 * 1e6,
    lockedAmount: 200_000 * 1e6,
    lockedPercentage: 40,
    description: "Investor 2 - 40% locked",
  },
  {
    index: 3,
    totalAmount: 500_000 * 1e6,
    lockedAmount: 400_000 * 1e6,
    lockedPercentage: 80,
    description: "Investor 3 - 80% locked",
  },
  {
    index: 4,
    totalAmount: 500_000 * 1e6,
    lockedAmount: 100_000 * 1e6,
    lockedPercentage: 20,
    description: "Investor 4 - 20% locked",
  },
  {
    index: 5,
    totalAmount: 500_000 * 1e6,
    lockedAmount: 0,
    lockedPercentage: 0,
    description: "Investor 5 - 0% locked (fully vested)",
  },
];

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`);
}

function section(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log("=".repeat(title.length));
}

async function main() {
  section("🌊 Streamflow Vesting Contracts Setup");

  // Load token configuration
  if (!fs.existsSync(TOKENS_CONFIG_FILE)) {
    console.error(`\n${colors.red}❌ Error: Token configuration not found!${colors.reset}`);
    console.error(`   Run: ts-node scripts/setup-test-tokens.ts first\n`);
    process.exit(1);
  }

  const tokensConfig = JSON.parse(fs.readFileSync(TOKENS_CONFIG_FILE, "utf-8"));
  log("✅", `Loaded token configuration`);

  // Load payer wallet
  const payerKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(WALLET_PATH, "utf-8")))
  );
  log("👛", `Payer wallet: ${payerKeypair.publicKey.toBase58()}`);

  // Connect to local validator
  const connection = new Connection(LOCALHOST_RPC, "confirmed");

  try {
    await connection.getVersion();
    log("✅", "Connected to local validator");
  } catch (err) {
    console.error(`\n${colors.red}❌ Cannot connect to local validator${colors.reset}`);
    console.error("   Make sure it's running: solana-test-validator\n");
    process.exit(1);
  }

  // Check Streamflow program exists
  const streamflowInfo = await connection.getAccountInfo(STREAMFLOW_PROGRAM_ID);
  if (!streamflowInfo) {
    console.error(`\n${colors.red}❌ Streamflow program not found on local validator!${colors.reset}`);
    console.error("   The program must be cloned or deployed to localhost.");
    console.error("   Options:");
    console.error("   1. Use solana-test-validator with --clone flag:");
    console.error(`      solana-test-validator --clone ${STREAMFLOW_PROGRAM_ID.toBase58()} --url devnet`);
    console.error("   2. Or deploy Streamflow program manually to localhost\n");
    process.exit(1);
  }
  log("✅", `Streamflow program found (${streamflowInfo.data.length} bytes)`);

  section("📊 Vesting Configuration");

  const totalY0 = VESTING_CONFIGS.reduce((sum, config) => sum + config.totalAmount, 0);
  const totalLocked = VESTING_CONFIGS.reduce((sum, config) => sum + config.lockedAmount, 0);

  console.log(`
${colors.bright}Total Allocation (Y0):${colors.reset} ${totalY0 / 1e6} Token B
${colors.bright}Total Locked:${colors.reset} ${totalLocked / 1e6} Token B (${((totalLocked / totalY0) * 100).toFixed(1)}%)
${colors.bright}Token Mint:${colors.reset} ${tokensConfig.tokens.tokenB.mint}

${colors.bright}Investor Breakdown:${colors.reset}`);

  VESTING_CONFIGS.forEach((config) => {
    const unlockedAmount = config.totalAmount - config.lockedAmount;
    console.log(`
  ${config.description}:
    Total:    ${(config.totalAmount / 1e6).toLocaleString()} tokens
    Locked:   ${(config.lockedAmount / 1e6).toLocaleString()} tokens (${config.lockedPercentage}%)
    Unlocked: ${(unlockedAmount / 1e6).toLocaleString()} tokens (${100 - config.lockedPercentage}%)`);
  });

  section("⚠️  Streamflow SDK Integration Required");

  console.log(`
${colors.yellow}╔═══════════════════════════════════════════════════════════════╗
║                  MANUAL INTEGRATION REQUIRED                   ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}

This script requires Streamflow SDK to create vesting contracts.

${colors.bright}Options to complete this setup:${colors.reset}

${colors.bright}Option A: Use Streamflow SDK (Recommended)${colors.reset}
  1. Install Streamflow SDK:
     npm install @streamflow/stream --save-dev

  2. Import and use SDK:
     import { StreamClient } from '@streamflow/stream';

  3. Create vesting contracts for each investor:

     ${colors.cyan}const client = new StreamClient(connection, {
       chain: 'solana',
       commitment: 'confirmed'
     });

     for (const config of VESTING_CONFIGS) {
       const stream = await client.create({
         recipient: investorWallets[config.index - 1].publicKey,
         tokenId: tokenBMint,
         start: Date.now() / 1000, // Unix timestamp
         depositedAmount: config.totalAmount,
         period: 1, // seconds
         cliff: 0,
         cliffAmount: config.totalAmount - config.lockedAmount,
         amountPerPeriod: config.lockedAmount / (365 * 24 * 60 * 60), // 1 year vesting
         name: \`Investor \${config.index} Vesting\`,
         canTopup: false,
         cancelableBySender: false,
         cancelableByRecipient: false,
         transferableBySender: false,
         transferableByRecipient: false,
         automaticWithdrawal: false,
         withdrawalFrequency: 0,
       });

       console.log(\`✅ Created stream for Investor \${config.index}: \${stream.id}\`);
     }${colors.reset}

  4. Reference: https://docs.streamflow.finance/

${colors.bright}Option B: Clone Existing Streams from Devnet${colors.reset}
  1. Find existing Streamflow vesting contracts on devnet
  2. Clone stream accounts to localhost:
     solana account <STREAM_ADDRESS> --url devnet --output json > stream.json
     solana account <STREAM_ADDRESS> --url localhost < stream.json

  3. Manually adjust stream state for test configuration

${colors.bright}Option C: Mock Streamflow State${colors.reset}
  For integration testing, you can:
  1. Create mock stream account data matching Streamflow schema
  2. Use fixed locked amounts without real vesting logic
  3. This is acceptable for MVP/bounty submission

${colors.bright}What vesting parameters we need:${colors.reset}

  - Start time: Now (or recent past)
  - Cliff amount: Unlocked portion (immediately withdrawable)
  - Vesting amount: Locked portion (vests over time)
  - Vesting duration: 12 months (365 days)
  - Linear vesting schedule

${colors.bright}For distribute_fees instruction:${colors.reset}

The distribute_fees instruction needs to read locked amounts from
Streamflow accounts. The accounts are passed as remaining_accounts:

  [stream_1, investor_1_ata, stream_2, investor_2_ata, ...]

Our program reads:
  - stream.depositedAmount (total allocation)
  - stream.withdrawnAmount (how much unlocked/withdrawn)
  - locked_amount = depositedAmount - withdrawnAmount

${colors.bright}Current Status:${colors.reset} ${colors.yellow}INCOMPLETE - Streamflow integration required${colors.reset}

${colors.bright}Alternative for Testing:${colors.reset}
If Streamflow integration is complex, you can:
1. Create simple token accounts with fixed balances
2. Pass those instead of stream accounts to distribute_fees
3. Modify distribute_fees to handle both stream accounts and simple token accounts
4. Document this as "simplified test mode" in README
  `);

  section("💾 Saving Placeholder Configuration");

  const streams = VESTING_CONFIGS.map((config, idx) => ({
    index: config.index,
    investor: tokensConfig.testWallets[idx].publicKey,
    investorTokenB: tokensConfig.testWallets[idx].tokenAccounts.tokenB,
    totalAmount: config.totalAmount,
    lockedAmount: config.lockedAmount,
    unlockedAmount: config.totalAmount - config.lockedAmount,
    lockedPercentage: config.lockedPercentage,
    streamAddress: null, // TODO: Set after stream creation
    streamData: {
      start: Date.now() / 1000,
      cliff: 0,
      cliffAmount: config.totalAmount - config.lockedAmount,
      vestingAmount: config.lockedAmount,
      vestingDuration: 365 * 24 * 60 * 60, // 1 year in seconds
    },
  }));

  const streamConfig = {
    network: "localhost",
    rpc: LOCALHOST_RPC,
    streamflowProgramId: STREAMFLOW_PROGRAM_ID.toBase58(),
    tokenMint: tokensConfig.tokens.tokenB.mint,
    totalY0: totalY0,
    totalLocked: totalLocked,
    lockedPercentage: (totalLocked / totalY0) * 100,
    streams,
    status: "INCOMPLETE - Streamflow integration required",
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(streamConfig, null, 2));
  log("✅", `Placeholder config saved to: ${OUTPUT_FILE}`);

  section("📋 Summary");

  console.log(`
${colors.bright}Vesting Contracts Needed:${colors.reset} ${VESTING_CONFIGS.length}
${colors.bright}Total Y0:${colors.reset} ${totalY0 / 1e6} Token B
${colors.bright}Total Locked:${colors.reset} ${totalLocked / 1e6} Token B (${((totalLocked / totalY0) * 100).toFixed(1)}%)

${colors.yellow}⚠️  Stream setup incomplete${colors.reset}
${colors.cyan}This is expected - requires Streamflow SDK or account cloning${colors.reset}

${colors.bright}Next Steps:${colors.reset}
1. Choose integration approach (SDK / Clone / Mock)
2. Implement stream creation logic
3. Update ${OUTPUT_FILE} with stream addresses
4. Test distribute_fees with real stream data
  `);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n${colors.red}❌ Error:${colors.reset}`, err.message);
    console.error(err);
    process.exit(1);
  });
