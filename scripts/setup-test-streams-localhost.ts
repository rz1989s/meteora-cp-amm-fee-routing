/**
 * Setup Mock Streamflow Vesting Data for Localhost Testing
 *
 * Creates realistic vesting data WITHOUT actual Streamflow contracts
 * (Streamflow SDK doesn't work on localhost - requires devnet accounts)
 *
 * Generates:
 * - 5 investor wallets with token accounts
 * - Realistic vesting schedules (40% cliff, 60% linear over 1 year)
 * - Mock stream metadata that matches Streamflow structure
 *
 * Prerequisites:
 * - Local validator running
 * - setup-test-tokens.ts completed (.test-tokens.json exists)
 *
 * Run: ts-node scripts/setup-test-streams-localhost.ts
 */

import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import { BN } from "@coral-xyz/anchor";

// Configuration
const LOCALHOST_RPC = "http://127.0.0.1:8899";
const WALLET_PATH = path.join(process.env.HOME!, ".config/solana/test-wallet.json");
const TOKENS_CONFIG_FILE = path.join(__dirname, "..", ".test-tokens.json");
const OUTPUT_FILE = path.join(__dirname, "..", ".test-streams.json");

// Investor configurations (matching original setup-test-streams.ts)
const INVESTORS = [
  { name: "Investor 1", totalTokens: 1_000_000, lockedPercent: 80 },
  { name: "Investor 2", totalTokens: 800_000, lockedPercent: 60 },
  { name: "Investor 3", totalTokens: 1_200_000, lockedPercent: 90 },
  { name: "Investor 4", totalTokens: 600_000, lockedPercent: 50 },
  { name: "Investor 5", totalTokens: 400_000, lockedPercent: 40 },
];

