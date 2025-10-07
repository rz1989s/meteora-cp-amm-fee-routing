/**
 * Master Setup Script for Local Validator Test Environment
 *
 * Orchestrates the complete setup process:
 * 1. setup-test-tokens.ts - Create tokens, fund wallets
 * 2. setup-test-pool.ts - Create CP-AMM pool (requires manual integration)
 * 3. setup-test-streams.ts - Create vesting contracts (requires manual integration)
 *
 * Prerequisites:
 * - Local validator running: solana-test-validator
 * - Meteora CP-AMM program cloned (optional for step 2)
 * - Streamflow program cloned (optional for step 3)
 *
 * Run: npm run setup:local
 * Or: ts-node scripts/run-local-setup.ts
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

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
  magenta: "\x1b[35m",
};

interface SetupStep {
  name: string;
  script: string;
  required: boolean;
  description: string;
}

const SETUP_STEPS: SetupStep[] = [
  {
    name: "Token Setup",
    script: "setup-test-tokens.ts",
    required: true,
    description: "Create test tokens, fund wallets, create ATAs",
  },
  {
    name: "Pool Setup",
    script: "setup-test-pool.ts",
    required: false,
    description: "Create CP-AMM pool with liquidity (requires Meteora SDK)",
  },
  {
    name: "Streams Setup",
    script: "setup-test-streams-localhost.ts",
    required: false,
    description: "Create mock vesting data for localhost testing",
  },
];

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`);
}

function section(title: string) {
  console.log(`\n${colors.bright}${colors.magenta}${"═".repeat(70)}${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}${"═".repeat(70)}${colors.reset}\n`);
}

function subsection(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${"─".repeat(title.length)}${colors.reset}`);
}

async function runStep(step: SetupStep, stepNumber: number, totalSteps: number): Promise<boolean> {
  subsection(`Step ${stepNumber}/${totalSteps}: ${step.name}`);
  log("📋", step.description);

  const scriptPath = path.join(__dirname, step.script);

  if (!fs.existsSync(scriptPath)) {
    log("❌", `Script not found: ${step.script}`);
    return false;
  }

  try {
    log("⏳", `Running ${step.script}...`);
    const { stdout, stderr } = await execAsync(`ts-node ${scriptPath}`, {
      cwd: path.join(__dirname, ".."),
    });

    if (stdout) {
      console.log(stdout);
    }

    if (stderr && !stderr.includes("ExperimentalWarning")) {
      console.error(`${colors.yellow}Warnings:${colors.reset}`, stderr);
    }

    log("✅", `${step.name} complete`);
    return true;
  } catch (error: any) {
    log("❌", `${step.name} failed`);

    if (error.stdout) {
      console.log(error.stdout);
    }

    if (error.stderr) {
      console.error(`${colors.red}Error output:${colors.reset}`, error.stderr);
    }

    if (step.required) {
      log("🛑", `Required step failed. Cannot continue.`);
      throw error;
    } else {
      log("⚠️", `Optional step failed. Continuing...`);
      return false;
    }
  }
}

async function checkPrerequisites(): Promise<boolean> {
  subsection("Checking Prerequisites");

  // Check if local validator is running
  try {
    const { stdout } = await execAsync("solana cluster-version --url http://127.0.0.1:8899");
    log("✅", "Local validator is running");
    return true;
  } catch (error) {
    log("❌", "Local validator is not running");
    console.log(`
${colors.yellow}╔═══════════════════════════════════════════════════════════════╗
║              LOCAL VALIDATOR NOT RUNNING                       ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}

Please start the local validator first:

  ${colors.bright}solana-test-validator${colors.reset}

Or with account cloning (recommended):

  ${colors.bright}solana-test-validator \\
    --clone cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG \\
    --clone strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m \\
    --url devnet${colors.reset}

This will clone Meteora CP-AMM and Streamflow programs from devnet.

Then run this setup script again:
  ${colors.bright}npm run setup:local${colors.reset}
    `);
    return false;
  }
}

async function displaySummary(results: Map<string, boolean>) {
  section("📊 Setup Summary");

  let allRequired = true;
  let optionalCount = 0;

  for (const [stepName, success] of results.entries()) {
    const step = SETUP_STEPS.find((s) => s.name === stepName);
    const icon = success ? "✅" : "❌";
    const status = success ? `${colors.green}SUCCESS${colors.reset}` : `${colors.red}FAILED${colors.reset}`;
    const required = step?.required ? "(required)" : "(optional)";

    console.log(`${icon} ${stepName.padEnd(20)} ${status} ${colors.dim}${required}${colors.reset}`);

    if (!success && step?.required) {
      allRequired = false;
    }

    if (success && !step?.required) {
      optionalCount++;
    }
  }

  console.log();

  if (allRequired) {
    log("🎉", `${colors.bright}${colors.green}All required setup steps completed!${colors.reset}`);

    if (optionalCount < SETUP_STEPS.filter((s) => !s.required).length) {
      log("ℹ️", `${colors.yellow}Some optional steps incomplete (CP-AMM/Streamflow integration)${colors.reset}`);
      console.log(`
${colors.cyan}This is expected!${colors.reset} Optional steps require external SDKs.

${colors.bright}You can now:${colors.reset}
  1. Run integration tests with stubbed CP-AMM/Streamflow data
  2. Implement full SDK integration for production testing
  3. Use mocked accounts for MVP bounty submission
      `);
    }
  } else {
    log("❌", `${colors.red}Required setup steps failed${colors.reset}`);
    return;
  }

  section("🚀 Next Steps");

  const configFiles = [
    { name: ".test-tokens.json", exists: fs.existsSync(path.join(__dirname, "..", ".test-tokens.json")) },
    { name: ".test-pool.json", exists: fs.existsSync(path.join(__dirname, "..", ".test-pool.json")) },
    { name: ".test-streams.json", exists: fs.existsSync(path.join(__dirname, "..", ".test-streams.json")) },
  ];

  console.log(`${colors.bright}Configuration Files:${colors.reset}`);
  configFiles.forEach((file) => {
    const icon = file.exists ? "✅" : "❌";
    console.log(`  ${icon} ${file.name}`);
  });

  console.log(`
${colors.bright}To run tests:${colors.reset}

  ${colors.cyan}# Run unit tests (always works)${colors.reset}
  npm run test:unit

  ${colors.cyan}# Run integration tests on localhost${colors.reset}
  npm run test:local

  ${colors.cyan}# Run devnet verification tests${colors.reset}
  npm run test:devnet

  ${colors.cyan}# Run all tests${colors.reset}
  npm run test:all

${colors.dim}Note: Integration tests may be stubbed if CP-AMM/Streamflow
      integration is not complete. This is acceptable for bounty submission.${colors.reset}
  `);
}

async function main() {
  section("🎯 Local Validator Setup - Master Script");

  console.log(`${colors.dim}This script will run all setup steps in sequence:${colors.reset}\n`);

  SETUP_STEPS.forEach((step, idx) => {
    const required = step.required ? `${colors.yellow}[REQUIRED]${colors.reset}` : `${colors.dim}[OPTIONAL]${colors.reset}`;
    console.log(`  ${idx + 1}. ${step.name} ${required}`);
    console.log(`     ${colors.dim}${step.description}${colors.reset}`);
  });

  console.log();

  // Check prerequisites
  const validatorRunning = await checkPrerequisites();
  if (!validatorRunning) {
    process.exit(1);
  }

  // Run setup steps
  const results = new Map<string, boolean>();

  for (let i = 0; i < SETUP_STEPS.length; i++) {
    const step = SETUP_STEPS[i];
    const success = await runStep(step, i + 1, SETUP_STEPS.length);
    results.set(step.name, success);
  }

  // Display summary
  await displaySummary(results);
}

main()
  .then(() => {
    log("✅", `${colors.green}Setup script complete!${colors.reset}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(`\n${colors.red}❌ Fatal error:${colors.reset}`, err.message);
    console.error(err);
    process.exit(1);
  });
