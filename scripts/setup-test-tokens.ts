/**
 * Setup Test Tokens for Local Validator
 *
 * Creates:
 * - Token A (base token): 1,000,000 supply
 * - Token B (quote token - simulated USDC): 1,000,000 supply
 * - Funds 5 test wallets with SOL
 * - Creates Associated Token Accounts (ATAs) for all participants
 *
 * Run: ts-node scripts/setup-test-tokens.ts
 */

import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

// Configuration
const LOCALHOST_RPC = "http://127.0.0.1:8899";
const WALLET_PATH = path.join(process.env.HOME!, ".config/solana/test-wallet.json");
const OUTPUT_FILE = path.join(__dirname, "..", ".test-tokens.json");

// Test configuration
const TOKEN_A_SUPPLY = 1_000_000 * 1e9; // 1M tokens with 9 decimals
const TOKEN_B_SUPPLY = 1_000_000 * 1e6; // 1M tokens with 6 decimals (like USDC)
const NUM_TEST_WALLETS = 5;
const FUNDING_AMOUNT = 10 * LAMPORTS_PER_SOL; // 10 SOL per wallet

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`);
}

function section(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log("=".repeat(title.length));
}

async function main() {
  section("🪙 Local Validator Token Setup");

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
    console.error("\n❌ Error: Cannot connect to local validator at", LOCALHOST_RPC);
    console.error("   Make sure local validator is running:");
    console.error("   solana-test-validator\n");
    process.exit(1);
  }

  // Check payer balance
  const payerBalance = await connection.getBalance(payerKeypair.publicKey);
  log("💰", `Payer balance: ${payerBalance / LAMPORTS_PER_SOL} SOL`);

  if (payerBalance < 100 * LAMPORTS_PER_SOL) {
    console.warn("\n⚠️  Warning: Payer balance low. Requesting airdrop...");
    const airdropSignature = await connection.requestAirdrop(
      payerKeypair.publicKey,
      100 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
    log("✅", "Airdrop confirmed");
  }

  section("🏭 Creating Token Mints");

  // Create Token A (base token)
  log("⏳", "Creating Token A (base token, 9 decimals)...");
  const tokenAMint = await createMint(
    connection,
    payerKeypair,
    payerKeypair.publicKey, // mint authority
    null, // freeze authority
    9 // decimals
  );
  log("✅", `Token A: ${tokenAMint.toBase58()}`);

  // Create Token B (quote token - simulated USDC)
  log("⏳", "Creating Token B (quote token, 6 decimals like USDC)...");
  const tokenBMint = await createMint(
    connection,
    payerKeypair,
    payerKeypair.publicKey,
    null,
    6 // USDC-like decimals
  );
  log("✅", `Token B: ${tokenBMint.toBase58()}`);

  section("👥 Generating Test Wallets");

  const testWallets: Keypair[] = [];
  for (let i = 0; i < NUM_TEST_WALLETS; i++) {
    const wallet = Keypair.generate();
    testWallets.push(wallet);
    log("🔑", `Investor ${i + 1}: ${wallet.publicKey.toBase58()}`);
  }

  section("💸 Funding Test Wallets");

  for (let i = 0; i < testWallets.length; i++) {
    const wallet = testWallets[i];
    log("⏳", `Funding investor ${i + 1} with ${FUNDING_AMOUNT / LAMPORTS_PER_SOL} SOL...`);

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payerKeypair.publicKey,
        toPubkey: wallet.publicKey,
        lamports: FUNDING_AMOUNT,
      })
    );

    await sendAndConfirmTransaction(connection, tx, [payerKeypair]);
    log("✅", `Investor ${i + 1} funded`);
  }

  section("🏦 Creating Associated Token Accounts");

  // Create ATA for payer (used for pool liquidity)
  log("⏳", "Creating ATAs for payer (pool liquidity provider)...");
  const payerTokenA = await getOrCreateAssociatedTokenAccount(
    connection,
    payerKeypair,
    tokenAMint,
    payerKeypair.publicKey
  );
  const payerTokenB = await getOrCreateAssociatedTokenAccount(
    connection,
    payerKeypair,
    tokenBMint,
    payerKeypair.publicKey
  );
  log("✅", `Payer Token A ATA: ${payerTokenA.address.toBase58()}`);
  log("✅", `Payer Token B ATA: ${payerTokenB.address.toBase58()}`);

  // Create ATAs for test investors
  const investorTokenAccounts: {
    wallet: PublicKey;
    tokenA: PublicKey;
    tokenB: PublicKey;
  }[] = [];

  for (let i = 0; i < testWallets.length; i++) {
    const wallet = testWallets[i];
    log("⏳", `Creating ATAs for investor ${i + 1}...`);

    const tokenA = await getOrCreateAssociatedTokenAccount(
      connection,
      payerKeypair, // payer for ATA creation
      tokenAMint,
      wallet.publicKey
    );

    const tokenB = await getOrCreateAssociatedTokenAccount(
      connection,
      payerKeypair,
      tokenBMint,
      wallet.publicKey
    );

    investorTokenAccounts.push({
      wallet: wallet.publicKey,
      tokenA: tokenA.address,
      tokenB: tokenB.address,
    });

    log("✅", `Investor ${i + 1} ATAs created`);
  }

  section("💎 Minting Tokens");

  // Mint Token A to payer (for pool liquidity)
  log("⏳", `Minting ${TOKEN_A_SUPPLY / 1e9} Token A to payer...`);
  await mintTo(
    connection,
    payerKeypair,
    tokenAMint,
    payerTokenA.address,
    payerKeypair,
    TOKEN_A_SUPPLY
  );
  log("✅", "Token A minted");

  // Mint Token B to payer (for pool liquidity)
  log("⏳", `Minting ${TOKEN_B_SUPPLY / 1e6} Token B to payer...`);
  await mintTo(
    connection,
    payerKeypair,
    tokenBMint,
    payerTokenB.address,
    payerKeypair,
    TOKEN_B_SUPPLY
  );
  log("✅", "Token B minted");

  // Mint some Token B to test investors (for vesting contracts in Story 2.3)
  for (let i = 0; i < testWallets.length; i++) {
    const amount = 500_000 * 1e6; // 500k Token B per investor
    log("⏳", `Minting ${amount / 1e6} Token B to investor ${i + 1}...`);
    await mintTo(
      connection,
      payerKeypair,
      tokenBMint,
      investorTokenAccounts[i].tokenB,
      payerKeypair,
      amount
    );
    log("✅", `Investor ${i + 1} received tokens`);
  }

  section("💾 Saving Configuration");

  const config = {
    network: "localhost",
    rpc: LOCALHOST_RPC,
    payer: payerKeypair.publicKey.toBase58(),
    tokens: {
      tokenA: {
        mint: tokenAMint.toBase58(),
        decimals: 9,
        supply: TOKEN_A_SUPPLY,
        name: "Token A (Base)",
      },
      tokenB: {
        mint: tokenBMint.toBase58(),
        decimals: 6,
        supply: TOKEN_B_SUPPLY,
        name: "Token B (Quote - USDC-like)",
      },
    },
    payerAccounts: {
      tokenA: payerTokenA.address.toBase58(),
      tokenB: payerTokenB.address.toBase58(),
    },
    testWallets: testWallets.map((w, i) => ({
      index: i + 1,
      publicKey: w.publicKey.toBase58(),
      secretKey: Array.from(w.secretKey),
      solBalance: FUNDING_AMOUNT / LAMPORTS_PER_SOL,
      tokenAccounts: {
        tokenA: investorTokenAccounts[i].tokenA.toBase58(),
        tokenB: investorTokenAccounts[i].tokenB.toBase58(),
      },
    })),
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(config, null, 2));
  log("✅", `Configuration saved to: ${OUTPUT_FILE}`);

  section("📊 Summary");

  console.log(`
