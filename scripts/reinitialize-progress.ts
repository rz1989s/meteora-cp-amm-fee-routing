import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { FeeRouting } from "../target/types/fee_routing";
import { PublicKey, Keypair } from "@solana/web3.js";
import fs from "fs";

const PROGRESS_SEED = "progress";

async function main() {
  // Configure provider with Helius RPC
  const connection = new anchor.web3.Connection(
    "https://devnet.helius-rpc.com/?api-key=142fb48a-aa24-4083-99c8-249df5400b30",
    "confirmed"
  );

  // Load authority keypair
  const authorityKeypair = Keypair.fromSecretKey(
    Buffer.from(
      JSON.parse(
        fs.readFileSync(
          `${process.env.HOME}/.config/solana/REC-devnet.json`,
          "utf-8"
        )
      )
    )
  );

  const wallet = new anchor.Wallet(authorityKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // Load program
  const programId = new PublicKey("RECtHTwPBpZpFWUS4Cv7xt2qkzarmKP939MSrGdB3WP");
  const program = anchor.workspace.FeeRouting as Program<FeeRouting>;

  // Derive Progress PDA
  const [progressPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(PROGRESS_SEED)],
    programId
  );

  console.log("Progress PDA:", progressPda.toString());
  console.log("Authority:", authorityKeypair.publicKey.toString());

  try {
    // Step 1: Close old Progress account
    console.log("\n1. Closing old Progress account...");
    const closeTx = await program.methods
      .closeProgress()
      .accounts({
        authority: authorityKeypair.publicKey,
        progress: progressPda,
      })
      .rpc();

    console.log("✅ Progress account closed");
    console.log("Transaction:", closeTx);

    // Wait for confirmation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 2: Reinitialize with new 57-byte format
    console.log("\n2. Reinitializing Progress with new format...");
    const initTx = await program.methods
      .initializeProgress()
      .accounts({
        authority: authorityKeypair.publicKey,
        progress: progressPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Progress reinitialized with 57-byte format");
    console.log("Transaction:", initTx);

    // Step 3: Verify new account
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("\n3. Verifying new Progress account...");
    const progressAccount = await program.account.progress.fetch(progressPda);
    const accountInfo = await connection.getAccountInfo(progressPda);

    console.log("\n✅ Verification complete:");
    console.log("Account size:", accountInfo?.data.length, "bytes");
    console.log("Expected size: 57 bytes");
    console.log("State:", {
      lastDistributionTs: progressAccount.lastDistributionTs.toString(),
      currentDay: progressAccount.currentDay.toString(),
      currentPage: progressAccount.currentPage,
      pagesProcessedToday: progressAccount.pagesProcessedToday,
      totalInvestors: progressAccount.totalInvestors,
      creatorPayoutSent: progressAccount.creatorPayoutSent,
      hasBaseFees: progressAccount.hasBaseFees,
      totalRoundingDust: progressAccount.totalRoundingDust.toString(),
      bump: progressAccount.bump,
    });

    if (accountInfo?.data.length === 57) {
      console.log("\n🎉 SUCCESS! Progress account now has correct 57-byte format");
    } else {
      console.log("\n⚠️  WARNING: Account size mismatch");
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
