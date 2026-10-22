import fs from 'fs';
import path from 'path';

// Load .env manually to ensure database connections are configured correctly
try {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.warn('Failed to load .env file manually:', e);
}

import prisma from './lib/server/db';
import { salesService } from './lib/server/modules/sales/sales.service';
import { manufacturingService } from './lib/server/modules/manufacturing/manufacturing.service';

async function main() {
  console.log('================================================================');
  console.log('🚀 STARTING PRODUCTION REJECTION & TIMELINE INTEGRATION TEST');
  console.log('================================================================\n');

  try {
    // 1. Ensure test users exist
    let salesUser = await prisma.user.findFirst({ where: { role: 'sales' } });
    if (!salesUser) {
      salesUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    }
    let pmUser = await prisma.user.findFirst({ where: { role: 'product_manager' } });
    if (!pmUser) {
      pmUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    }
    if (!salesUser || !pmUser) {
      throw new Error('❌ Test requires existing sales/pm/admin users.');
    }

    console.log(`👤 Sales Executive: ${salesUser.name} | PM: ${pmUser.name}`);

    // 2. Ensure finished good product exists with BOM
    let finishedGood = await prisma.product.findFirst({
      where: {
        productType: 'finished_good',
        isActive: true,
        bomHeaders: { some: { isActive: true } },
      },
      include: {
        bomHeaders: true,
      },
    });

    if (!finishedGood) {
      throw new Error('❌ Test requires at least one active finished good product with a Bill of Materials (BOM).');
    }
    console.log(`📦 Finished Good: ${finishedGood.name} (SKU: ${finishedGood.sku})`);

    // 3. Create a Sales Order that exceeds current stock levels to guarantee a shortage
    const orderQty = Number(finishedGood.onHandQuantity) + 10;
    console.log(`\n🔹 STEP 1: Creating sales order with quantity ${orderQty} (exceeding stock of ${finishedGood.onHandQuantity})...`);
    
    const salesOrder = await salesService.create(
      {
        customerName: 'Test Rejection Customer',
        customerEmail: 'reject@test.com',
        customerPhone: '+91 99999 00000',
        notes: 'Priority delivery needed.',
        items: [
          {
            productId: finishedGood.id,
            quantityOrdered: orderQty,
            unitPrice: 1500,
          },
        ],
      },
      salesUser.id,
      salesUser.name,
      salesUser.role
    );
    console.log(`✅ Sales Order Created: ${salesOrder.orderNumber} (Status: ${salesOrder.status})`);

    // 4. Run stock check/confirm to trigger shortage detection
    console.log(`\n🔹 STEP 2: Running stock check on Sales Order...`);
    const confirmedOrder = await salesService.confirm(
      salesOrder.id,
      salesUser.id,
      salesUser.name,
      salesUser.role
    );
    console.log(`✅ Stock check completed. Sales Order Status: ${confirmedOrder.status}`);

    // 5. Trigger production request (manufacturing order)
    console.log(`\n🔹 STEP 3: Requesting production run...`);
    const mos = await manufacturingService.createFromSalesOrder(
      salesOrder.id,
      pmUser.id,
      pmUser.name,
      pmUser.role
    );
    if (mos.length === 0) {
      throw new Error('❌ Test Failed: No manufacturing orders were created.');
    }
    const draftMo = mos[0];
    console.log(`✅ Manufacturing Order Created: ${draftMo.orderNumber} (Status: ${draftMo.status})`);

    // 6. PM rejects the production request
    const rejectReason = 'Capacity Full';
    console.log(`\n🔹 STEP 4: Product Manager rejects the production request. Reason: ${rejectReason}...`);
    const rejectedMo = await manufacturingService.reject(
      draftMo.id,
      rejectReason,
      pmUser.id,
      pmUser.name,
      pmUser.role
    );
    console.log(`✅ Manufacturing Order Rejected! New MO Status: ${rejectedMo.status}`);

    // 7. Verify Sales Order notes update
    console.log(`\n🔹 STEP 5: Verifying Sales Order notes contain the rejection notice...`);
    const updatedSalesOrder = await prisma.salesOrder.findUnique({
      where: { id: salesOrder.id },
    });
    console.log(`   Sales Order Status: ${updatedSalesOrder?.status}`);
    console.log(`   Sales Order Notes:\n   --------------------\n   ${updatedSalesOrder?.notes?.replace(/\n/g, '\n   ')}\n   --------------------`);

    if (!updatedSalesOrder?.notes?.includes('[Production Rejected]')) {
      throw new Error('❌ Test Failed: Notes do not contain "[Production Rejected]" prefix.');
    }
    if (!updatedSalesOrder?.notes?.includes(`Rejection reason: ${rejectReason}`)) {
      throw new Error(`❌ Test Failed: Notes do not contain the rejection reason: "${rejectReason}".`);
    }

    // 8. Test Timeline formatting logic
    console.log(`\n🔹 STEP 6: Validating timeline step formatting for the rejection event...`);
    const mockOrderForTimeline = {
      ...updatedSalesOrder,
      items: [
        {
          product: { name: finishedGood.name },
        },
      ],
      manufacturingOrders: [rejectedMo],
    };

    // Step 2 timeline builder logic
    const buildStep2 = (order: any) => {
      const timelineMos = order.manufacturingOrders || [];
      const primaryMo = timelineMos[0];
      
      let pmStatus: 'checked' | 'pending' | 'failed' = 'pending';
      let pmDetails = 'Awaiting decision on production feasibility.';
      let pmTimestamp = undefined;
      let pmLabel = 'PM Approved';

      if (timelineMos.length > 0) {
        const isRejected = primaryMo.status === 'cancelled';
        const isApproved = ['confirmed', 'in_progress', 'completed'].includes(primaryMo.status);
        if (isRejected) {
          pmStatus = 'failed';
          pmLabel = 'Rejected Criteria';
          const rejectMatch = primaryMo.notes?.match(/Reason:\s*([^\n\r]+)/);
          const reasonStr = rejectMatch ? rejectMatch[1] : 'Capacity constraints or material missing';
          pmDetails = `Rejection reason: ${reasonStr}.`;
          pmTimestamp = primaryMo.updatedAt;
        } else if (isApproved) {
          pmStatus = 'checked';
          pmDetails = `PM approved production run.`;
          pmTimestamp = primaryMo.updatedAt;
        }
      }

      return { label: pmLabel, status: pmStatus, details: pmDetails };
    };

    const step2 = buildStep2(mockOrderForTimeline);
    console.log(`📋 Reconstructed Step 2 details:`);
    console.log(`   Label:   ${step2.label}`);
    console.log(`   Status:  ${step2.status}`);
    console.log(`   Details: ${step2.details}`);

    if (step2.label !== 'Rejected Criteria') {
      throw new Error('❌ Test Failed: Step label should be "Rejected Criteria".');
    }
    if (step2.status !== 'failed') {
      throw new Error('❌ Test Failed: Step status should be "failed".');
    }
    if (!step2.details.includes(rejectReason)) {
      throw new Error(`❌ Test Failed: Step details should include the rejection reason: "${rejectReason}".`);
    }

    console.log('\n================================================================');
    console.log('🎉 REJECTION & TIMELINE TESTS COMPLETED SUCCESSFULLY!');
    console.log('================================================================');

  } catch (error) {
    console.error('\n❌ ERROR RUNNING REJECTION FLOW TEST:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