const CLIFF_PERCENT = 40; // 40% unlocked at TGE
const VESTING_DURATION = 365 * 24 * 60 * 60; // 1 year in seconds
const TOKEN_DECIMALS = 6; // USDC-like

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`);
}

function section(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log("=".repeat(title.length));
}

// Derive mock Streamflow metadata PDA (for realistic structure)
// Note: This is a simplified derivation for mock data - real Streamflow uses different seeds
function deriveStreamMetadata(recipient: PublicKey, sender: PublicKey, index: number): PublicKey {
  const STREAMFLOW_PROGRAM_ID = new PublicKey("strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m");
  // Use simplified seed structure to avoid max seed length issues
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      sender.toBuffer().slice(0, 16), // First 16 bytes of sender
      Buffer.from([index]),
    ],
    STREAMFLOW_PROGRAM_ID
  );
  return pda;
}

async function main() {
  section("🏦 Mock Streamflow Setup for Localhost");
  console.log(`${colors.yellow}⚠️  This creates MOCK vesting data (no real Streamflow contracts)${colors.reset}`);
  console.log(`${colors.cyan}✨  Perfect for localhost testing with realistic data!${colors.reset}\n`);

  // Load token configuration
  if (!fs.existsSync(TOKENS_CONFIG_FILE)) {
    console.error(`\n${colors.red}❌ Error: Token configuration not found!${colors.reset}`);
    console.error(`   Run: ts-node scripts/setup-test-tokens.ts first\n`);
    process.exit(1);
  }

  const tokensConfig = JSON.parse(fs.readFileSync(TOKENS_CONFIG_FILE, "utf-8"));
  log("✅", `Loaded token configuration`);

  // Load payer wallet
  const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(WALLET_PATH, "utf-8")))
  );
  log("👛", `Payer: ${payer.publicKey.toBase58()}`);

  // Connect to localhost
  const connection = new Connection(LOCALHOST_RPC, "confirmed");

  try {
    const version = await connection.getVersion();
    log("✅", `Connected to localhost (version: ${version["solana-core"]})`);
  } catch (err) {
    console.error(`\n${colors.red}❌ Cannot connect to localhost validator${colors.reset}`);
    console.error("   Make sure it's running: solana-test-validator\n");
    process.exit(1);
  }

  // Use Token B from tokens config as vesting token
  const tokenMint = new PublicKey(tokensConfig.tokens.tokenB.mint);
  log("🪙", `Vesting token (Token B): ${tokenMint.toBase58()}`);

  section("👥 Creating Investor Wallets");

  const now = Math.floor(Date.now() / 1000);
  const startTime = now - (30 * 24 * 60 * 60); // Started 30 days ago (some already vested)
  const endTime = startTime + VESTING_DURATION;

  const streams: any[] = [];
  let totalAllocation = 0;

  for (let i = 0; i < INVESTORS.length; i++) {
    const investor = INVESTORS[i];
    console.log(`\n${colors.bright}${i + 1}. ${investor.name}${colors.reset}`);

    // Generate investor wallet
    const recipientKeypair = Keypair.generate();
    log("🔑", `Wallet: ${recipientKeypair.publicKey.toBase58()}`);

    // Fund with SOL
    log("💰", `Funding with 5 SOL...`);
    const fundTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: recipientKeypair.publicKey,
        lamports: 5 * LAMPORTS_PER_SOL,
      })
    );
    await sendAndConfirmTransaction(connection, fundTx, [payer]);

    // Create token account
    log("🏦", `Creating Token B account...`);
    const recipientATA = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      tokenMint,
      recipientKeypair.publicKey
    );
    log("✅", `ATA: ${recipientATA.address.toBase58()}`);

    // Calculate vesting amounts
    const cliffAmount = Math.floor(investor.totalTokens * CLIFF_PERCENT / 100);
    const vestedAmount = investor.totalTokens - cliffAmount;
    const elapsedTime = now - startTime;
    const vestedSoFar = Math.min(
      cliffAmount + Math.floor(vestedAmount * elapsedTime / VESTING_DURATION),
      investor.totalTokens
    );
    const lockedAmount = Math.floor(investor.totalTokens * investor.lockedPercent / 100);

    log("📊", `Total: ${investor.totalTokens.toLocaleString()} tokens`);
    log("📊", `Cliff (${CLIFF_PERCENT}%): ${cliffAmount.toLocaleString()} tokens`);
    log("📊", `Vested so far: ${vestedSoFar.toLocaleString()} tokens`);
    log("📊", `Still locked: ${lockedAmount.toLocaleString()} tokens (${investor.lockedPercent}%)`);

    // Generate realistic metadata PDA
    const metadataId = deriveStreamMetadata(recipientKeypair.publicKey, payer.publicKey, i);

    streams.push({
      investor: investor.name,
      recipient: recipientKeypair.publicKey.toBase58(),
      recipientSecretKey: Array.from(recipientKeypair.secretKey),
      recipientATA: recipientATA.address.toBase58(),
      metadataId: metadataId.toBase58(),
      schedule: {
        totalAmount: investor.totalTokens,
        cliffAmount,
        vestedAmount,
        startTime,
        endTime,
        cliff: startTime,
        period: 1,
        cliffPercent: CLIFF_PERCENT,
      },
      currentStatus: {
        vestedSoFar,
        lockedAmount,
        lockedPercent: investor.lockedPercent,
        elapsedDays: Math.floor(elapsedTime / (24 * 60 * 60)),
        totalDays: Math.floor(VESTING_DURATION / (24 * 60 * 60)),
      },
      mock: true,
    });

    totalAllocation += investor.totalTokens;
  }

  section("💾 Saving Configuration");

  const config = {
    network: "localhost",
    rpc: LOCALHOST_RPC,
    tokenMint: tokenMint.toBase58(),
    decimals: TOKEN_DECIMALS,
    totalAllocation,
    vestingSchedule: {
      cliffPercent: CLIFF_PERCENT,
      vestingDuration: VESTING_DURATION,
      startTime,
      endTime,
      currentTime: now,
    },
    streams,
    summary: {
      total: INVESTORS.length,
      successful: INVESTORS.length,
      failed: 0,
    },
    timestamp: new Date().toISOString(),
    status: "COMPLETE - Mock vesting data for localhost testing",
    note: "These are MOCK streams (no actual Streamflow contracts). Perfect for testing fee distribution logic.",
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(config, null, 2));
  log("✅", `Configuration saved to: ${OUTPUT_FILE}`);

  section("📊 Summary");

  console.log(`
${colors.bright}Vesting Token:${colors.reset} ${tokenMint.toBase58()}
${colors.bright}Total Allocation:${colors.reset} ${totalAllocation.toLocaleString()} tokens
${colors.bright}Investors Created:${colors.reset} ${INVESTORS.length}
${colors.bright}Network:${colors.reset} Localhost
${colors.bright}Config File:${colors.reset} ${OUTPUT_FILE}

${colors.bright}Current Locked Amounts (for testing):${colors.reset}`);

  streams.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.investor.padEnd(12)} ${s.currentStatus.lockedAmount.toLocaleString().padStart(10)} tokens locked (${s.currentStatus.lockedPercent}%)`);
  });

  console.log(`
${colors.green}${colors.bright}✅ Mock vesting data created successfully!${colors.reset}

${colors.cyan}Perfect for localhost testing:${colors.reset}
  - Realistic vesting schedules
  - Proper token accounts created
  - Variable locked percentages for testing pro-rata logic
  - No external dependencies

${colors.bright}Next Steps:${colors.reset}
  1. ${colors.cyan}npm run test:local${colors.reset} - Run integration tests
  2. ${colors.cyan}npm run test:e2e${colors.reset} - Run E2E tests with mock data

${colors.dim}Note: For production, deploy on devnet and use real Streamflow contracts${colors.reset}
  `);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n${colors.red}Error:${colors.reset}`, err.message);
    console.error(err);
    process.exit(1);
  });
