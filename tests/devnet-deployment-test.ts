/**
 * Devnet Deployment Test
 * Tests the live deployed program on Solana Devnet
 *
 * Program ID: RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce
 * Deployer: RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair, Connection } from "@solana/web3.js";
import { BN } from "bn.js";
import { expect } from "chai";

describe("Devnet Deployment Test", () => {
  // Connect to devnet
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  const programId = new PublicKey("RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce");
  const deployerWallet = anchor.AnchorProvider.env().wallet;

  const provider = new anchor.AnchorProvider(
    connection,
    deployerWallet,
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);

  // Load the program
  const program = anchor.workspace.FeeRouting as Program;

  // PDAs
  const [policyPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("policy")],
    programId
  );

  const [progressPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("progress")],
    programId
  );

  console.log("\n=== Devnet Deployment Test ===");
  console.log("Program ID:", programId.toBase58());
  console.log("Policy PDA:", policyPda.toBase58());
  console.log("Progress PDA:", progressPda.toBase58());
  console.log("Deployer:", deployerWallet.publicKey.toBase58());
  console.log("=============================\n");

  it("Should verify program is deployed on devnet", async () => {
    const accountInfo = await connection.getAccountInfo(programId);

    expect(accountInfo).to.not.be.null;
    expect(accountInfo!.executable).to.be.true;

    console.log("✅ Program is deployed and executable");
    console.log("   Program data length:", accountInfo!.data.length, "bytes");
    console.log("   Owner:", accountInfo!.owner.toBase58());
  });

  it("Should initialize Policy account on devnet", async () => {
    try {
      // Check if already initialized
      const existingPolicy = await connection.getAccountInfo(policyPda);

      if (existingPolicy) {
        console.log("⚠️  Policy already initialized at:", policyPda.toBase58());
        console.log("   Account size:", existingPolicy.data.length, "bytes");
        return;
      }

      // Mock quote mint for testing (USDC devnet)
      const usdcDevnet = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

      // Initialize Policy
      const tx = await program.methods
        .initializePolicy(
          new BN(1_000_000_000), // y0: 1 billion tokens
          7000, // 70% max to investors
          new BN(0), // no daily cap
          new BN(1_000), // 1000 lamports min payout
          usdcDevnet, // quote mint
          deployerWallet.publicKey // creator wallet
        )
        .accounts({
          authority: deployerWallet.publicKey,
          policy: policyPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Policy initialized!");
      console.log("   Transaction:", tx);
      console.log("   Policy PDA:", policyPda.toBase58());
      console.log("   Explorer:", `https://explorer.solana.com/address/${policyPda.toBase58()}?cluster=devnet`);

    } catch (error: any) {
      if (error.message?.includes("already in use")) {
        console.log("⚠️  Policy already initialized");
      } else {
        console.error("Error initializing Policy:", error.message);
        throw error;
      }
    }
  });

  it("Should initialize Progress account on devnet", async () => {
    try {
      // Check if already initialized
      const existingProgress = await connection.getAccountInfo(progressPda);

      if (existingProgress) {
        console.log("⚠️  Progress already initialized at:", progressPda.toBase58());
        console.log("   Account size:", existingProgress.data.length, "bytes");
        return;
      }

      // Initialize Progress
      const tx = await program.methods
        .initializeProgress()
        .accounts({
          authority: deployerWallet.publicKey,
          progress: progressPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Progress initialized!");
      console.log("   Transaction:", tx);
      console.log("   Progress PDA:", progressPda.toBase58());
      console.log("   Explorer:", `https://explorer.solana.com/address/${progressPda.toBase58()}?cluster=devnet`);

    } catch (error: any) {
      if (error.message?.includes("already in use")) {
        console.log("⚠️  Progress already initialized");
      } else {
        console.error("Error initializing Progress:", error.message);
        throw error;
      }
    }
  });

  it("Should verify Policy account state on devnet", async () => {
    const policyAccount = await program.account.policy.fetch(policyPda);

    console.log("✅ Policy account state:");
    console.log("   Y0:", policyAccount.y0.toString());
    console.log("   Investor Fee Share BPS:", policyAccount.investorFeeShareBps);
    console.log("   Daily Cap:", policyAccount.dailyCapLamports.toString());
    console.log("   Min Payout:", policyAccount.minPayoutLamports.toString());
    console.log("   Quote Mint:", policyAccount.quoteMint.toBase58());
    console.log("   Creator Wallet:", policyAccount.creatorWallet.toBase58());

    expect(policyAccount.y0.toNumber()).to.be.greaterThan(0);
  });

  it("Should verify Progress account state on devnet", async () => {
    const progressAccount = await program.account.progress.fetch(progressPda);

    console.log("✅ Progress account state:");
    console.log("   Last Distribution:", progressAccount.lastDistributionTs.toString());
    console.log("   Current Day:", progressAccount.currentDay.toString());
    console.log("   Daily Distributed:", progressAccount.dailyDistributedToInvestors.toString());
    console.log("   Carry Over:", progressAccount.carryOverLamports.toString());
    console.log("   Current Page:", progressAccount.currentPage);
    console.log("   Creator Payout Sent:", progressAccount.creatorPayoutSent);

    expect(progressAccount.currentDay.toNumber()).to.equal(0);
  });
});
