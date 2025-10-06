/**
 * Test Streamflow on LOCALHOST with corrected SDK usage
 *
 * This tests whether the "ProgramAccountNotFound" error was actually
 * due to incorrect SDK usage rather than missing runtime accounts.
 */

import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { StreamflowSolana, ICluster, getBN } from "@streamflow/stream";
import * as fs from "fs";
import * as path from "path";

const LOCALHOST_RPC = "http://127.0.0.1:8899";
const WALLET_PATH = path.join(process.env.HOME!, ".config/solana/test-wallet.json");

async function main() {
  console.log("🧪 Testing Streamflow on LOCALHOST (with corrected SDK usage)\n");

  // Load payer
  const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(WALLET_PATH, "utf-8")))
  );

  const connection = new Connection(LOCALHOST_RPC, "confirmed");

  console.log("Payer:", payer.publicKey.toBase58());

  // Check balance and airdrop if needed
  let balance = await connection.getBalance(payer.publicKey);
  console.log("Balance:", balance / LAMPORTS_PER_SOL, "SOL");

  if (balance < 2 * LAMPORTS_PER_SOL) {
    console.log("Airdropping 5 SOL to payer...");
    const airdropSig = await connection.requestAirdrop(payer.publicKey, 5 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSig);
    balance = await connection.getBalance(payer.publicKey);
    console.log("New balance:", balance / LAMPORTS_PER_SOL, "SOL");
  }
  console.log("");

  // Create NEW token mint
  console.log("Creating new token mint...");
  const tokenMint = await createMint(
    connection,
    payer,
    payer.publicKey, // Mint authority
    null, // Freeze authority
    6 // Decimals
  );
  console.log("Token mint:", tokenMint.toBase58());

  // Create recipient
  const recipient = Keypair.generate();
  console.log("Recipient:", recipient.publicKey.toBase58());

  // Get/create token accounts
  const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    tokenMint,
    payer.publicKey
  );

  const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    tokenMint,
    recipient.publicKey
  );

  console.log("Sender ATA:", senderTokenAccount.address.toBase58());
  console.log("Recipient ATA:", recipientTokenAccount.address.toBase58());

  // Mint tokens to sender
  console.log("\nMinting 200,000 tokens to sender...");
  await mintTo(
    connection,
    payer,
    tokenMint,
    senderTokenAccount.address,
    payer,
    200_000 * 1_000_000 // 200k with 6 decimals
  );
  console.log("✅ Tokens minted");

  // Initialize Streamflow client (using LOCALHOST)
  const streamClient = new StreamflowSolana.SolanaStreamClient(
    LOCALHOST_RPC,  // <-- Localhost RPC
    ICluster.Local, // <-- Use Local cluster (not Devnet!)
    "confirmed"
  );

  console.log("\n📊 Creating Streamflow vesting stream on LOCALHOST...");

  const now = Math.floor(Date.now() / 1000);
  const startTime = now + 10; // Start 10 seconds in future
  const oneYear = 365 * 24 * 60 * 60;

  const streamParams = {
    recipient: recipient.publicKey.toBase58(),
    tokenId: tokenMint.toBase58(),
    start: startTime,
    amount: getBN(100_000, 6), // 100k tokens
    period: 1,
    cliff: startTime,
    cliffAmount: getBN(40_000, 6), // 40k unlocked immediately
    amountPerPeriod: getBN(Math.floor(60_000 / oneYear), 6), // 60k vested linearly
    name: "Localhost Test Stream",
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

    console.log("\n🎉 SUCCESS! Streamflow works on localhost!");
    console.log("\n📋 Stream Details:");
    console.log("   Stream ID:", metadataId);
    console.log("   Transaction:", txId);
    console.log("   Token Mint:", tokenMint.toBase58());

    console.log("\n✅ BREAKTHROUGH!");
    console.log("   The issue was NOT missing runtime accounts!");
    console.log("   It was incorrect SDK usage (GenericStreamClient vs SolanaStreamClient)");

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    console.error("\n📜 Full Error Object:", JSON.stringify(error, null, 2));

    // Try to get transaction logs
    if (error.getLogs) {
      try {
        const logs = error.getLogs();
        console.log("\n📋 Transaction Logs:");
        logs.forEach((log: string) => console.log("   ", log));
      } catch (e) {
        console.log("Could not get logs from error");
      }
    }

    if (error.message.includes("ProgramAccountNotFound")) {
      console.log("\n🔍 Analysis:");
      console.log("   Still getting 'ProgramAccountNotFound' on localhost");
      console.log("   This confirms runtime accounts are truly missing");
      console.log("   Even with corrected SDK usage");
    } else if (error.message.includes("Invalid Metadata")) {
      console.log("\n✅ IMPORTANT:");
      console.log("   Got 'Invalid Metadata' (same error as devnet!)");
      console.log("   This means Streamflow IS accessible on localhost");
      console.log("   Runtime accounts exist or are not required");
      console.log("   The issue is just SDK parameter configuration");
    } else {
      console.log("\n🔍 New error type:", error.message);
    }

    if (error.logs) {
      console.log("\nLogs:", error.logs.slice(0, 20)); // First 20 lines
    }
  }
}

main().catch(console.error);
