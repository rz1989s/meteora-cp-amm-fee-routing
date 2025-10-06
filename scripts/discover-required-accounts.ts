/**
 * Account Discovery Script for Local Validator Setup
 *
 * Discovers all accounts needed by CP-AMM and Streamflow SDKs
 * to run on local validator.
 *
 * Usage: ts-node scripts/discover-required-accounts.ts
 */

import { Connection, PublicKey } from "@solana/web3.js";

const STREAMFLOW_PROGRAM = new PublicKey("strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m");
const CP_AMM_PROGRAM = new PublicKey("cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG");

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

async function discoverStreamflowAccounts(connection: Connection) {
  console.log(`\n${colors.cyan}${colors.bright}Streamflow Account Discovery${colors.reset}`);
  console.log("=".repeat(40));

  const seeds = [
    "treasury",
    "metadata",
    "withdrawor",
    "authority",
    "fee_collector",
    "partner",
    "config",
    "global",
  ];

  const foundAccounts: string[] = [];

  for (const seed of seeds) {
    try {
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from(seed)],
        STREAMFLOW_PROGRAM
      );

      const accountInfo = await connection.getAccountInfo(pda);
      if (accountInfo) {
        console.log(`${colors.green}✅ ${seed.padEnd(20)}${colors.reset} ${pda.toBase58()}`);
        foundAccounts.push(pda.toBase58());
      } else {
        console.log(`${colors.yellow}⚠️  ${seed.padEnd(20)}${colors.reset} Not found (may not exist)`);
      }
    } catch (err: any) {
      console.log(`${colors.red}❌ ${seed.padEnd(20)}${colors.reset} Error: ${err.message}`);
    }
  }

  return foundAccounts;
}

async function discoverCpAmmAccounts(connection: Connection) {
  console.log(`\n${colors.cyan}${colors.bright}CP-AMM Account Discovery${colors.reset}`);
  console.log("=".repeat(40));

  // Known config
  const knownConfig = new PublicKey("8CNy9goNQNLM4wtgRw528tUQGMKD3vSuFRZY2gLGLLvF");
  console.log(`${colors.green}✅ config${colors.reset}              ${knownConfig.toBase58()}`);

  const seeds = [
    "authority",
    "treasury",
    "fee_collector",
    "token_badge",
  ];

  const foundAccounts: string[] = [knownConfig.toBase58()];

  for (const seed of seeds) {
    try {
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from(seed)],
        CP_AMM_PROGRAM
      );

      const accountInfo = await connection.getAccountInfo(pda);
      if (accountInfo) {
        console.log(`${colors.green}✅ ${seed.padEnd(20)}${colors.reset} ${pda.toBase58()}`);
        foundAccounts.push(pda.toBase58());
      } else {
        console.log(`${colors.yellow}⚠️  ${seed.padEnd(20)}${colors.reset} Not found (may not exist)`);
      }
    } catch (err: any) {
      console.log(`${colors.red}❌ ${seed.padEnd(20)}${colors.reset} Error: ${err.message}`);
    }
  }

  return foundAccounts;
}

async function generateValidatorCommand(cpAmmAccounts: string[], streamflowAccounts: string[]) {
  console.log(`\n${colors.cyan}${colors.bright}Recommended Validator Command${colors.reset}`);
  console.log("=".repeat(40));

  const allAccounts = [
    CP_AMM_PROGRAM.toBase58(),
    ...cpAmmAccounts,
    STREAMFLOW_PROGRAM.toBase58(),
    ...streamflowAccounts,
  ];

  // Remove duplicates
  const uniqueAccounts = [...new Set(allAccounts)];

  console.log(`\n${colors.bright}solana-test-validator \\${colors.reset}`);
  uniqueAccounts.forEach((account, index) => {
    const isLast = index === uniqueAccounts.length - 1;
    const suffix = isLast ? " \\" : " \\";
    console.log(`  --clone ${account}${suffix}`);
  });
  console.log(`  --url devnet \\`);
  console.log(`  --reset`);

  console.log(`\n${colors.bright}Total accounts to clone: ${colors.green}${uniqueAccounts.length}${colors.reset}`);

  // Save to file
  const fs = require("fs");
  const command = `solana-test-validator \\\n` +
    uniqueAccounts.map(acc => `  --clone ${acc}`).join(" \\\n") +
    ` \\\n  --url devnet \\\n  --reset\n`;

  fs.writeFileSync("validator-command.sh", command);
  console.log(`\n${colors.green}✅ Saved to: validator-command.sh${colors.reset}`);
  console.log(`   Run: bash validator-command.sh\n`);
}

async function main() {
  console.log(`${colors.bright}${colors.cyan}╔═══════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║  Account Discovery for Local Validator Setup  ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚═══════════════════════════════════════════════╝${colors.reset}`);

  console.log(`\n${colors.yellow}Connecting to Solana devnet...${colors.reset}`);
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  try {
    await connection.getVersion();
    console.log(`${colors.green}✅ Connected to devnet${colors.reset}`);
  } catch (err: any) {
    console.error(`${colors.red}❌ Failed to connect: ${err.message}${colors.reset}`);
    process.exit(1);
  }

  // Discover accounts
  const cpAmmAccounts = await discoverCpAmmAccounts(connection);
  const streamflowAccounts = await discoverStreamflowAccounts(connection);

  // Generate validator command
  await generateValidatorCommand(cpAmmAccounts, streamflowAccounts);

  console.log(`\n${colors.cyan}${colors.bright}Next Steps:${colors.reset}`);
  console.log(`1. Review the accounts found above`);
  console.log(`2. Run: ${colors.green}bash validator-command.sh${colors.reset}`);
  console.log(`3. Run: ${colors.green}npm run setup:local${colors.reset}`);
  console.log(``);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n${colors.red}Error:${colors.reset}`, err.message);
    console.error(err);
    process.exit(1);
  });
