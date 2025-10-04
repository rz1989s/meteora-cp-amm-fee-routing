/**
 * Initialize Policy and Progress accounts on Devnet
 * Simple script that directly creates transactions
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
  TransactionInstruction,
} from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

// Configuration
const DEVNET_RPC = "https://api.devnet.solana.com";
const PROGRAM_ID = new PublicKey("RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce");
const WALLET_PATH = path.join(process.env.HOME!, ".config/solana/REC-devnet.json");

// Load wallet
const walletKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync(WALLET_PATH, "utf-8")))
);

console.log("\n🚀 Devnet Account Initialization");
console.log("================================");
console.log("Program ID:", PROGRAM_ID.toBase58());
console.log("Wallet:", walletKeypair.publicKey.toBase58());

// PDAs
const [policyPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("policy")],
  PROGRAM_ID
);

const [progressPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("progress")],
  PROGRAM_ID
);

console.log("Policy PDA:", policyPda.toBase58());
console.log("Progress PDA:", progressPda.toBase58());
console.log("================================\n");

async function main() {
  const connection = new Connection(DEVNET_RPC, "confirmed");

  // Check program exists
  const programInfo = await connection.getAccountInfo(PROGRAM_ID);
  if (!programInfo) {
    throw new Error("Program not found on devnet!");
  }
  console.log("✅ Program verified on devnet");
  console.log(`   Size: ${programInfo.data.length} bytes\n`);

  // Check if Policy already exists
  const policyInfo = await connection.getAccountInfo(policyPda);
  if (policyInfo) {
    console.log("⚠️  Policy account already exists!");
    console.log(`   Address: ${policyPda.toBase58()}`);
    console.log(`   Size: ${policyInfo.data.length} bytes`);
    console.log(`   Explorer: https://explorer.solana.com/address/${policyPda.toBase58()}?cluster=devnet\n`);
  } else {
    console.log("❌ Policy account not found");
    console.log("   Note: Manual initialization required via Anchor client\n");
  }

  // Check if Progress already exists
  const progressInfo = await connection.getAccountInfo(progressPda);
  if (progressInfo) {
    console.log("✅ Progress account already exists!");
    console.log(`   Address: ${progressPda.toBase58()}`);
    console.log(`   Size: ${progressInfo.data.length} bytes`);
    console.log(`   Explorer: https://explorer.solana.com/address/${progressPda.toBase58()}?cluster=devnet\n`);
  } else {
    console.log("❌ Progress account not found");
    console.log("   Note: Manual initialization required via Anchor client\n");
  }

  // Check wallet balance
  const balance = await connection.getBalance(walletKeypair.publicKey);
  console.log(`💰 Wallet balance: ${balance / 1e9} SOL\n`);

  console.log("📋 Summary:");
  console.log("============");
  console.log(`Program: ${programInfo ? '✅ Deployed' : '❌ Not found'}`);
  console.log(`Policy: ${policyInfo ? '✅ Initialized' : '⏳ Pending'}`);
  console.log(`Progress: ${progressInfo ? '✅ Initialized' : '⏳ Pending'}`);
  console.log("\n");

  if (!policyInfo || !progressInfo) {
    console.log("ℹ️  To initialize accounts, run:");
    console.log("   anchor test --provider.cluster devnet");
    console.log("   (with modified test to target devnet)\n");
  }
}

main()
  .then(() => {
    console.log("✅ Check complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
