/**
 * Test Streamflow on DEVNET to prove it works when runtime accounts exist
 */

import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { StreamflowSolana, ICluster, getBN } from "@streamflow/stream";
import * as fs from "fs";
import * as path from "path";

const DEVNET_RPC = "https://api.devnet.solana.com";
const WALLET_PATH = path.join(process.env.HOME!, ".config/solana/test-wallet.json");

async function main() {
  console.log("🧪 Testing Streamflow on DEVNET\n");

  // Load payer
  const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(WALLET_PATH, "utf-8")))
  );

  const connection = new Connection(DEVNET_RPC, "confirmed");

  console.log("Payer:", payer.publicKey.toBase58());

  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  console.log("Balance:", balance / LAMPORTS_PER_SOL, "SOL\n");

  if (balance < 0.5 * LAMPORTS_PER_SOL) {
    console.log("Requesting airdrop...");
    const sig = await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig);
    console.log("Airdrop confirmed\n");
  }

  // Use USDC devnet mint (or create test token)
  const tokenMint = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"); // USDC devnet

  // Create recipient
  const recipient = Keypair.generate();
  console.log("Recipient:", recipient.publicKey.toBase58());

  // Fund recipient
  const fundTx = await connection.requestAirdrop(recipient.publicKey, 0.1 * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(fundTx);

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

  console.log("Token accounts created");
  console.log("Sender ATA:", senderTokenAccount.address.toBase58());
  console.log("Recipient ATA:", recipientTokenAccount.address.toBase58());

  // Mint tokens to sender (note: this will only work if payer is mint authority on devnet)
  console.log("\nMinting 200k tokens to sender...");
  try {
    const mintTx = await mintTo(
      connection,
      payer,
      tokenMint,
      senderTokenAccount.address,
      payer, // Assuming payer is mint authority
      200_000 * 1_000_000 // 200k with 6 decimals
    );
    console.log("Minted tokens:", mintTx);
  } catch (mintError: any) {
    console.log("⚠️  Cannot mint (payer likely not mint authority on devnet)");
    console.log("   Using devnet USDC faucet instead would be needed for real tokens\n");
  }

  // Initialize Streamflow client
  const streamClient = new StreamflowSolana.SolanaStreamClient(
    DEVNET_RPC,
    ICluster.Devnet,
    "confirmed"
  );

  console.log("Creating stream...");

  const now = Math.floor(Date.now() / 1000);
  const streamParams = {
    recipient: recipient.publicKey.toBase58(),
    tokenId: tokenMint.toBase58(),
    start: now,
    amount: getBN(100_000, 6), // 100k tokens with 6 decimals
    period: 1,
    cliff: now,
    cliffAmount: getBN(40_000, 6), // 40k unlocked
    amountPerPeriod: getBN(60_000, 6), // 60k vested
    name: "Test Stream",
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

    console.log("\n✅ SUCCESS! Stream created on devnet");
    console.log("Transaction:", txId);
    console.log("Stream ID:", metadataId);
    console.log("\nThis proves Streamflow works when runtime accounts exist!");

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    if (error.logs) {
      console.error("Logs:", error.logs);
    }
  }
}

main().catch(console.error);
