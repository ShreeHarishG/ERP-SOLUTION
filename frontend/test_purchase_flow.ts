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
import { purchaseService } from './lib/server/modules/purchase/purchase.service';

async function main() {
  console.log('================================================================');
  console.log('🚀 STARTING PROCUREMENT WORKFLOW & INVOICE INTEGRATION TEST');
  console.log('================================================================\n');

  try {
    // 1. Ensure a user exists to act as the procurement manager
    let testUser = await prisma.user.findFirst({
      where: { role: 'purchase' },
    });
    if (!testUser) {
      testUser = await prisma.user.findFirst({
        where: { role: 'admin' },
      });
    }
    if (!testUser) {
      console.log('ℹ️ No purchase or admin user found. Creating a temporary test user...');
      testUser = await prisma.user.create({
        data: {
          name: 'Test Purchase Manager',
          email: 'test_pm@chainiq.com',
          passwordHash: 'dummy-hash',
          role: 'purchase',
        },
      });
    }
    console.log(`👤 Using Actor: ${testUser.name} (Role: ${testUser.role}, ID: ${testUser.id})`);

    // 2. Ensure we have a raw material product to procure
    let rawMaterial = await prisma.product.findFirst({
      where: {
        productType: 'raw_material',
        procurementType: 'purchase',
      },
    });

    if (!rawMaterial) {
      console.log('ℹ️ No raw material product found. Creating test raw material product...');
      rawMaterial = await prisma.product.create({
        data: {
          name: 'Raw Oak Timber Plank',
          sku: 'RAW-OAK-PLANK-TEST',
          productType: 'raw_material',
          procurementType: 'purchase',
          costPrice: 250.00,
          salesPrice: 0.00,
          onHandQuantity: 10.00,
          unitOfMeasure: 'pcs',
        },
      });
    }
    console.log(`📦 Using Product: ${rawMaterial.name} (SKU: ${rawMaterial.sku}, Cost: ₹${rawMaterial.costPrice})`);
    console.log(`   Initial On-Hand Inventory: ${Number(rawMaterial.onHandQuantity)} ${rawMaterial.unitOfMeasure}\n`);

    // 3. Ensure at least two vendors exist in the registry
    let vendors = await prisma.vendor.findMany({ take: 2 });
    if (vendors.length < 2) {
      console.log('ℹ️ Seeding default vendors for the RFQ process...');
      const defaultVendors = [
        { name: 'Global Timber Ltd', email: 'sales@globaltimber.com', phone: '+91 88888 77777' },
        { name: 'Apex Fasteners Corp', email: 'info@apexfasteners.com', phone: '+91 77777 66666' },
      ];
      for (const v of defaultVendors) {
        await prisma.vendor.upsert({
          where: { name: v.name },
          update: {},
          create: v,
        });
      }
      vendors = await prisma.vendor.findMany({ take: 2 });
    }
    const vendorNames = vendors.map(v => v.name);
    console.log(`🤝 Target Vendor Registry Partners: ${vendorNames.join(', ')}\n`);

    // 4. Create a Purchase Order in draft status
    console.log('🔹 STEP 1: Creating draft purchase request...');
    const po = await purchaseService.create(
      {
        productId: rawMaterial.id,
        quantity: 50,
      },
      testUser.id,
      testUser.name,
      testUser.role
    );
    console.log(`✅ Purchase Order Created: ${po.orderNumber} (Status: ${po.status})`);
    console.log(`   Assigned Vendor: ${po.vendorName}`);
    console.log(`   Estimated Amount: ₹${Number(po.totalAmount).toLocaleString('en-IN')}\n`);

    // 5. Send RFQ to target vendors
    console.log('🔹 STEP 2: Procurement manager verifies PO and requests quotations from vendors...');
    const poWithRfq = await purchaseService.sendRFQ(
      po.id,
      { vendorNames },
      testUser.id,
      testUser.name,
      testUser.role
    );
    console.log(`✅ RFQ Dispatched. Vendor status: ${poWithRfq.vendorName}`);
    console.log(`   Internal Logs: ${poWithRfq.notes?.split('\n').pop()}`);

    // Query database for quotation bids stored
    const quotations = await prisma.vendorQuotation.findMany({
      where: { purchaseOrderId: po.id },
    });
    console.log(`\n📋 Quotations stored in database for ${po.orderNumber}:`);
    quotations.forEach((q, idx) => {
      console.log(`   [Quote ${idx + 1}] Vendor: ${q.vendorName} | Amount: ₹${Number(q.totalAmount).toLocaleString('en-IN')} | Days: ${q.deliveryDays} | Rating: ★${q.rating} | Status: ${q.status}`);
    });
    console.log('');

    // 6. Evaluate and select a quotation (we will select the first vendor's quotation)
    const selectedQuote = quotations[0];
    console.log(`🔹 STEP 3: Evaluating bids and selecting quotation from vendor: ${selectedQuote.vendorName}...`);
    const poWithSelection = await purchaseService.selectQuotation(
      po.id,
      {
        vendorName: selectedQuote.vendorName,
        vendorEmail: selectedQuote.vendorEmail || undefined,
        vendorPhone: selectedQuote.vendorPhone || undefined,
        totalAmount: Number(selectedQuote.totalAmount),
      },
      testUser.id,
      testUser.name,
      testUser.role
    );
    console.log(`✅ Quote Selected. Purchase Order Updated:`);
    console.log(`   Selected Vendor: ${poWithSelection.vendorName}`);
    console.log(`   Final Total Amount: ₹${Number(poWithSelection.totalAmount).toLocaleString('en-IN')}`);
    console.log(`   Status: ${poWithSelection.status} (Ready to Dispatch)`);

    // Verify rejection of other quotes
    const updatedQuotes = await prisma.vendorQuotation.findMany({
      where: { purchaseOrderId: po.id },
    });
    console.log(`   Quotation Statuses:`, updatedQuotes.map(q => `${q.vendorName} -> ${q.status}`));
    console.log('');

    // 7. Dispatch the Purchase Order (triggers automatic Invoice creation)
    console.log('🔹 STEP 4: Procurement manager dispatches the Purchase Order to the vendor...');
    const confirmedPo = await purchaseService.confirmPO(
      po.id,
      testUser.id,
      testUser.name,
      testUser.role
    );
    console.log(`✅ Purchase Order Confirmed & Dispatched! Status: ${confirmedPo.status}`);
    
    // Check if supplier invoice was generated
    const invoice = await prisma.invoice.findFirst({
      where: { purchaseOrderId: po.id },
    });
    if (!invoice) {
      throw new Error('❌ Test Failed: Invoice was not created in the database.');
    }
    console.log(`\n🧾 Supplier Invoice Generated:`);
    console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
    console.log(`   Vendor Name:    ${invoice.vendorName}`);
    console.log(`   Amount:         ₹${Number(invoice.amount).toLocaleString('en-IN')}`);
    console.log(`   Invoice Status: ${invoice.status}`);
    console.log('');

    // 8. Simulate Inventory Manager verifying incoming receipt & invoice values
    console.log('🔹 STEP 5: Inventory manager verifies incoming cargo receipt & matches with PO and Invoice...');
    
    // Find or create an inventory user
    let inventoryUser = await prisma.user.findFirst({
      where: { role: 'inventory' },
    });
    if (!inventoryUser) {
      inventoryUser = testUser;
    }
    console.log(`👤 Verification performed by Inventory Manager: ${inventoryUser.name} (Role: ${inventoryUser.role})`);

    const receivedPo = await purchaseService.receiveMaterials(
      po.id,
      { checkResult: 'approve' },
      inventoryUser.id,
      inventoryUser.name,
      inventoryUser.role
    );
    console.log(`✅ Shipment Verified and Receipt Approved! PO Status: ${receivedPo.status}`);

    // Verify invoice status update
    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
    });
    console.log(`   Updated Invoice Status: ${updatedInvoice?.status}`);

    // Verify inventory level increase
    const updatedProduct = await prisma.product.findUnique({
      where: { id: rawMaterial.id },
    });
    console.log(`\n📈 Inventory levels post-receipt:`);
    console.log(`   On-Hand Quantity: ${Number(updatedProduct?.onHandQuantity)} ${updatedProduct?.unitOfMeasure} (was ${Number(rawMaterial.onHandQuantity)} ${rawMaterial.unitOfMeasure})`);

    // Verify inventory movement record
    const movement = await prisma.inventoryMovement.findFirst({
      where: { referencePoId: po.id },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`   Logged Movement: Type: ${movement?.movementType} | Quantity: +${Number(movement?.quantity)} | Direction: ${movement?.direction}`);

    console.log('\n================================================================');
    console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('================================================================');

  } catch (error) {
    console.error('\n❌ ERROR RUNNING TEST FLOW:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
