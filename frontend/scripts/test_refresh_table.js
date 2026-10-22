const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const count = await prisma.$queryRaw`SELECT COUNT(*) FROM refresh_tokens`;
  console.log('Refresh tokens row count:', count);
  console.log('Has prisma.refreshToken model on client:', !!prisma.refreshToken);
  await prisma.$disconnect();
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
