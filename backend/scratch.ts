import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: 'osindi', mode: 'insensitive' } },
        { name: { contains: 'job', mode: 'insensitive' } },
      ]
    }
  });
  console.log(users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
