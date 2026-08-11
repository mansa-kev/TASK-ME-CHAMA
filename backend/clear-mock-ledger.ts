import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.journalVoucher.deleteMany({
    where: {
      OR: [
        { postedBy: 'TREASURER' },
        { postedBy: 'SECRETARY' }
      ]
    }
  });
  console.log('Deleted mock journal vouchers:', result.count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
