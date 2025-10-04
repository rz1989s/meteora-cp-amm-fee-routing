# Deployment Guide - Meteora DAMM V2 Fee Routing

This document provides a complete guide for deploying the fee routing program to Solana Devnet/Mainnet.

---

## 🎯 Current Deployment Status

### **✅ Live on Solana Devnet**

| Attribute | Value |
|-----------|-------|
| **Program ID** | `RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce` ✨ |
| **Deployer Wallet** | `RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b` ✨ |
| **Upgrade Authority** | `RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b` |
| **Program Size** | 316,024 bytes (316 KB) |
| **Deployment Cost** | 2.20 SOL |
| **Network** | Solana Devnet |
| **Deployment Date** | October 4, 2025 |

### **Verification Links**

- **Program Explorer**: https://explorer.solana.com/address/RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce?cluster=devnet
- **Deployer Wallet**: https://explorer.solana.com/address/RECdpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b?cluster=devnet
- **Deployment Transaction**: https://explorer.solana.com/tx/55tj463QSGJz9uZoC9zGynQ8qzpMRr4daDTw2sA2MkLRQx5f5poU3vFptNFEMVx1ExESA8QbRHtc2E731LAjYCtW?cluster=devnet

### **Vanity Addresses**

Both the program ID and deployer wallet feature vanity addresses starting with "REC" (representing RECTOR, the project author):

- **Program ID**: `RECT`GNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce
- **Deployer**: `REC`dpxmc8SbnwEbf8iET5Jve6JEfkqMWdrEpkms3P1b

These were generated using `solana-keygen grind` for enhanced branding and verification.

---

## 📋 Prerequisites

Before deploying, ensure you have:

### **Development Tools**

```bash
# Rust toolchain (latest stable)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Solana CLI v1.18+
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Anchor 0.31.1 via AVM (Anchor Version Manager)
cargo install --git https://github.com/coral-xyz/anchor avm --force
avm install 0.31.1
avm use 0.31.1

# Verify installations
rustc --version
solana --version
anchor --version  # Should show 0.31.1
```

### **Wallet Setup**

```bash
# Create a new keypair (or use existing)
solana-keygen new --outfile ~/.config/solana/deployer.json

# Set Solana CLI config
solana config set --keypair ~/.config/solana/deployer.json
solana config set --url devnet  # or mainnet-beta

# Fund wallet (devnet)
solana airdrop 5
solana balance

# For mainnet: Transfer SOL from another wallet
# You need ~5-6 SOL for deployment + account creation
```

### **Optional: Generate Vanity Address**

```bash
# Generate vanity program ID (starts with specific prefix)
solana-keygen grind --starts-with YOUR:1

# Move to program keypair location
mv YOUR*.json target/deploy/fee_routing-keypair.json

# Update Anchor.toml and lib.rs with new program ID
```

---

## 🏗️ Build Process

### **1. Clone Repository**

```bash
git clone https://github.com/rz1989s/meteora-cp-amm-fee-routing.git
cd meteora-cp-amm-fee-routing
```

### **2. Install Dependencies**

```bash
npm install
# or
yarn install
```

### **3. Build Program**

```bash
anchor build
```

**Expected Output:**
```
Compiling fee-routing v0.2.0
Finished `release` profile [optimized] target(s) in X.XXs
```

**Build Artifacts:**
- Binary: `target/deploy/fee_routing.so` (316 KB)
- Keypair: `target/deploy/fee_routing-keypair.json`

### **4. Update Program ID (if using custom keypair)**

If you generated a new program keypair, update:

**`programs/fee-routing/src/lib.rs`:**
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

**`Anchor.toml`:**
```toml
[programs.devnet]
fee_routing = "YOUR_PROGRAM_ID_HERE"

[programs.mainnet]
fee_routing = "YOUR_PROGRAM_ID_HERE"
```

Then rebuild:
```bash
anchor build
```

---

## 🚀 Deployment

### **Deploy to Devnet**

```bash
# Deploy using solana CLI
solana program deploy \
  target/deploy/fee_routing.so \
  --program-id target/deploy/fee_routing-keypair.json \
  --keypair ~/.config/solana/deployer.json \
  --url devnet

# Or use anchor deploy
anchor deploy --provider.cluster devnet
```

**Expected Output:**
```
Program Id: YOUR_PROGRAM_ID

Signature: DEPLOYMENT_TX_SIGNATURE
```

### **Verify Deployment**

