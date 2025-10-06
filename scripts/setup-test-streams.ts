/**
 * Setup Streamflow Vesting Contracts on DEVNET
 *
 * ⚠️ RUNS ON DEVNET (Streamflow SDK has cluster-specific runtime accounts)
 *
 * Creates 3-5 vesting contracts for test investors with realistic schedules:
 * - 40% unlocked at cliff (TGE)
 * - 60% vested linearly over 1 year
 *
 * Prerequisites:
 * - Devnet wallet with SOL balance (~2 SOL recommended)
 * - Wallet path: ~/.config/solana/test-wallet.json
 *
 * Run: npx ts-node scripts/setup-test-streams.ts
 */

import { Connection, Keypair } from "@solana/web3.js";
import { StreamflowSolana, ICluster, getBN } from "@streamflow/stream";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

// Configuration
const DEVNET_RPC = "https://api.devnet.solana.com";
const WALLET_PATH = path.join(process.env.HOME!, ".config/solana/test-wallet.json");
const OUTPUT_FILE = path.join(__dirname, "..", ".test-streams.json");

// Token decimals (6 decimals like USDC)
const TOKEN_DECIMALS = 6;

// Investor configurations
// All use same vesting schedule: 40% at cliff, 60% linear over 1 year
const INVESTORS = [
  { name: "Investor 1", totalTokens: 1_000_000 },
  { name: "Investor 2", totalTokens: 800_000 },
  { name: "Investor 3", totalTokens: 1_200_000 },
  { name: "Investor 4", totalTokens: 600_000 },
  { name: "Investor 5", totalTokens: 400_000 },
];

