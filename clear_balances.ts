import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.payment.deleteMany({});
  await prisma.ledger.updateMany({
    data: {
      savingsBalance: 0,
      sharesBalance: 0,
      activeLoanBalance: 0
    }
  });
  console.log("Cleared mock financial data!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
