/**
 * One-time fix: Assign proper MO-XXX order numbers to any manufacturing orders
 * that were created with a blank orderNumber (due to the previous bug).
 *
 * Run: npx tsx scripts/fix-mo-numbers.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const blanks = await prisma.manufacturingOrder.findMany({
    where: { orderNumber: '' },
    orderBy: { createdAt: 'asc' },
    select: { id: true, createdAt: true },
  });

  if (blanks.length === 0) {
    console.log('✅ No blank manufacturing order numbers found. Nothing to fix.');
    return;
  }

  console.log(`Found ${blanks.length} manufacturing order(s) with blank order numbers. Fixing...`);

  // Find the current max number
  const all = await prisma.manufacturingOrder.findMany({
    where: { NOT: { orderNumber: '' } },
    select: { orderNumber: true },
  });

  const numbers = all
    .map((o) => {
      const m = o.orderNumber?.match(/MO-(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => n > 0);

  let counter = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

  for (const mo of blanks) {
    const orderNumber = `MO-${String(counter).padStart(3, '0')}`;
    await prisma.manufacturingOrder.update({
      where: { id: mo.id },
      data: { orderNumber },
    });
    console.log(`  ✅ Fixed MO ${mo.id} → ${orderNumber}`);
    counter++;
  }

  console.log('Done! All blank manufacturing order numbers have been fixed.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
