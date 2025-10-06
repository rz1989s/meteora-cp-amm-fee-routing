import { Connection, PublicKey } from "@solana/web3.js";

const STREAMFLOW_PROGRAM = new PublicKey("strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m");
const MAINNET_RPC = "https://api.mainnet-beta.solana.com";

async function main() {
  const connection = new Connection(MAINNET_RPC, "confirmed");

  console.log("🔍 Finding Streamflow PDA accounts on mainnet...\n");

  const seeds = ["metadata", "treasury", "fee_oracle", "partner", "withdrawor"];

  for (const seed of seeds) {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from(seed)],
      STREAMFLOW_PROGRAM
    );

    try {
      const accountInfo = await connection.getAccountInfo(pda);
      if (accountInfo) {
        console.log(`✅ ${seed.padEnd(15)}: ${pda.toBase58()} (${accountInfo.data.length} bytes, owner: ${accountInfo.owner.toBase58()})`);
      } else {
        console.log(`❌ ${seed.padEnd(15)}: ${pda.toBase58()} (not found)`);
      }
    } catch (err) {
      console.log(`❌ ${seed.padEnd(15)}: ${pda.toBase58()} (error)`);
    }
  }
}

main();
