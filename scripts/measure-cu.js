const { Connection } = require('@solana/web3.js');

const connection = new Connection('https://devnet.helius-rpc.com/?api-key=142fb48a-aa24-4083-99c8-249df5400b30');

const transactions = [
  '3eh7F61gx7SZrVk3xsvg2QCwPq5qPuHA8RMp7LjC6xQUvui3GTmVtA3QUK2gYd9YAWZ8JLR6nWfJhVkpfEEQjWoe', // Latest
  '58Q6gYCoZ6oVg3xvp9fYpTNjgPeKPhk8pXL4QGvLDTtqPLSoySz6GmwEYS6gXHxcmVGSmDfNeMxWPeqoax4w4Boy',
  '4PP13SH38CDSBaGooYpLELkPoeEs3y9kji6bGhTzKKsuAgMeQ1fVEeL7HK5qZ6oxkbemnsTsncVeRk4S9VZQhVQz',
  '5eQfFPFqEaBrZTcgXk8pbqSrTF5ttniSrYFCaLH5uuSsJn41ggWSG7m9Br7GUQpT9YuGcqffnEmy4EYrcjDoQxBA',
];

async function analyzeCU() {
  console.log('\n=== Compute Unit Analysis ===\n');

  for (const sig of transactions) {
    try {
      const tx = await connection.getTransaction(sig, { maxSupportedTransactionVersion: 0 });

      if (tx && tx.meta) {
        const cu = tx.meta.computeUnitsConsumed;
        const logs = tx.meta.logMessages || [];

        // Find instruction name from logs
        const programLogs = logs.filter(log => log.includes('Program RECTGNmLAQ3jBmp4NV2c3RFuKjfJn2SQTnqrWka4wce invoke') || log.includes('Instruction:'));
        const instructionLine = logs.find(log => log.includes('Instruction:'));

        console.log(`Transaction: ${sig.substring(0, 16)}...`);
        console.log(`  CU Consumed: ${cu}`);
        if (instructionLine) {
          console.log(`  Instruction: ${instructionLine.trim()}`);
        }
        console.log('');
      }
    } catch (error) {
      console.log(`  Error fetching ${sig.substring(0, 16)}...: ${error.message}`);
    }
  }

  console.log('=================================\n');
}

analyzeCU().catch(console.error);
