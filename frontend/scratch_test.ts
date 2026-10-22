import prisma from './lib/server/db';
import { salesService } from './lib/server/modules/sales/sales.service';

async function test() {
  try {
    console.log('Starting sales order creation test...');
    const products = await prisma.product.findMany({ take: 1 });
    if (products.length === 0) {
      console.log('No products found in database.');
      return;
    }
    const productId = products[0].id;
    console.log('Using Product ID:', productId);

    const result = await salesService.create({
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '1234567890',
      notes: 'Test notes',
      items: [{
        productId,
        quantityOrdered: 2,
        unitPrice: 100
      }]
    }, 'e3f94723-cd8e-4a67-b50a-115f21223df1', 'Test User', 'sales');
    console.log('Success:', result);
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