${colors.bright}Token Mints:${colors.reset}
  Token A (Base):  ${tokenAMint.toBase58()}
  Token B (Quote): ${tokenBMint.toBase58()}

${colors.bright}Payer Accounts:${colors.reset}
  Wallet:   ${payerKeypair.publicKey.toBase58()}
  Token A:  ${payerTokenA.address.toBase58()} (${TOKEN_A_SUPPLY / 1e9} tokens)
  Token B:  ${payerTokenB.address.toBase58()} (${TOKEN_B_SUPPLY / 1e6} tokens)

${colors.bright}Test Wallets:${colors.reset}
  Count: ${NUM_TEST_WALLETS}
  SOL:   ${FUNDING_AMOUNT / LAMPORTS_PER_SOL} SOL each
  Tokens: 500,000 Token B each

${colors.bright}Total Supply:${colors.reset}
  Token A: ${TOKEN_A_SUPPLY / 1e9} tokens (9 decimals)
  Token B: ${(TOKEN_B_SUPPLY + NUM_TEST_WALLETS * 500_000 * 1e6) / 1e6} tokens (6 decimals)

${colors.green}✅ Token setup complete!${colors.reset}
${colors.yellow}Next: Run setup-test-pool.ts to create CP-AMM pool${colors.reset}
  `);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n${colors.bright}❌ Error:${colors.reset}`, err.message);
    console.error(err);
    process.exit(1);
  });