const CLIFF_PERCENT = 40; // 40% unlocked at TGE
const VESTING_DURATION = 365 * 24 * 60 * 60; // 1 year in seconds

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
  section("Setup: Streamflow Vesting Contracts on DEVNET");
  console.log(`${colors.yellow}⚠️  This script runs on DEVNET (Streamflow SDK limitation)${colors.reset}\n`);

  // Load payer wallet
  const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(WALLET_PATH, "utf-8")))
  );
  log("👛", `Payer: ${payer.publicKey.toBase58()}`);

  // Connect to devnet
  const connection = new Connection(DEVNET_RPC, "confirmed");
  log("🌐", "Connecting to Solana devnet...");

  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  const balanceSOL = balance / 1_000_000_000;
  log("💰", `Balance: ${balanceSOL.toFixed(4)} SOL`);

  if (balanceSOL < 0.5) {
    console.error(`\n${colors.red}⚠️  Insufficient balance!${colors.reset}`);
    console.error(`   Current: ${balanceSOL.toFixed(4)} SOL`);
    console.error(`   Required: ~2 SOL (for token creation + 5 streams)`);
    console.error(`\n   Request airdrop: solana airdrop 2 --url devnet`);
    process.exit(1);
  }

  section("Creating Vesting Token");

  log("🪙", "Creating token mint...");
  const tokenMint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    TOKEN_DECIMALS
  );
  log("✅", `Token mint: ${tokenMint.toBase58()}`);

  // Get sender token account
  const senderATA = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    tokenMint,
    payer.publicKey
  );
  log("✅", `Sender ATA: ${senderATA.address.toBase58()}`);

  // Calculate total tokens needed
  const totalTokensNeeded = INVESTORS.reduce((sum, inv) => sum + inv.totalTokens, 0);
  log("📊", `Total vesting allocation: ${totalTokensNeeded.toLocaleString()} tokens`);

  // Mint tokens
  log("💰", `Minting ${totalTokensNeeded.toLocaleString()} tokens...`);
  await mintTo(
    connection,
    payer,
    tokenMint,
    senderATA.address,
    payer,
    totalTokensNeeded * Math.pow(10, TOKEN_DECIMALS)
  );
  log("✅", "Tokens minted\n");

  section("Creating Streamflow Vesting Contracts");

  // Initialize Streamflow client (DEVNET)
  const streamClient = new StreamflowSolana.SolanaStreamClient(
    DEVNET_RPC,
    ICluster.Devnet,
    "confirmed"
  );
  log("✅", "Streamflow client initialized (devnet)\n");

  const now = Math.floor(Date.now() / 1000);
  const startTime = now + 60; // Start in 1 minute
  const endTime = startTime + VESTING_DURATION;

  const streams: any[] = [];
  let successCount = 0;

  for (const investor of INVESTORS) {
    console.log(`${colors.bright}Creating stream: ${investor.name}${colors.reset}`);
    console.log(`  Total: ${investor.totalTokens.toLocaleString()} tokens`);

    const cliffAmount = Math.floor(investor.totalTokens * CLIFF_PERCENT / 100);
    const vestedAmount = investor.totalTokens - cliffAmount;
    const amountPerPeriod = Math.floor(vestedAmount / VESTING_DURATION);

    console.log(`  Cliff (${CLIFF_PERCENT}%): ${cliffAmount.toLocaleString()} tokens`);
    console.log(`  Vested (${100 - CLIFF_PERCENT}%): ${vestedAmount.toLocaleString()} tokens over 1 year`);

    // Generate recipient
    const recipient = Keypair.generate();
    console.log(`  Recipient: ${recipient.publicKey.toBase58()}`);

    // Create recipient ATA
    const recipientATA = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      tokenMint,
      recipient.publicKey
    );

    const streamParams = {
      recipient: recipient.publicKey.toBase58(),
      tokenId: tokenMint.toBase58(),
      start: startTime,
      amount: getBN(investor.totalTokens, TOKEN_DECIMALS),
      period: 1,
      cliff: startTime,
      cliffAmount: getBN(cliffAmount, TOKEN_DECIMALS),
      amountPerPeriod: getBN(amountPerPeriod, TOKEN_DECIMALS),
      name: `Vesting - ${investor.name}`,
      canTopup: false,
      cancelableBySender: false,
      cancelableByRecipient: false,
      transferableBySender: false,
      transferableByRecipient: false,
      automaticWithdrawal: false,
      withdrawalFrequency: 0,
      partner: null,
    };

    try {
      const { ixs, txId, metadataId } = await streamClient.create(streamParams, {
        sender: payer as any
      });

      console.log(`${colors.green}  ✅ Stream created!${colors.reset}`);
      console.log(`  Metadata ID: ${metadataId}`);
      console.log(`  Transaction: ${txId}\n`);

      streams.push({
        investor: investor.name,
        recipient: recipient.publicKey.toBase58(),
        recipientATA: recipientATA.address.toBase58(),
        metadataId,
        transaction: txId,
        totalAmount: investor.totalTokens,
        cliffAmount,
        vestedAmount,
        startTime,
        endTime,
      });

      successCount++;

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error: any) {
      console.error(`${colors.red}  ❌ Failed:${colors.reset}`, error.message);

      streams.push({
        investor: investor.name,
        error: error.message,
        totalAmount: investor.totalTokens,
        cliffAmount,
        vestedAmount,
      });
    }
  }

  section("Saving Configuration");

  const config = {
    network: "devnet",
    rpc: DEVNET_RPC,
    tokenMint: tokenMint.toBase58(),
    decimals: TOKEN_DECIMALS,
    totalAllocation: totalTokensNeeded,
    vestingSchedule: {
      cliffPercent: CLIFF_PERCENT,
      vestingDuration: VESTING_DURATION,
      startTime,
      endTime,
    },
    streams,
    summary: {
      total: INVESTORS.length,
      successful: successCount,
      failed: INVESTORS.length - successCount,
    },
    timestamp: new Date().toISOString(),
    status: successCount === INVESTORS.length
      ? "COMPLETE - All streams created on devnet"
      : "PARTIAL - Some streams failed",
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(config, null, 2));
  log("✅", `Configuration saved to: ${OUTPUT_FILE}`);

  section("Summary");

  const totalCreated = streams.filter(s => s.metadataId).length;
  const totalFailed = streams.filter(s => s.error).length;

  console.log(`
${colors.bright}Token Mint:${colors.reset} ${tokenMint.toBase58()}
${colors.bright}Total Allocation:${colors.reset} ${totalTokensNeeded.toLocaleString()} tokens
${colors.bright}Streams Created:${colors.reset} ${totalCreated}/${INVESTORS.length}
${colors.bright}Failed:${colors.reset} ${totalFailed}
${colors.bright}Network:${colors.reset} Devnet
${colors.bright}Config File:${colors.reset} ${OUTPUT_FILE}
  `);

  if (totalCreated === INVESTORS.length) {
    console.log(`${colors.green}${colors.bright}✅ All vesting contracts created successfully!${colors.reset}\n`);
    console.log(`${colors.bright}Next Steps:${colors.reset}`);
    console.log(`1. Streams ready for integration testing`);
    console.log(`2. Use metadata IDs for distribute_fees tests\n`);
  } else if (totalCreated > 0) {
    console.log(`${colors.yellow}⚠️  Partial success${colors.reset}\n`);
  } else {
    console.log(`${colors.red}❌ All streams failed${colors.reset}\n`);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n${colors.red}Error:${colors.reset}`, err.message);
    console.error(err);
    process.exit(1);
  });
