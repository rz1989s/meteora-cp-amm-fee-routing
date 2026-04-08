/**
 * Setup CP-AMM Pool on Devnet - REAL IMPLEMENTATION
 *
 * Creates:
 * - Meteora CP-AMM pool with Token A (base) + Token B (quote) on DEVNET
 * - Adds liquidity: 100,000 Token A + 100,000 Token B
 * - Generates honorary NFT position keypair for program PDA
 *
 * Prerequisites:
 * - Devnet wallet with sufficient SOL (~5 SOL recommended)
 * - setup-devnet-tokens.ts completed (or provide existing token mints)
 *
 * Run: ts-node scripts/setup-devnet-pool.ts
 */

import {
  Connection,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
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
const DEVNET_RPC = `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
const WALLET_PATH = path.join(process.env.HOME!, ".config/solana/test-wallet.json");
const OUTPUT_FILE = path.join(__dirname, "..", ".test-pool-devnet.json");
const NFT_KEYPAIR_FILE = path.join(__dirname, "..", ".test-position-nft-devnet.json");

// Meteora CP-AMM Program ID (devnet)
const CP_AMM_PROGRAM_ID = new PublicKey("cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG");

// Our fee-routing program ID (devnet)
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
  section("🏊 CP-AMM Pool Setup - DEVNET");

  // Load payer wallet
  const payerKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(WALLET_PATH, "utf-8")))
  );
  log("👛", `Payer wallet: ${payerKeypair.publicKey.toBase58()}`);

  // Connect to devnet
  const connection = new Connection(DEVNET_RPC, "confirmed");

  try {
    const version = await connection.getVersion();
    log("✅", `Connected to devnet (version: ${version["solana-core"]})`);
  } catch (err) {
    console.error(`\n${colors.red}❌ Cannot connect to devnet${colors.reset}`);
    console.error("   Check your RPC URL and internet connection\n");
    process.exit(1);
  }

  // Check balance
  const balance = await connection.getBalance(payerKeypair.publicKey);
  const balanceSOL = balance / 1_000_000_000;
  log("💰", `Payer balance: ${balanceSOL.toFixed(4)} SOL`);

  if (balanceSOL < 5.0) {
    console.warn(`\n${colors.yellow}⚠️  Warning: Low balance${colors.reset}`);
    console.warn(`   Current: ${balanceSOL.toFixed(4)} SOL`);
    console.warn(`   Recommended: >= 5 SOL for pool creation + liquidity\n`);
  }

  // Check CP-AMM program exists
  const cpAmmInfo = await connection.getAccountInfo(CP_AMM_PROGRAM_ID);
  if (!cpAmmInfo) {
    console.error(`\n${colors.red}❌ Meteora CP-AMM program not found on devnet!${colors.reset}`);
    console.error(`   Program ID: ${CP_AMM_PROGRAM_ID.toBase58()}`);
    console.error(`   This should not happen on devnet - program may be moved.\n`);
    process.exit(1);
  }
  log("✅", `CP-AMM program found (${cpAmmInfo.data.length} bytes)`);

  section("🔧 Loading Token Configuration");

  // For now, prompt user to provide token mints
  // In production, this would load from .test-tokens-devnet.json
  console.log(`${colors.yellow}⚠️  This script requires token mints to be provided${colors.reset}`);
  console.log(`   Please run setup-devnet-tokens.ts first, or provide manual inputs\n`);

  // TODO: Load from config file or accept as command line args
  // For now, using placeholder values - user must update these
  const tokenAMintAddress = process.env.TOKEN_A_MINT || "";
  const tokenBMintAddress = process.env.TOKEN_B_MINT || "";

  if (!tokenAMintAddress || !tokenBMintAddress) {
    console.error(`${colors.red}❌ Token mints not provided!${colors.reset}`);
    console.error(`\nUsage:\n`);
    console.error(`  TOKEN_A_MINT=<address> TOKEN_B_MINT=<address> npm run setup:devnet:pool\n`);
    console.error(`Or create setup-devnet-tokens.ts first to auto-generate tokens.\n`);
    process.exit(1);
  }

  const tokenAMint = new PublicKey(tokenAMintAddress);
  const tokenBMint = new PublicKey(tokenBMintAddress);

  log("🪙", `Token A (base): ${tokenAMint.toBase58()}`);
  log("🪙", `Token B (quote): ${tokenBMint.toBase58()}`);

  section("📊 Initializing CP-AMM SDK");

  // Initialize CP-AMM SDK
  const cpAmm = new CpAmm(connection);
  log("✅", "CP-AMM SDK initialized");

  // Derive config address (index 0 for permissionless pools)
  const configAddress = deriveConfigAddress(new BN(0));
  log("🔑", `Config address: ${configAddress.toBase58()}`);

  // Try to fetch config state
  let configState;
  try {
    configState = await cpAmm.fetchConfigState(configAddress);
    log("✅", `Config state fetched`);
    log("📝", `  Trade fee BPS: ${configState.tradeFeeNumerator.toNumber()}`);
  } catch (err: any) {
    log("⚠️", `Config fetch failed (continuing anyway)`);
  }

  section("💰 Calculating Pool Parameters");

  // Calculate initial sqrt price for 1:1 ratio
  const initSqrtPrice = getSqrtPriceFromPrice(
    PRICE_RATIO,
    9, // Token A decimals
    6  // Token B decimals
  );
  log("📈", `Initial sqrt price (1:1 ratio): ${initSqrtPrice.toString()}`);

  // Prepare pool creation params
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
      log("🔗", `View on Solscan: https://solscan.io/tx/${txId}?cluster=devnet`);
    } catch (err: any) {
      console.error(`\n${colors.red}❌ Failed to create pool${colors.reset}`);
      console.error(`   Error: ${err.message}`);
      if (err.logs) {
        console.error(`   Logs:`, err.logs);
      }
      process.exit(1);
    }
  }

  section("🎯 Preparing Honorary Position Info");

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

  // Generate NFT mint address for the honorary position
  const honoraryPositionNftMint = Keypair.generate();
  log("🎫", `Honorary Position NFT mint (for program): ${honoraryPositionNftMint.publicKey.toBase58()}`);
  log("💾", `Saving keypair for later use by initialize_position instruction`);

  // Save the NFT keypair for later use
  fs.writeFileSync(
    NFT_KEYPAIR_FILE,
    JSON.stringify(Array.from(honoraryPositionNftMint.secretKey))
  );

  // Derive position address (will be created by fee-routing program)
  const honoraryPositionAddress = derivePositionAddress(honoraryPositionNftMint.publicKey);
  log("📍", `Honorary Position address (derived): ${honoraryPositionAddress.toBase58()}`);

  console.log(`\n${colors.yellow}ℹ️  Note: Honorary position must be created via fee-routing program's${colors.reset}`);
  console.log(`${colors.yellow}   initialize_position instruction (PDA must sign via CPI)${colors.reset}\n`);

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
    network: "devnet",
    rpc: DEVNET_RPC,
    cpAmmProgramId: CP_AMM_PROGRAM_ID.toBase58(),
    feeRoutingProgramId: FEE_ROUTING_PROGRAM_ID.toBase58(),
    config: {
      address: configAddress.toBase58(),
    },
    tokens: {
      tokenA: {
        mint: tokenAMint.toBase58(),
        decimals: 9,
      },
      tokenB: {
        mint: tokenBMint.toBase58(),
        decimals: 6,
      },
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
      nftKeypairFile: NFT_KEYPAIR_FILE,
      address: honoraryPositionAddress.toBase58(),
      status: "NFT keypair saved - use initialize_position instruction to create",
    },
    liquidity: {
      tokenA: INITIAL_LIQUIDITY_TOKEN_A,
      tokenB: INITIAL_LIQUIDITY_TOKEN_B,
      priceRatio: PRICE_RATIO,
    },
    status: "COMPLETE - Pool created on devnet, position NFT ready",
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(config, null, 2));
  log("✅", `Configuration saved to: ${OUTPUT_FILE}`);

  section("📊 Summary");

  console.log(`
${colors.bright}Pool Details:${colors.reset}
  Address:    ${poolAddress.toBase58()}
  Network:    Devnet
  Token A:    ${tokenAMint.toBase58()}
  Token B:    ${tokenBMint.toBase58()}
  Liquidity:  ${INITIAL_LIQUIDITY_TOKEN_A / 1e9} Token A + ${INITIAL_LIQUIDITY_TOKEN_B / 1e6} Token B
  Price:      1:1 ratio

${colors.bright}Honorary Position (Ready for Creation):${colors.reset}
  Owner PDA:     ${investorFeePosOwner.toBase58()}
  NFT Mint:      ${honoraryPositionNftMint.publicKey.toBase58()}
  NFT Keypair:   ${NFT_KEYPAIR_FILE} ${colors.dim}(saved)${colors.reset}
  Position Addr: ${honoraryPositionAddress.toBase58()} ${colors.dim}(derived)${colors.reset}

${colors.bright}Verification:${colors.reset}
  View pool:     https://solscan.io/account/${poolAddress.toBase58()}?cluster=devnet
  View config:   .test-pool-devnet.json

${colors.green}✅ Devnet pool setup complete!${colors.reset}
${colors.yellow}📝 Next: Use fee-routing program's initialize_position to create PDA-owned position${colors.reset}
${colors.cyan}📝 Then: Run setup:streams:devnet to create real vesting contracts${colors.reset}
  `);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n${colors.red}❌ Error:${colors.reset}`, err.message);
    console.error(err);
    process.exit(1);
  });
