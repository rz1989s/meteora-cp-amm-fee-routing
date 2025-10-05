/**
 * Setup CP-AMM Pool for Local Validator Testing
 *
 * Creates:
 * - Meteora CP-AMM pool with Token A (base) + Token B (quote)
 * - Adds liquidity: 100,000 Token A + 100,000 Token B
 * - Creates honorary NFT position owned by investor_fee_pos_owner PDA
 *
 * Prerequisites:
 * - Local validator running
 * - setup-test-tokens.ts completed (.test-tokens.json exists)
 * - Meteora CP-AMM program cloned/deployed on local validator
 *
 * Run: ts-node scripts/setup-test-pool.ts
 */

import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

// Configuration
const LOCALHOST_RPC = "http://127.0.0.1:8899";
const WALLET_PATH = path.join(process.env.HOME!, ".config/solana/test-wallet.json");
const TOKENS_CONFIG_FILE = path.join(__dirname, "..", ".test-tokens.json");
const OUTPUT_FILE = path.join(__dirname, "..", ".test-pool.json");

// Meteora CP-AMM Program ID (from Anchor.toml)
const CP_AMM_PROGRAM_ID = new PublicKey("cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG");

// Our fee-routing program ID
const FEE_ROUTING_PROGRAM_ID = new PublicKey("RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP");