```bash
# Check program exists
solana program show YOUR_PROGRAM_ID --url devnet

# Expected output:
# Program Id: YOUR_PROGRAM_ID
# Owner: BPFLoaderUpgradeab1e11111111111111111111111
# Authority: YOUR_WALLET
# Data Length: 316024 bytes
# Balance: 2.20 SOL
```

### **Deploy to Mainnet**

⚠️ **IMPORTANT**: Thoroughly test on devnet before mainnet deployment!

```bash
# Switch to mainnet
solana config set --url mainnet-beta

# Ensure sufficient SOL (~5-6 SOL)
solana balance

# Deploy
solana program deploy \
  target/deploy/fee_routing.so \
  --program-id target/deploy/fee_routing-keypair.json \
  --keypair ~/.config/solana/deployer.json \
  --url mainnet-beta
```

---

## 🔧 Post-Deployment Configuration

### **1. Initialize Policy Account**

The Policy account stores immutable fee distribution configuration:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BN } from "bn.js";

const programId = new PublicKey("YOUR_PROGRAM_ID");
const program = anchor.workspace.FeeRouting;

const [policyPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("policy")],
  programId
);

// USDC Devnet: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
// USDC Mainnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
const quoteMint = new PublicKey("QUOTE_MINT_ADDRESS");

await program.methods
  .initializePolicy(
    new BN(1_000_000_000), // y0: Total investor allocation (1B tokens)
    7000,                   // 70% max to investors (basis points)
    new BN(0),             // No daily cap (0 = unlimited)
    new BN(1_000),         // 1000 lamports minimum payout
    quoteMint,             // Quote token mint
    creatorWallet.publicKey // Creator wallet
  )
  .accounts({
    authority: deployer.publicKey,
    policy: policyPda,
    systemProgram: SystemProgram.programId,
  })
  .signers([deployer])
  .rpc();

console.log("✅ Policy initialized at:", policyPda.toBase58());
```

### **2. Initialize Progress Account**

The Progress account tracks daily distribution state:

```typescript
const [progressPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("progress")],
  programId
);

await program.methods
  .initializeProgress()
  .accounts({
    authority: deployer.publicKey,
    progress: progressPda,
    systemProgram: SystemProgram.programId,
  })
  .signers([deployer])
  .rpc();

console.log("✅ Progress initialized at:", progressPda.toBase58());
```

### **3. Initialize Honorary Position**

Create the NFT-based LP position in the Meteora CP-AMM pool:

```typescript
const positionNftMint = Keypair.generate();
const [positionOwnerPda] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("vault"),
    vaultPubkey.toBuffer(),
    Buffer.from("investor_fee_pos_owner"),
  ],
  programId
);

// Derive Meteora position PDAs
const CP_AMM_PROGRAM = new PublicKey("cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG");

const [position] = PublicKey.findProgramAddressSync(
  [Buffer.from("position"), positionNftMint.publicKey.toBuffer()],
  CP_AMM_PROGRAM
);

const [positionNftAccount] = PublicKey.findProgramAddressSync(
  [Buffer.from("position_nft_account"), positionNftMint.publicKey.toBuffer()],
  CP_AMM_PROGRAM
);

await program.methods
  .initializePosition()
  .accounts({
    authority: deployer.publicKey,
    positionOwnerPda,
    vault: vaultPubkey,
    positionNftMint: positionNftMint.publicKey,
    positionNftAccount,
    position,
    pool: poolPubkey,
    poolAuthority: POOL_AUTHORITY,
    quoteMint: quoteMintPubkey,
    // ... additional accounts
  })
  .signers([deployer, positionNftMint])
  .rpc();

console.log("✅ Position initialized:", position.toBase58());
```

---

## 🤖 Automated Distribution Crank

Set up a cron job or keeper bot to call `distribute_fees` every 24 hours:

```typescript
// Example crank bot (pseudo-code)
async function distributionCrank() {
  const progress = await program.account.progress.fetch(progressPda);
  const now = Math.floor(Date.now() / 1000);

  // Check 24h elapsed
  if (now < progress.lastDistributionTs.toNumber() + 86400) {
    console.log("⏳ 24h not elapsed yet");
    return;
  }

  // Fetch all investor streams from Streamflow
  const investors = await fetchInvestorStreams();

  // Paginate (50 investors per page)
  const PAGE_SIZE = 50;
  const totalPages = Math.ceil(investors.length / PAGE_SIZE);

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const pageInvestors = investors.slice(
      pageIndex * PAGE_SIZE,
      (pageIndex + 1) * PAGE_SIZE
    );

    // Build remaining accounts (alternating: stream, investor_ata)
    const remainingAccounts = pageInvestors.flatMap((inv) => [
      { pubkey: inv.streamAccount, isSigner: false, isWritable: false },
      { pubkey: inv.quoteAta, isSigner: false, isWritable: true },
    ]);

    await program.methods
      .distributeFees(pageIndex)
      .accounts({
        policy: policyPda,
        progress: progressPda,
        pool: poolPubkey,
        // ... all required accounts
      })
      .remainingAccounts(remainingAccounts)
      .rpc();

    console.log(`✅ Page ${pageIndex} distributed`);
  }
}

