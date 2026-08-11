import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const ledgers = await prisma.ledger.findMany();
  let savings = 0;
  let shares = 0;
  let loans = 0;
  for (const l of ledgers) {
    savings += l.savingsBalance;
    shares += l.sharesBalance;
    loans += l.activeLoanBalance;
  }
  console.log(`Savings: ${savings}, Shares: ${shares}, Loans: ${loans}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