// Pool configuration
const INITIAL_LIQUIDITY_TOKEN_A = 100_000 * 1e9; // 100k tokens (9 decimals)
const INITIAL_LIQUIDITY_TOKEN_B = 100_000 * 1e6; // 100k tokens (6 decimals)

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
  section("🏊 CP-AMM Pool Setup");

  // Load token configuration
  if (!fs.existsSync(TOKENS_CONFIG_FILE)) {
    console.error(`\n${colors.red}❌ Error: Token configuration not found!${colors.reset}`);
    console.error(`   Run: ts-node scripts/setup-test-tokens.ts first\n`);
    process.exit(1);
  }

  const tokensConfig = JSON.parse(fs.readFileSync(TOKENS_CONFIG_FILE, "utf-8"));
  log("✅", `Loaded token configuration from ${TOKENS_CONFIG_FILE}`);

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

  // Check CP-AMM program exists
  const cpAmmInfo = await connection.getAccountInfo(CP_AMM_PROGRAM_ID);
  if (!cpAmmInfo) {
    console.error(`\n${colors.red}❌ Meteora CP-AMM program not found on local validator!${colors.reset}`);
    console.error("   The program must be cloned or deployed to localhost.");
    console.error("   Options:");
    console.error("   1. Use solana-test-validator with --clone flag:");
    console.error(`      solana-test-validator --clone ${CP_AMM_PROGRAM_ID.toBase58()} --url devnet`);
    console.error("   2. Or deploy CP-AMM program manually to localhost\n");
    process.exit(1);
  }
  log("✅", `CP-AMM program found (${cpAmmInfo.data.length} bytes)`);

  section("🔧 Deriving Pool PDAs");

  const tokenAMint = new PublicKey(tokensConfig.tokens.tokenA.mint);
  const tokenBMint = new PublicKey(tokensConfig.tokens.tokenB.mint);

  log("🪙", `Token A: ${tokenAMint.toBase58()}`);
  log("🪙", `Token B: ${tokenBMint.toBase58()}`);

  // Derive investor fee position owner PDA (from our program)
  const vaultSeed = Buffer.from("vault");
  const investorFeePosOwnerSeed = Buffer.from("investor_fee_pos_owner");

  // Note: We need the actual vault address from the pool to derive position owner
  // For now, we'll create a placeholder pool keypair
  const poolKeypair = Keypair.generate();
  const vaultPubkey = poolKeypair.publicKey;

  const [investorFeePosOwner, posOwnerBump] = PublicKey.findProgramAddressSync(
    [vaultSeed, vaultPubkey.toBuffer(), investorFeePosOwnerSeed],
    FEE_ROUTING_PROGRAM_ID
  );

  log("🔑", `Investor Fee Position Owner PDA: ${investorFeePosOwner.toBase58()}`);
  log("🔑", `Bump: ${posOwnerBump}`);

  section("⚠️  CP-AMM SDK Integration Required");

  console.log(`
${colors.yellow}╔═══════════════════════════════════════════════════════════════╗
║                  MANUAL INTEGRATION REQUIRED                   ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}

This script requires Meteora CP-AMM SDK to:
1. Initialize a CP-AMM pool
2. Add liquidity to the pool
3. Create an NFT position owned by the program PDA

${colors.bright}Options to complete this setup:${colors.reset}

${colors.bright}Option A: Use Meteora SDK (Recommended)${colors.reset}
  1. Install Meteora SDK (if available):
     npm install @meteora-ag/dlmm --save-dev

  2. Import and use SDK functions:
     import { DLMM } from '@meteora-ag/dlmm';
     // Note: Verify if CP-AMM has similar SDK

  3. Create pool programmatically:
     - Initialize pool with Token A + Token B
     - Add liquidity: ${INITIAL_LIQUIDITY_TOKEN_A / 1e9} Token A + ${INITIAL_LIQUIDITY_TOKEN_B / 1e6} Token B
     - Create position owned by: ${investorFeePosOwner.toBase58()}

${colors.bright}Option B: Clone Existing Pool from Devnet${colors.reset}
  1. Find an existing CP-AMM pool on devnet with Token A + Token B
  2. Clone the pool account to localhost:
     solana account <POOL_ADDRESS> --url devnet --output json > pool.json
     solana account <POOL_ADDRESS> --url localhost < pool.json

  3. Manually adjust pool state for test tokens

${colors.bright}Option C: Manual Pool Creation via CLI${colors.reset}
  1. Use Meteora CLI (if available) to create pool
  2. Reference Meteora documentation:
     https://docs.meteora.ag/

${colors.bright}What needs to be implemented:${colors.reset}

${colors.cyan}// Pseudo-code for pool creation:${colors.reset}

const pool = await createCpAmmPool({
  connection,
  payer: payerKeypair,
  tokenMintA: tokenAMint,
  tokenMintB: tokenBMint,
  initialPrice: 1.0, // 1:1 price ratio
  feeBps: 30, // 0.3% fee
});

const position = await createPosition({
  pool,
  owner: investorFeePosOwner, // Our program PDA
  lowerPrice: 0.8,
  upperPrice: 1.2,
  liquidityAmount: /* calculate based on tokens */,
});

await addLiquidity({
  pool,
  position,
  amountA: ${INITIAL_LIQUIDITY_TOKEN_A},
  amountB: ${INITIAL_LIQUIDITY_TOKEN_B},
});

${colors.bright}For this bounty submission:${colors.reset}

Since we're focused on proving the fee-routing program logic works,
you can either:
1. Implement full CP-AMM integration (ideal)
2. Mock/stub the pool for integration tests (acceptable for MVP)
3. Document pool creation as manual step in README

${colors.yellow}Current Status: INCOMPLETE - Manual integration required${colors.reset}
  `);

  section("💾 Saving Placeholder Configuration");

  // Save what we know so far
  const config = {
    network: "localhost",
    rpc: LOCALHOST_RPC,
    cpAmmProgramId: CP_AMM_PROGRAM_ID.toBase58(),
    feeRoutingProgramId: FEE_ROUTING_PROGRAM_ID.toBase58(),
    tokens: {
      tokenA: tokensConfig.tokens.tokenA,
      tokenB: tokensConfig.tokens.tokenB,
    },
    pool: {
      address: null, // TODO: Set after pool creation
      tokenAVault: null,
      tokenBVault: null,
      lpMint: null,
      feeBps: 30,
    },
    position: {
      owner: investorFeePosOwner.toBase58(),
      ownerBump: posOwnerBump,
      nftMint: null, // TODO: Set after position creation
      address: null,
    },
    liquidity: {
      tokenA: INITIAL_LIQUIDITY_TOKEN_A,
      tokenB: INITIAL_LIQUIDITY_TOKEN_B,
    },
    status: "INCOMPLETE - CP-AMM integration required",
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(config, null, 2));
  log("✅", `Placeholder config saved to: ${OUTPUT_FILE}`);

  section("📋 Next Steps");

  console.log(`
${colors.bright}1.${colors.reset} Choose integration approach (SDK / Clone / Manual)
${colors.bright}2.${colors.reset} Implement pool creation logic
${colors.bright}3.${colors.reset} Update ${OUTPUT_FILE} with actual pool addresses
${colors.bright}4.${colors.reset} Proceed to setup-test-streams.ts

${colors.yellow}⚠️  Pool setup incomplete${colors.reset}
${colors.cyan}This is expected - CP-AMM integration requires Meteora SDK${colors.reset}
  `);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n${colors.red}❌ Error:${colors.reset}`, err.message);
    console.error(err);
    process.exit(1);
  });