// Run every hour (will only execute if 24h elapsed)
setInterval(distributionCrank, 3600 * 1000);
```

---

## 📊 Monitoring & Events

Subscribe to program events for monitoring:

```typescript
// Subscribe to events
const feeListener = program.addEventListener("QuoteFeesClaimed", (event) => {
  console.log(`Fees claimed: ${event.amountClaimed} on day ${event.day}`);
});

const investorListener = program.addEventListener("InvestorPayoutPage", (event) => {
  console.log(`Page ${event.pageIndex}: ${event.investorsPaid} investors paid`);
});

const creatorListener = program.addEventListener("CreatorPayoutDayClosed", (event) => {
  console.log(`Day ${event.day} closed. Creator: ${event.creatorAmount}`);
});
```

---

## 🔒 Security Considerations

### **Upgrade Authority**

The deployer wallet controls program upgrades. To make the program immutable:

```bash
# Transfer authority to null (irreversible!)
solana program set-upgrade-authority \
  YOUR_PROGRAM_ID \
  --new-upgrade-authority null \
  --url mainnet-beta

# Or transfer to a multisig
solana program set-upgrade-authority \
  YOUR_PROGRAM_ID \
  --new-upgrade-authority MULTISIG_ADDRESS \
  --url mainnet-beta
```

### **Policy/Progress Initialization**

⚠️ **CRITICAL**: Policy and Progress accounts can only be initialized ONCE (they use PDAs with fixed seeds). Double-check all parameters before initialization!

### **Audit Checklist**

Before mainnet:
- ✅ All tests passing (24/24)
- ✅ Security audit completed
- ✅ Devnet testing with real Meteora pools
- ✅ Crank bot tested for 7+ days
- ✅ Streamflow integration verified
- ✅ Event monitoring configured
- ✅ Emergency procedures documented

---

## 🛠️ Troubleshooting

### **Program Not Found**

```bash
# Verify deployment
solana program show YOUR_PROGRAM_ID --url devnet

# If not found, redeploy
anchor deploy --provider.cluster devnet
```

### **Insufficient Funds**

```bash
# Check balance
solana balance

# Devnet: Request airdrop
solana airdrop 5

# Mainnet: Transfer SOL
solana transfer YOUR_WALLET AMOUNT --allow-unfunded-recipient
```

### **Account Already Exists**

If Policy/Progress initialization fails with "account already exists":
- Check existing accounts on Explorer
- If testing, use a different program ID or close accounts (devnet only)
- For mainnet, this is PERMANENT - cannot reinitialize

---

## 📚 Additional Resources

- **Main README**: [README.md](./README.md)
- **Architecture**: [README.md#architecture](./README.md#architecture)
- **Integration Guide**: [README.md#integration-guide](./README.md#integration-guide)
- **Testing Guide**: [README.md#testing](./README.md#testing)
- **Pitch Website**: https://meteora-fee-routing.vercel.app

---

## ✅ Deployment Checklist

Use this checklist to ensure successful deployment:

- [ ] ✅ Development tools installed (Rust, Solana CLI, Anchor 0.31.1)
- [ ] ✅ Wallet funded with sufficient SOL (5-6 SOL)
- [ ] ✅ Program built successfully (`anchor build`)
- [ ] ✅ Program ID updated in code (if custom keypair)
- [ ] ✅ Deployed to devnet and verified
- [ ] ✅ Policy account initialized with correct parameters
- [ ] ✅ Progress account initialized
- [ ] ✅ Honorary position created (if ready)
- [ ] ✅ Distribution crank configured and tested
- [ ] ✅ Event monitoring setup
- [ ] ✅ Devnet testing completed (7+ days recommended)
- [ ] ✅ Security audit completed (for mainnet)
- [ ] ✅ Upgrade authority strategy decided
- [ ] ✅ Emergency procedures documented
- [ ] ✅ Ready for mainnet deployment

---

**Deployment completed by RECTOR on October 4, 2025**

For questions or issues, refer to the main [README.md](./README.md) or open an issue on GitHub.
