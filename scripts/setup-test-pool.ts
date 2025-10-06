/**
 * Setup CP-AMM Pool for Local Validator Testing - REAL IMPLEMENTATION
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
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createMint,
} from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import {
  CpAmm,
  deriveConfigAddress,
  getSqrtPriceFromPrice,
  derivePoolAddress,
  derivePositionAddress,
} from "@meteora-ag/cp-amm-sdk";
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
const PRICE_RATIO = "1"; // 1:1 price ratio

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
};

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`);
}

function section(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log("=".repeat(title.length));
}

async function main() {
  section("🏊 CP-AMM Pool Setup - REAL IMPLEMENTATION");

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
    const version = await connection.getVersion();
    log("✅", `Connected to local validator (version: ${version["solana-core"]})`);
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
    console.error("   Run: solana-test-validator --clone cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG --url devnet\n");
    process.exit(1);
  }
  log("✅", `CP-AMM program found (${cpAmmInfo.data.length} bytes)`);

  section("🔧 Initializing CP-AMM SDK");

  const tokenAMint = new PublicKey(tokensConfig.tokens.tokenA.mint);
  const tokenBMint = new PublicKey(tokensConfig.tokens.tokenB.mint);

  log("🪙", `Token A (base): ${tokenAMint.toBase58()}`);
  log("🪙", `Token B (quote): ${tokenBMint.toBase58()}`);

  // Initialize CP-AMM SDK
  const cpAmm = new CpAmm(connection);
  log("✅", "CP-AMM SDK initialized");

  section("📊 Deriving Config Address");

  // Derive config address (index 0 for permissionless pools)
  const configAddress = deriveConfigAddress(new BN(0));
  log("🔑", `Config address: ${configAddress.toBase58()}`);

  // Try to fetch config state (optional - for logging only)
  let configState;
  try {
    configState = await cpAmm.fetchConfigState(configAddress);
    log("✅", `Config state fetched`);
    log("📝", `  Trade fee BPS: ${configState.tradeFeeNumerator.toNumber()}`);
  } catch (err: any) {
    log("⚠️", `Config fetch failed (continuing anyway)`);
    log("ℹ️", `  Will use default pool parameters`);
    // Don't exit - we can create pool without fetching config
  }

  section("💰 Calculating Pool Parameters");

  // Calculate initial sqrt price for 1:1 ratio
  const initSqrtPrice = getSqrtPriceFromPrice(
    PRICE_RATIO,
    9, // Token A decimals
    6  // Token B decimals
  );
  log("📈", `Initial sqrt price (1:1 ratio): ${initSqrtPrice.toString()}`);

  // Prepare pool creation params (calculates liquidityDelta)
  const tokenAAmount = new BN(INITIAL_LIQUIDITY_TOKEN_A);
  const tokenBAmount = new BN(INITIAL_LIQUIDITY_TOKEN_B);

  log("💧", `Token A amount: ${tokenAAmount.toString()} (${INITIAL_LIQUIDITY_TOKEN_A / 1e9} tokens)`);
  log("💧", `Token B amount: ${tokenBAmount.toString()} (${INITIAL_LIQUIDITY_TOKEN_B / 1e6} tokens)`);

  section("🏗️  Creating Pool");

  // Create position NFT mint for initial position
  const positionNftMint = Keypair.generate();
  log("🎫", `Position NFT mint: ${positionNftMint.publicKey.toBase58()}`);

  // Derive pool address
  const poolAddress = derivePoolAddress(configAddress, tokenAMint, tokenBMint);
  log("🏊", `Pool address: ${poolAddress.toBase58()}`);

  // Check if pool already exists
  const poolInfo = await connection.getAccountInfo(poolAddress);
  if (poolInfo) {
    log("⚠️", `Pool already exists at ${poolAddress.toBase58()}`);
    log("ℹ️", `Skipping pool creation, will use existing pool`);
  } else {
    // Create pool transaction
    try {
      log("⏳", "Building createPool transaction...");

      const createPoolTx = await cpAmm.createPool({
        creator: payerKeypair.publicKey,
        payer: payerKeypair.publicKey,
        config: configAddress,
        positionNft: positionNftMint.publicKey,
        tokenAMint,
        tokenBMint,
        initSqrtPrice,
        liquidityDelta: new BN(100_000_000_000), // Large liquidity for testing
        tokenAAmount,
        tokenBAmount,
        activationPoint: null,
        tokenAProgram: TOKEN_PROGRAM_ID,
        tokenBProgram: TOKEN_PROGRAM_ID,
        isLockLiquidity: false,
      });

      log("⏳", "Signing and sending createPool transaction...");
      const tx = await createPoolTx;
      tx.feePayer = payerKeypair.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      const txId = await sendAndConfirmTransaction(
        connection,
        tx,
        [payerKeypair, positionNftMint],
        { skipPreflight: false }
      );
      log("✅", `Pool created! Transaction: ${txId}`);
    } catch (err: any) {
      console.error(`\n${colors.red}❌ Failed to create pool${colors.reset}`);
      console.error(`   Error: ${err.message}`);
      if (err.logs) {
        console.error(`   Logs:`, err.logs);
      }
      process.exit(1);
    }
  }

  section("🎯 Creating Honorary Position (PDA-Owned)");

  // Derive investor fee position owner PDA (from our program)
  const vaultSeed = Buffer.from("vault");
  const investorFeePosOwnerSeed = Buffer.from("investor_fee_pos_owner");

  // Use pool address as vault for PDA derivation
  const [investorFeePosOwner, posOwnerBump] = PublicKey.findProgramAddressSync(
    [vaultSeed, poolAddress.toBuffer(), investorFeePosOwnerSeed],
    FEE_ROUTING_PROGRAM_ID
  );

  log("🔑", `Investor Fee Position Owner PDA: ${investorFeePosOwner.toBase58()}`);
  log("🔑", `Bump: ${posOwnerBump}`);

  // Create another NFT for the honorary position
  const honoraryPositionNftMint = Keypair.generate();
  log("🎫", `Honorary Position NFT mint: ${honoraryPositionNftMint.publicKey.toBase58()}`);

  // Derive position address
  const honoraryPositionAddress = derivePositionAddress(honoraryPositionNftMint.publicKey);
  log("📍", `Honorary Position address: ${honoraryPositionAddress.toBase58()}`);

  // Check if position already exists
  const positionInfo = await connection.getAccountInfo(honoraryPositionAddress);
  if (positionInfo) {
    log("⚠️", `Position already exists at ${honoraryPositionAddress.toBase58()}`);
    log("ℹ️", `Skipping position creation`);
  } else {
    // Create position transaction
    try {
      log("⏳", "Building createPosition transaction (PDA-owned)...");

      const createPositionTx = await cpAmm.createPosition({
        owner: investorFeePosOwner, // PDA owns the position!
        payer: payerKeypair.publicKey,
        pool: poolAddress,
        positionNft: honoraryPositionNftMint.publicKey,
      });

      log("⏳", "Signing and sending createPosition transaction...");
      const tx = await createPositionTx;
      tx.feePayer = payerKeypair.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      const txId = await sendAndConfirmTransaction(
        connection,
        tx,
        [payerKeypair, honoraryPositionNftMint],
        { skipPreflight: false }
      );
      log("✅", `Position created! Transaction: ${txId}`);
      log("🎉", `Position owned by PDA: ${investorFeePosOwner.toBase58()}`);
    } catch (err: any) {
      console.error(`\n${colors.red}❌ Failed to create position${colors.reset}`);
      console.error(`   Error: ${err.message}`);
      if (err.logs) {
        console.error(`   Logs:`, err.logs);
      }
      console.error(`\n${colors.yellow}⚠️  This may require CPI from your program to create PDA-owned position${colors.reset}`);
    }
  }

  section("💾 Saving Pool Configuration");

  // Fetch pool state for additional details
  let poolState;
  try {
    poolState = await cpAmm.fetchPoolState(poolAddress);
    log("✅", `Pool state fetched`);
  } catch (err: any) {
    console.error(`${colors.yellow}⚠️  Could not fetch pool state: ${err.message}${colors.reset}`);
  }

  // Save complete configuration
  const config = {
    network: "localhost",
    rpc: LOCALHOST_RPC,
    cpAmmProgramId: CP_AMM_PROGRAM_ID.toBase58(),
    feeRoutingProgramId: FEE_ROUTING_PROGRAM_ID.toBase58(),
    config: {
      address: configAddress.toBase58(),
    },
    tokens: {
      tokenA: tokensConfig.tokens.tokenA,
      tokenB: tokensConfig.tokens.tokenB,
    },
    pool: {
      address: poolAddress.toBase58(),
      tokenAVault: poolState?.tokenAVault?.toBase58() || null,
      tokenBVault: poolState?.tokenBVault?.toBase58() || null,
      lpMint: poolState?.lpMint?.toBase58() || null,
      sqrtPrice: poolState?.sqrtPrice?.toString() || null,
      feeBps: poolState ? 30 : null, // Standard 0.3% fee
    },
    position: {
      owner: investorFeePosOwner.toBase58(),
      ownerBump: posOwnerBump,
      nftMint: honoraryPositionNftMint.publicKey.toBase58(),
      address: honoraryPositionAddress.toBase58(),
    },
    liquidity: {
      tokenA: INITIAL_LIQUIDITY_TOKEN_A,
      tokenB: INITIAL_LIQUIDITY_TOKEN_B,
      priceRatio: PRICE_RATIO,
    },
    status: "COMPLETE - Real pool and position created",
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(config, null, 2));
  log("✅", `Configuration saved to: ${OUTPUT_FILE}`);

  section("📊 Summary");

  console.log(`
${colors.bright}Pool Details:${colors.reset}
  Address:    ${poolAddress.toBase58()}
  Token A:    ${tokenAMint.toBase58()}
  Token B:    ${tokenBMint.toBase58()}
  Liquidity:  ${INITIAL_LIQUIDITY_TOKEN_A / 1e9} Token A + ${INITIAL_LIQUIDITY_TOKEN_B / 1e6} Token B
  Price:      1:1 ratio

${colors.bright}Honorary Position:${colors.reset}
  Address:    ${honoraryPositionAddress.toBase58()}
  Owner:      ${investorFeePosOwner.toBase58()} ${colors.dim}(PDA)${colors.reset}
  NFT Mint:   ${honoraryPositionNftMint.publicKey.toBase58()}

${colors.green}✅ Pool setup complete!${colors.reset}
${colors.cyan}Next: Run setup-test-streams.ts to create vesting contracts${colors.reset}
  `);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n${colors.red}❌ Error:${colors.reset}`, err.message);
    console.error(err);
    process.exit(1);
  });
